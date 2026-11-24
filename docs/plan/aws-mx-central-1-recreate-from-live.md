# Recreate the live AWS stage environment in `mx-central-1`

Source of truth: account `211125514217`, region `us-east-1`, inspected read-only on 2026-11-17 with the `Properlia-Infrastructure-Audit` user. This plan complements `aws-mx-central-1-migration.md` (repo-derived: pipeline, secrets, cutover). Where the two disagree, this one reflects live state.

## Live inventory (us-east-1)

| Layer | Resource | Configuration |
|---|---|---|
| Compute | EC2 `stage-properlia-api` | `t3.medium`, Ubuntu 24.04 amd64, key pair `Ec2-properlia`, IMDS `required`, profile `ProperliaEC2SSMRole`, subnet 10.0.3.0/24 (public) |
| Disk | EBS 40 GB | gp3, 3000 IOPS, **not encrypted** |
| IP | Elastic IP | associated to the instance |
| Database | RDS `properlia-api-stage-db` | Postgres 17.9, `db.t4g.micro`, 25 GB gp2 (autoscale to 30), single-AZ, private, encrypted, 1-day backups, default param group `default.postgres17`, no deletion protection |
| Storage | S3 `proper-api-assets-stage` | 812 objects, about 358 MiB, versioning on, SSE-S3, no policy, no CORS, **Block Public Access off** |
| Registry | ECR `edxco/properlia` | mutable tags, scan on push, AES256; tags `<service>-stage-<sha>` |
| Network | VPC 10.0.0.0/16 (non-default) | 3 subnets: 10.0.3.0/24 (1a, public), 10.0.1.0/24 (1a), 10.0.2.0/24 (1b), Internet Gateway, no NAT |
| Security groups | 8 | only two are needed (see Phase 1); the rest are leftovers |
| Secrets | Secrets Manager, 5 | `stage/postgres`, `properlia/stage/postgres`, `properlia/rails/secret_key_base`, `properlia/rails/master_key`, `role/EC2push` |
| IAM (global) | `ProperliaEC2SSMRole` (created 2026-11-17, replaced the removed `EC2Role-ECRAccess`), GitHub OIDC role | IAM is not regional. `ProperliaEC2SSMRole` is attached to the suspected-compromised host: do not reuse it on the new host (see Security) |

Not present live: KMS customer keys, Glue databases, NAT gateways.

## What changes versus a 1:1 copy

| Item | Live | In `mx-central-1` | Why |
|---|---|---|---|
| Extra SGs (`properlia-ec2-migrations-sg`, `ec2-rds-1`, `rds-ec2-1`, `default`) | leftover | **do not recreate** | Empty or redundant; keep one EC2 SG |
| EBS encryption | off | **on** | No cost, no downside |
| S3 Block Public Access | off | **all four on** | Bucket has no policy or CORS; confirm Active Storage serves via presigned URLs before cutover |
| Database | RDS Postgres 17.9 (0 connections in 14 days) | Postgres 15.14 container on the EC2 | The app uses the container (compose hardcodes `db:5432`, dump header says 15.14); RDS is idle and is not recreated |
| Bucket name | `proper-api-assets-stage` | new global name, e.g. `proper-api-assets-stage-mx` | S3 names are global |
| Subnets | one public, two others | one public subnet for the EC2 | No RDS, so the two extra subnets are not needed |
| Extra buckets | none | `proper-db-backups-stage-mx` (nightly dumps), `proper-cloudtrail-stage-mx` (trail logs) | Backups and detection for the container database and the new region |

## Confirmed available in `mx-central-1`
- Region is enabled for the account and has 3 AZs (`mx-central-1a/b/c`).
- `t3.medium` is offered.

## Decisions to settle first
1. **Database: decided, container.** The app uses the `postgres:15` container (`DATABASE_URL` points to `db:5432` in the compose files; the dump header says "Dumped from database version 15.14"). The live RDS Postgres 17.9 had 0 connections in 14 days and is not recreated. Keep the container on the same major version as the dump (15), pinned to `postgres:15.14`. If the data outgrows the instance later, moving to RDS is a dump and restore.
2. **Secrets Manager.** Find out what reads the 5 secrets (host scripts, pipeline, app). Recreate only those still in use, with **new values**; do not copy secret values across regions. `role/EC2push` is an unusual name: confirm its purpose first.
3. **IMDS access from containers.** Live IMDS is `required` (hop limit not captured). The backend and scheduler load S3 credentials from instance metadata, which needs hop limit 2, but that also lets every other container read the role credentials. Resolved in the Security section: only the backend and scheduler may reach the metadata endpoint.
4. **IAM scope.** Do not reuse `ProperliaEC2SSMRole`. Create a new role for the new host and scope the OIDC role to the new repo; details in the Security section.
5. **Cutover method.** Decided: build first, then a short maintenance window for the final data move and the Cloudflare switch (see "Maintenance window"). The old host is isolated, not a rollback target.

## Security: suspected compromise of the stage host

Status: suspected, entry point not confirmed (frontend container suspected). Findings from read-only checks on 2026-11-17:

- **Sustained CPU.** The instance averaged about 61% CPU every day from at least 2026-11-03 to 2026-11-16 (peaks near 100%), on `unlimited` credits with a zero balance and a surplus balance near its cap.
- **Credentials used off-host.** On 2026-11-16 between 21:01 and 21:08 (UTC-6), the old role `EC2Role-ECRAccess` was used from `45.32.243.12` (not the instance; user agent `Python-urllib/3.14`): `sts:GetCallerIdentity`, IAM enumeration (denied), `ecr:ListImages`, `DescribeRepositories`, `GetAuthorizationToken` (allowed), `ec2:DescribeSubnets` (denied). This pattern means the credentials were most likely taken from the instance metadata service. Verify the IP owner with whois.
- **Old role is gone.** `EC2Role-ECRAccess` was removed and `ProperliaEC2SSMRole` created on 2026-11-17, so the stolen credentials are no longer valid. The new role's credentials are as exposed as the old ones for as long as the same host runs.
- **Forensic snapshot** of `vol-09665c90e54886586` was taken on 2026-11-17 (the `CreateSnapshot` events on the new role).
- **Unknown:** entry point, start date, whether S3 objects or ECR layers were read (no data events), and outbound traffic (no flow logs, no trail, no GuardDuty). Management-event history covers 90 days only.

### CloudTrail results: ECR pushes and IAM changes (checked 2026-11-17, 90-day management-event history)
- **ECR image pushes:** 1,090 layer-upload events and 193 `PutImage` events, all by the GitHub Actions session of `EC2Role-ECRPush`. Pushes happened on 2026-08-20, 08-31, 09-02 to 09-04, 11-04, 11-11 and 11-13, each next to a deploy run. No push by any other identity and none after 2026-11-13, so none after the 11-16 incident. CloudTrail shows no direct image tampering through the ECR API. It cannot show whether a pipeline push carried tampered content (a compromised workflow or GitHub secret).
- **IAM changes:** all by the IAM user `taquito-partners` from the operator IP on 2026-11-17 (deleted roles `Properlia-Github-Stage`, `properlia-ec2-migrations-role`, `EC2Role-ECRAccess`, and the App Runner service-linked role; created `ProperliaEC2SSMRole`, swapped it onto the instance, created `properlia-rebuild` and its policy and key). Nothing unexpected from other identities.
- **Old role permissions:** `EC2Role-ECRAccess` had `AmazonEC2ContainerRegistryReadOnly` and **`AmazonS3FullAccess`**. The stolen credentials could therefore read every bucket in the account. CloudTrail shows no bucket-level calls from the attacker, but object reads are not logged, so S3 exposure cannot be ruled out. Treat the contents of every bucket as potentially read.
- **Persistence across deploys:** CPU stayed at about 56–63% daily across the deploys on 11-04, 11-11 and 11-13 (containers were recreated each time). Either the host itself is infected, a volume carries the payload, or the containers were re-exploited after each deploy. Do not assume that replacing the containers cleaned the host.
- **Root account:** console logins on 2026-09-10, 11-16 and 11-17 (browser user agent). Root MFA is enabled and there are no root access keys. Confirm these logins were yours.
- **Pipeline role:** `EC2Role-ECRPush` (GitHub OIDC; trust limited to `repo:edxco/properlia` on `stage` and `prod`) has `AmazonEC2ContainerRegistryPowerUser`, `AmazonS3FullAccess` and an inline deploy policy that edits the security group. Its trust policy is tight; its permissions are not.
- **Still attached:** inline policy `TempForensicsSnapshot` on `ProperliaEC2SSMRole` (added 2026-11-17 15:19). Remove it now that the snapshot exists.

### Maintenance window: build first, then a short downtime
Decision: build and verify the whole new stack while the current site stays up, then take the site offline behind a maintenance page only for the final data move and the switch. Downtime covers the final dump, isolating the old host, the restore, verification and the Cloudflare switch. Schedule it for a low-traffic period and announce it. The suspected-compromised host keeps serving until the window starts, so the no-downtime mitigations below apply during the build.

**Before the window (no downtime)**
1. Prepare the Cloudflare maintenance response for all five hosts (`properlia.com`, `www`, `dashboard`, `links`, `api`): HTTP 503 with a `Retry-After` header, so search engines treat it as temporary. Include `api`, so clients get a clear 503 instead of failing against a host being drained.
2. Confirm how to get the final database dump off the host: `scp` over the operator-only SSH rule (port 22, operator `/32`), or an SSM port forward. Do not give the old host any new AWS permissions to upload it.
3. Revoke active sessions of `ProperliaEC2SSMRole`, delete the inline policy `TempForensicsSnapshot`, and enable CloudTrail data events, flow logs and GuardDuty in `us-east-1`.
4. Build everything in go-live checklist items 1 to 3 (infrastructure, images, secrets) in `mx-central-1`.
5. Rehearse the data move with the existing `db.dump` (scan it, restore it into the new `db` container) and run the S3 sync, so the window only repeats the dump and the delta.

**Start of the window**
1. Switch on the Cloudflare maintenance response for all five hosts.
2. On the old host, stop `frontend`, `dashboard`, `links`, `backend` and `scheduler` (keep only `db`). This freezes all writes.
3. Take the final `pg_dump -Fc` from the `db` container (Postgres 15.14) and copy it off the host with `scp`; verify its checksum and keep it read-only. The S3 bucket does not depend on the host: sync it later from the operator workstation, not from the host.
4. Isolate the old host: replace its security group with one that has no inbound and no outbound rules. Keep the instance running (not stopped) so its memory and process list stay available for forensics; stop it only when forensics says so. The forensic EBS snapshot already exists.

**Go-live checklist (all items done before removing the maintenance page; items 1 to 3 are completed before the window starts)**
1. Infrastructure built in `mx-central-1`: network, security group, new IAM roles, ECR, the three S3 buckets, EC2, Elastic IP.
2. Images built from a clean commit and pushed to the new ECR by the new pipeline; the first deploy on the new host succeeded.
3. New secrets set on the new stack.
4. Data restored and validated: database restored from the scanned final dump, S3 synced with allow-listed files, counts match (812 objects at last check).
5. Security verification passed on the new host (the checks in the verification subsection below).
6. Full functional verification passed through the new IP for the five hosts (Phase 7), including uploads, lead email and the scheduler.

**Go-live**
- Point the Cloudflare origin to the new Elastic IP, then remove the maintenance response. Watch logs and error rates for the observation period.

### Old host after go-live
1. Keep the snapshot; do not delete the old volume or instance until forensics is closed.
2. Revoke the old secrets and the old Cloudflare Origin Certificate, and delete the leftover IAM objects tied to the old host.
3. The old host never serves traffic again.

### Rotate everything that lived on the host
- App: `SECRET_KEY_BASE`, `DEVISE_JWT_SECRET_KEY` (this also invalidates all sessions), `REVALIDATE_SECRET`, Postgres password, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`.
- Infrastructure: Cloudflare Origin Certificate and key, EC2 key pair, `EC2_SSH_KEY`, the 5 Secrets Manager secrets, and the GitHub secrets listed in Phase 6.
- Dashboard users: force password resets for every account.

### Rebuild rules for the new host
- Nothing is copied from the old host: no `.env`, Docker volumes, images, certificates, SSH keys, crontabs, `authorized_keys` or shell history.
- Rebuild every image from a clean commit that includes the dependency upgrade (Next.js 16.4.5, React 19.2.9). The new ECR repo starts empty, so old tags are never reused.
- **New IAM roles** named `ProperliaStage-EC2-mx`, `ProperliaStage-GitHub-mx` and `ProperliaStage-FlowLogs-mx` (the rebuild user can only create roles named `ProperliaStage-*`), not `ProperliaEC2SSMRole`: SSM core, ECR pull for the new repo only, S3 `Get/Put/Delete/ListBucket` on the new bucket only. No `ec2:*`, no `iam:*`. Replace `EC2Role-ECRPush` with a new GitHub OIDC role limited to ECR push on the new repo, the security-group edit it needs, and the `stage` branch; no `AmazonS3FullAccess`. Add object-level S3 logging so any later read is visible.
- **Metadata access:** IMDSv2 required, hop limit 2, plus a host firewall rule (`DOCKER-USER` chain) that drops traffic to `169.254.169.254` from every container except `backend` and `scheduler` (give them fixed IPs on `app-network`). Alternative: hop limit 1 and a scoped static S3 key in the backend and scheduler env only. Verify with `curl -m 3 http://169.254.169.254/` from the `frontend`, `dashboard`, `links` and `nginx` containers: it must fail.
- **Container hardening** for `frontend`, `dashboard` and `links`: non-root user (already the case), `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, tmpfs for `/tmp`. `dashboard` and `links` also run `read_only: true` with a tmpfs for `.next/cache`. `frontend` stays writable because Next.js on-demand revalidation writes under `.next/`. Implemented in `docker-compose.stage.yml`; confirm on the first deploy.
- **Egress control:** security group outbound limited to 443, 80, 53 and 123. This blocks typical mining-pool ports.
- **Detection from day one:** VPC flow logs, a CloudTrail trail (bucket `proper-cloudtrail-stage-mx`) with S3 data events for the new assets bucket, and GuardDuty, all in `mx-central-1`.

### Restore data without trusting it
- **Database dump:** inspect before restoring. Run `pg_restore -l db.dump`, restore into a scratch container with no network, then look for unexpected roles, functions, triggers, event triggers, extensions and large objects. Review the users table for admin accounts you do not recognize.
- **S3 objects:** Active Storage keys have no file extension, so sync only objects whose bytes are images or videos (checked by magic bytes, not by the declared type), then review what was excluded. Initial copy done: 809 of 812 objects.
- **Probe blobs:** after the restore, purge the six unattached blobs created on 2026-11-12, and exclude their keys from the final delta sync. The three 68-byte PNGs were among the 809 copied, so delete those three objects from the new assets bucket (the instance role can; the rebuild user cannot).
- **Cutover gate:** do not point Cloudflare at the new host until the verification checks below pass.

### Security verification
- CPU stays at normal levels for 24 hours after cutover (no sustained load, no credit surplus).
- GuardDuty shows no findings; flow logs show no unexpected outbound destinations.
- Metadata endpoint unreachable from the non-backend containers.
- No `ec2:*` or `iam:*` in the instance role; no static AWS keys on the host unless the alternative above was chosen.
- Upload hardening: inside the backend container, `identify` works for JPEG, PNG and WebP and fails for MAT, MVG, MSL, SVG, `https:` and `@file` inputs. An upload of a synthetic file with a MAT header (generated in the test, never the original probes) declared as `image/png` is rejected, and the public lead form rejects images.

### Upload hardening (backend; merged before the go-live images are built)
Context: six blobs in the old assets bucket and database were uploaded on 2026-11-12 between 02:55 and 03:18 UTC and never attached to any record. Three (`poc_cba7.png`, `p_15c0.png`, `p_1d7d.png`, 6,120 bytes each) are declared `image/png` but are MATLAB MAT-file headers containing `/etc/hostname`; each came with a 68-byte PNG (`poc_5349.png`, `p_bfb3.png`, `p_e5b9.png`), probably a control file. No client uses Active Storage direct uploads, yet the endpoint is open and unauthenticated, which fits files that were uploaded and never attached. They look like probes of the image-processing path. The backend image installs ImageMagick and libvips, and Rails 7.0 uses ImageMagick (MiniMagick) by default. The cause of the compromise is not proven; these items close the path regardless.

1. **ImageMagick `policy.xml` (deny by default).** ImageMagick cannot be removed yet, so restrict it to JPEG, PNG and WebP and copy the file into the backend image (`/etc/ImageMagick-6/policy.xml` on Debian bookworm; confirm with `identify -list policy` inside the container). Proposed content, to be tested before use:
   ```xml
   <policymap>
     <policy domain="delegate" rights="none" pattern="*" />
     <policy domain="coder" rights="none" pattern="*" />
     <policy domain="coder" rights="read|write" pattern="{JPEG,JPG,PNG,WEBP}" />
     <policy domain="coder" rights="none" pattern="{MVG,MSL,URL,HTTPS,HTTP,FTP,EPHEMERAL,TEXT,TXT,LABEL,CAPTION,PS,PS2,PS3,EPS,PDF,XPS,SVG,MSVG,MAT,VID,SHOW,WIN,X}" />
     <policy domain="filter" rights="none" pattern="*" />
     <policy domain="path" rights="none" pattern="@*" />
     <policy domain="path" rights="none" pattern="|*" />
     <policy domain="resource" name="memory" value="256MiB" />
     <policy domain="resource" name="map" value="512MiB" />
     <policy domain="resource" name="width" value="16KP" />
     <policy domain="resource" name="height" value="16KP" />
     <policy domain="resource" name="area" value="128MP" />
     <policy domain="resource" name="disk" value="1GiB" />
     <policy domain="resource" name="time" value="60" />
   </policymap>
   ```
   The resource limits are starting values to tune. Add a build-time check in the Dockerfile that fails the build if `identify` still accepts an `msl:`, `mvg:`, `https:`, `@file` or MAT input. Future work, not part of this migration: replace ImageMagick/MiniMagick with libvips.
2. **Shared upload validator** for `Property#images`, `Property#videos` and `Lead#images`.
   - Reads the first bytes with `Marcel::MimeType.for(io)` (content only, ignoring filename and the declared type) and checks the result against an allowlist: `image/jpeg`, `image/png`, `image/webp`, plus `video/mp4` and `video/quicktime` (mov) for videos.
   - Enforces a size limit and a maximum file count per attachment. Starting values taken from the dump (largest image 3.1 MB, largest video 7.6 MB, at most 52 images on a property): images 10 MB and 60 per property, videos 200 MB and 5 per property, lead images 10.
   - Runs **before anything is uploaded**: as a model validation (validations run before Active Storage uploads on commit), plus an explicit pre-check in `properties#update`, because `attach` on a saved record silently ignores a failed validation. Signed blob ids and any non-file value are rejected. The detected type replaces the declared one in the job.
   - Also runs in `AttachRemoteMediaJob` before `attach`. Today the job takes `content_type` from the remote response header and only caps the size at 200 MB, so it must stop trusting that header.
3. **Public lead form takes no images.** Remove `images: []` from `public_lead_params` in `leads_controller.rb`, and the now-dead `ProcessLeadImagesJob` enqueue in the public create action. The authenticated dashboard `lead_params` keeps `images: []` and gets the validator.
4. Skipped by decision: checking the database for the held-back blobs and who uploaded them.
5. **Active Storage direct uploads disabled** (added during implementation): no client uses them, so an initializer makes `DirectUploadsController` return 404 and the CORS rule for `/rails/active_storage/*` keeps only GET, HEAD and OPTIONS.

## Phases

### 0. Prerequisites
- Use a write-capable identity (the audit user is read-only in practice); create a temporary `properlia-rebuild` user or SSO role and remove it at the end.
- Lower Cloudflare DNS TTL ahead of cutover.
- Replace the `properlia-rebuild-policy` document with the scoped version: EC2 only in `mx-central-1`, IAM limited to `ProperliaStage-*` names, S3 limited to the three new buckets plus read on the old assets bucket, and ECR, logs, GuardDuty and CloudTrail limited to `mx-central-1`. Run everything with `--profile properlia-rebuild`.
- Set `AWS_REGION=mx-central-1` for every command below.

### 1. Network
- VPC `10.0.0.0/16`, Internet Gateway, one route table `0.0.0.0/0 -> igw` for the public subnet.
- Subnet: public `10.0.3.0/24` (AZ a).
- Security group (one only), `seg-ec2-properlia`: 80 and 443 from `0.0.0.0/0` (or Cloudflare ranges), 22 only from the operator IP `/32`; outbound limited to 443, 80, 53 and 123. Postgres is never exposed: it listens only inside the Docker network.

### 2. Identity
- New EC2 role and instance profile (not `ProperliaEC2SSMRole`): SSM core, ECR pull, S3 `Get/Put/Delete/ListBucket` on the new bucket only. See Security.
- GitHub OIDC role: ECR push on the new repo, trust limited to the `stage` branch.

### 3. Registry and storage
- ECR `edxco/properlia`: mutable tags, scan on push, AES256. Images are rebuilt by the pipeline, not copied.
- S3 assets bucket `proper-api-assets-stage-mx`: versioning on, SSE-S3, Block Public Access fully on, no policy, no CORS (match live).
- S3 `proper-db-backups-stage-mx`: private, versioning on, SSE-S3, lifecycle rule that expires nightly dumps after 30 days. S3 `proper-cloudtrail-stage-mx`: private, SSE-S3, policy for CloudTrail delivery.
- Copy data: `aws s3 sync s3://proper-api-assets-stage s3://<new-bucket> --source-region us-east-1 --region mx-central-1`; compare object count (812) and size (about 375.7 MB).

### 4. Database (container, Postgres 15.14)
- Compose `db` service: image pinned to `postgres:15.14`, volume `postgres_data` on the encrypted EBS disk, no published port, new `POSTGRES_PASSWORD`.
- Restore: scan the dump first (see "Restore data without trusting it"), then `pg_restore --no-owner --no-acl -d "$POSTGRES_DB"` into the new `db` container, then run `db:migrate`. Rehearse with the existing `db.dump` before the window.
- Backups: nightly `pg_dump -Fc` to `proper-db-backups-stage-mx` from a cron job on the host (instance role gets `PutObject` on that bucket only), plus a monthly test restore into a scratch container. Keep the EBS volume snapshotted (daily snapshot with 7-day retention).
- Monitor free disk and memory; grow the EBS volume online or resize the instance if needed.

### 5. Compute
- Latest Ubuntu 24.04 amd64 AMI for the region (look up via the Canonical SSM public parameter).
- `t3.medium`, 40 GB gp3 **encrypted**, public subnet, `seg-ec2-properlia`, instance profile, new key pair, IMDSv2 required, hop limit per decision 3.
- Install Docker and Compose, create the deploy path, install the Cloudflare Origin Certificate in `/etc/ssl/cloudflare/{cert,key}.pem` (`chmod 600` on the key).
- Allocate and associate an Elastic IP.

### 6. Secrets, pipeline and deploy
- Follow phases 5 and 6 of `aws-mx-central-1-migration.md` (fresh secrets, `gh secret set`, region changes in `deploy-ec2.yml` and `aws.rb`, push to `stage`).
- Merge the upload hardening (policy.xml, shared validator, public lead params) before the first build for the new stack, so the go-live images already contain it.
- New values required: `AWS_REGION`, `AWS_BUCKET`, `AWS_ROLE_ARN`, `STAGE_EC2_HOST`, `STAGE_SG_ID`, `EC2_SSH_KEY`, and the new `POSTGRES_*` values (`DATABASE_URL` keeps pointing to `db:5432`).

### 7. Verification (before DNS changes)
- `curl --resolve properlia.com:443:<new-ip> https://properlia.com/`, same for `dashboard`, `links` and `api`.
- Dashboard login, listing with images, image upload to S3, lead form email, AI description, scheduler logs.
- Object and row counts match the source: 812 S3 objects, table counts in Postgres.
- `aws s3api get-public-access-block` on the new bucket shows all four settings true, and images still load.

### 8. Cutover and cleanup
- Do not remove the maintenance page until every item in the "Go-live checklist" (Security section) is done.
- Point the Cloudflare origin to the new Elastic IP, remove the maintenance response and watch logs.
- After forensics is closed and the snapshot is retained (and a short observation window on the new stack, suggested 7 days) delete in `us-east-1`: EC2, Elastic IP, EBS, RDS (take a final snapshot first), old bucket, the leftover SGs, unused secrets, the old key pair.
- Delete `properlia-rebuild`; rotate anything that lived on the old host.

## Rollback
The old host is suspected compromised and must not serve traffic again, so it is not a rollback target. If the new stack fails after cutover, fix forward or show a maintenance page at Cloudflare while repairing; the data source of truth is the pre-cutover dump plus any later dumps of the new database.

## Open items
- Consumers of the 5 Secrets Manager secrets and the purpose of `role/EC2push`.
- Entry point and start date of the compromise (needs analysis of the forensic snapshot).
- Maintenance window: start date and time, expected duration, and how users are told.
- Date of the existing `db.dump`: it is used for the rehearsal only; the final dump is taken during the window after writes are frozen.
- Whether the root console logins (2026-09-10, 11-16, 11-17) were yours.
- Whether a pipeline push carried tampered content (workflow files, GitHub secrets and recent commits need review).
- Current IMDS hop limit.
- Upload validator limits and the policy.xml resource limits are starting values; confirm or adjust them.
- `AttachRemoteMediaJob` checks only the first URL host and follows redirects to any host; decide whether to restrict redirect targets.
- The backend container runs as root; consider a non-root user later.
- Whether `storage_data` (the local Active Storage volume) holds anything.
- Other regions were not scanned; resources there would not appear in this inventory.
