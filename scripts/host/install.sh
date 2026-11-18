#!/bin/bash
# Run as root on the EC2 host from this directory: sudo ./install.sh
set -euo pipefail
cd "$(dirname "$0")"

install -m 755 imds-guard.sh /usr/local/sbin/properlia-imds-guard.sh
install -m 644 properlia-imds-guard.service /etc/systemd/system/properlia-imds-guard.service
install -m 755 db-backup.sh /usr/local/sbin/properlia-db-backup.sh
install -m 644 properlia-db-backup.cron /etc/cron.d/properlia-db-backup
install -m 640 -o ubuntu -g ubuntu /dev/null /var/log/properlia-db-backup.log

systemctl daemon-reload
systemctl enable properlia-imds-guard.service
systemctl restart properlia-imds-guard.service
systemctl is-active properlia-imds-guard.service
