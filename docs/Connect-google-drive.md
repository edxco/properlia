Ready for review
Select text to add comments on the plan
Google Drive mirror for property listings
Scope of this task: write the design below as a documentation file at docs/google-drive-integration.md (new file, content is this plan verbatim, as project documentation for later implementation). No application code changes in this pass — implementation is a separate follow-up task once the manual Google Cloud prerequisite is in place.

Context
The dashboard's PropertyForm creates/edits properties whose images, videos, and descriptions live only in S3 via ActiveStorage. The team wants every property mirrored into a Google Drive folder tree, organized by a fixed taxonomy (exclusive_listing → listing_type → property_type → state → neighborhood + city), so the team can browse listings by category directly in Drive outside the app. This is a backup/organizational mirror — S3/ActiveStorage stays the canonical storage the app actually serves images from; nothing about how the frontend/dashboard renders property media changes.

Confirmed with the user:

Drive is mirror-only, S3 stays primary.
No Google Cloud project/service account/Shared Drive exists yet — this is greenfield, requiring manual setup (a Service Account, which requires a Shared Drive, which requires Google Workspace — not available on personal Gmail — this is a hard prerequisite, not code).
Sync runs async (background job), same pattern as existing jobs, despite the app running the in-process :async ActiveJob adapter (no Sidekiq/Solid Queue).
If a property's taxonomy-relevant attributes change after creation, its Drive folder moves to the new location (never duplicated, never left stale).
Property folder name: "{title} - {id[0..7]}". Inside: Imagenes/, Videos/ subfolders, and a descripcion.txt with title+description in ES/EN.
Intake endpoint (Apps Script) attaches media asynchronously after save — accepted trade-off: two sync passes (folder immediately, media once attached).
Deletions (of individual attachments) are not mirrored to Drive in v1 — Drive never deletes automatically.
A "View in Drive" link should be added to the dashboard's property edit screen — drive_folder_id/its URL must be exposed only to authenticated dashboard requests, never on the public unauthenticated index/show JSON.
1. Manual prerequisite (user must do this outside of code, before the feature can work end-to-end)
Create/select a Google Cloud project at console.cloud.google.com.
Enable the Google Drive API for that project.
Create a Service Account (APIs & Services → Credentials), note its email (...@<project-id>.iam.gserviceaccount.com).
Generate a JSON key for it and download the file — this becomes an env var, never commit it.
Hard blocker to flag: Service Accounts have no personal storage quota — they can only write into a Shared Drive, and Shared Drives require Google Workspace (not personal Gmail). Confirm Workspace access exists before implementation.
Create a Shared Drive (e.g. "Properlia Listings") from a Workspace account.
Share it with the service account email as Manager/Content Manager.
Get the Shared Drive ID from its URL (drive.google.com/drive/folders/<ID>).
Hand over both secrets for deploy config: the full JSON key content, and the Shared Drive ID.
2. Backend changes
Migration
New packages/backend/db/migrate/<timestamp>_add_drive_folder_id_to_properties.rb (timestamp format matches existing migrations, e.g. 20260902130200_...):

class AddDriveFolderIdToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :drive_folder_id, :string
  end
end
Nullable, no index (only ever looked up by property.id).

Gemfile
Add gem 'google-apis-drive_v3' near the other single-purpose API gems (gem 'resend', gem 'anthropic'). Pulls in googleauth transitively for Google::Auth::ServiceAccountCredentials.

New service: app/services/google_drive/property_folder_sync.rb
Modeled on Ai::PropertyContentGenerator (namespaced module, self.call(property:) = new(property:).call, custom SyncError < StandardError, ENV.fetch-based config, fresh client per call):

Config: ENV.fetch('GOOGLE_DRIVE_CREDENTIALS_JSON') (full service-account JSON, minified to one line) → Google::Auth::ServiceAccountCredentials.make_creds(json_key_io: StringIO.new(...), scope: Google::Apis::DriveV3::AUTH_DRIVE); ENV.fetch('GOOGLE_DRIVE_SHARED_DRIVE_ID').
Taxonomy chain: build 5 folder names in order from the property's current (saved) associations, using es_name.titleize for readability (es_name is stored lowercase via downcase_names callbacks — verified on PropertyType):
exclusive_listing ? "Exclusiva" : "No exclusiva"
listing_type.es_name.titleize
property_type.es_name.titleize
state&.es_name&.titleize || "Sin estado"
[neighborhood, city&.es_name&.titleize].compact.join(" - ").presence || "Sin ubicación" Walk this chain from the Shared Drive root, calling a find_or_create_folder(name:, parent_id:) helper at each level (idempotent: files.list with q: "name = '...' and '<parent>' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false", plus supports_all_drives: true, include_items_from_all_drives: true, corpora: 'drive', drive_id: <shared_drive_id> — required for every Drive call since Shared Drive items are invisible without these flags; escape ' in any interpolated name).
Property's own folder (sync_property_folder): if property.drive_folder_id present, files.get its current name/parents, rename if the computed name changed, move via update(add_parents:, remove_parents:) if the parent differs from the taxonomy leaf just computed (never delete the old location — leaves it empty, avoiding destructive calls). If absent, find-or-create by name under the taxonomy leaf and persist the id with update_column(:drive_folder_id, id) (avoid triggering callbacks/validations on every sync).
Subfolders: find-or-create Imagenes and Videos under the property folder.
descripcion.txt: always find-by-name under the property folder; update_file (overwrite content) if found, else create_file, with title + description/description_en in ES/EN.
Media sync: for each property.images/property.videos attachment, derive a stable Drive filename as "#{attachment.blob.id}-#{attachment.blob.filename}" (blob id is immutable and unique — avoids collisions when two uploads share an original filename, needs no new schema). Skip if a file with that name already exists in the target subfolder; otherwise stream attachment.blob.open { |tempfile| ... } into create_file. Wrap each attachment's upload in its own rescue StandardError => e; Rails.logger.error(...) (matching AttachRemoteMediaJob's per-item resilience) so one bad file doesn't block the rest.
Concurrency guard: wrap the whole call body in a Postgres advisory lock keyed on the property id (pg_advisory_lock/pg_advisory_unlock via ActiveRecord::Base.connection.execute, no new gem) — the :async adapter can run two sync jobs for the same property concurrently (e.g. an edit followed quickly by the intake media-arrival job), which would otherwise race on find-or-create and risk duplicate folders.
Top-level rescue StandardError => e logs and re-raises as SyncError (never lets a raw Drive API exception escape), matching Ai::PropertyContentGenerator's shape.
New job: app/jobs/sync_property_to_drive_job.rb
Modeled on AttachRemoteMediaJob:

class SyncPropertyToDriveJob < ApplicationJob
  queue_as :default
  retry_on GoogleDrive::PropertyFolderSync::SyncError, wait: :polynomially_longer, attempts: 5

  def perform(property_id)
    property = Property.find_by(id: property_id)
    return unless property

    GoogleDrive::PropertyFolderSync.call(property: property)
  end
end
Controller: app/controllers/api/v1/properties_controller.rb
create (~line 110-136): after property.save succeeds, add SyncPropertyToDriveJob.perform_later(property.id) unconditionally (not gated on images present — a property with no media yet still needs its folder + descripcion.txt).
update (~line 140-166): after a successful @property.update(...), add SyncPropertyToDriveJob.perform_later(@property.id). No ordering issue — new media is attached synchronously earlier in this same action.
intake (~line 190-240): after property.save, alongside the existing AttachRemoteMediaJob.perform_later(...), add SyncPropertyToDriveJob.perform_later(property.id) (creates folder + descripcion.txt immediately, empty of media).
app/jobs/attach_remote_media_job.rb: at the end of perform, after the existing ImageCompressor.call loop, add SyncPropertyToDriveJob.perform_later(property.id) — gives intake properties a second sync pass exactly when their media becomes available, reusing the idempotent skip-if-already-uploaded logic (no new trigger/polling mechanism needed).
property_params (~line 343-347): add drive_folder_id to the exclusion list — Property.column_names.map(&:to_sym) - %i[id created_at updated_at images image_order drive_folder_id]. Required: without this, drive_folder_id becomes mass-assignable through the public create/update API.
property_json (~line 405-478): exclude drive_folder_id from base_attributes unconditionally (property.attributes.except('created_at', 'updated_at', 'drive_folder_id')) — it's exposed via the public, unauthenticated index/show actions. Then, only when current_user.present? (dashboard requests carry a JWT; current_user is already referenced elsewhere in this codebase — e.g. Authorization#authorize_any! — without forcing auth, since authenticate_user! is skipped but not disabled), add a drive_url field: "https://drive.google.com/drive/folders/#{property.drive_folder_id}" if drive_folder_id present, else nil.
Env vars — add everywhere ANTHROPIC_API_KEY was added, and fix its one gap
New vars: GOOGLE_DRIVE_CREDENTIALS_JSON (minified JSON key), GOOGLE_DRIVE_SHARED_DRIVE_ID.

.env.example, .env.docker.example, .env.stage — add both, with a short comment.
docker-compose.yml (dev) and docker-compose.stage.yml — add both to the backend environment: block, same pattern as ANTHROPIC_API_KEY.
docker-compose.prod.yml — add both explicitly to the backend environment: block. This file's block is currently missing ANTHROPIC_API_KEY entirely even though it's written into .env.prod on the EC2 host — docker-compose only passes through vars explicitly listed here, so don't repeat that gap for the new vars.
.github/workflows/deploy-ec2.yml (~line 260, where .env.stage/.env.prod are generated on the EC2 host) — add GOOGLE_DRIVE_CREDENTIALS_JSON=${{ secrets.GOOGLE_DRIVE_CREDENTIALS_JSON }} and GOOGLE_DRIVE_SHARED_DRIVE_ID=${{ secrets.GOOGLE_DRIVE_SHARED_DRIVE_ID }}. Requires the user to add both as GitHub Actions repo secrets manually (cannot be done from code).
3. Frontend (dashboard) change
Add a "Ver en Drive" link, shown only when editing an existing property that already has a synced Drive folder (i.e. property.drive_url present — new properties won't have one until the background job completes on the next load/refresh).

packages/dashboard/app/[locale]/(dashboard)/properties/[id]/edit/page.tsx: the fetched Property already includes the new drive_url field from property_json (authenticated dashboard request → current_user present). Pass it to PropertyForm.
packages/dashboard/app/[locale]/(dashboard)/properties/PropertyForm.tsx: accept an optional driveUrl prop; render a simple external link (opens in a new tab) near the images/videos section when present, no styling system beyond what the file already uses for similar secondary actions.
packages/shared/src/types/index.ts: add drive_url?: string | null to the Property interface.
No changes needed to the create flow (new/page.tsx) — a brand-new property has no Drive folder yet until the async job runs.

4. Testing / verification
Automated (RSpec):

spec/services/google_drive/property_folder_sync_spec.rb (new): stub Google::Apis::DriveV3::DriveService.new (same approach spec/requests/properties_generate_content_spec.rb uses for Anthropic::Client.new). Cover: first sync creates full chain + folders + descripcion.txt; second sync with no changes issues no writes; taxonomy change moves the folder; title change renames it; media sync skips an already-uploaded blob and uploads a new one.
spec/jobs/sync_property_to_drive_job_spec.rb (new, mirrors spec/jobs/process_property_images_job_spec.rb): stubs GoogleDrive::PropertyFolderSync.call, asserts correct property, no-ops for a deleted id.
Extend existing properties controller request specs to assert SyncPropertyToDriveJob is enqueued (have_enqueued_job) from create/update/intake, and that drive_folder_id is absent from public index/show JSON and rejected as a writable param (mass-assignment regression test).
Manual, against a real Shared Drive:

Set GOOGLE_DRIVE_CREDENTIALS_JSON/GOOGLE_DRIVE_SHARED_DRIVE_ID locally, restart Rails.
Create a property via PropertyForm with full taxonomy + an image — confirm the 5-level tree, property folder name, Imagenes/Videos, descripcion.txt content, and the image all appear in Drive.
Edit the property's state/property type — confirm the folder moves (no duplicate at old or new path on repeat saves).
Edit the title — confirm the folder renames in place.
Add a second image — confirm only the new one uploads; re-save with no changes — confirm no duplicate.
Exercise /intake with photo/video URLs — confirm folder + descripcion.txt appear immediately, then images/videos appear shortly after (once AttachRemoteMediaJob finishes).
Load the dashboard edit page for a synced property — confirm "Ver en Drive" link appears and opens the right folder; confirm it's absent from the public frontend's property detail JSON.
Unset the Drive env vars and create a property — confirm the job fails gracefully into logs (via retry_on exhausting) rather than crashing the request/other jobs.