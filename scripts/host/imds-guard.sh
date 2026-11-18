#!/bin/bash
# Only the backend and scheduler containers may reach the instance metadata service.
set -euo pipefail

IMDS=169.254.169.254
ALLOWED="172.30.0.10 172.30.0.11"
ipt() { iptables -w "$@"; }

ipt -N DOCKER-USER 2>/dev/null || true

while ipt -D DOCKER-USER -d "$IMDS" -j DROP 2>/dev/null; do :; done
for ip in $ALLOWED; do
  while ipt -D DOCKER-USER -s "$ip" -d "$IMDS" -j ACCEPT 2>/dev/null; do :; done
done

ipt -I DOCKER-USER 1 -d "$IMDS" -j DROP
for ip in $ALLOWED; do
  ipt -I DOCKER-USER 1 -s "$ip" -d "$IMDS" -j ACCEPT
done
