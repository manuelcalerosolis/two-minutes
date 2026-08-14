#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer with sudo."
  exit 1
fi

groupadd --force two-minutes
install -m 0644 "$(dirname "$0")/99-two-minutes-input.rules" /etc/udev/rules.d/99-two-minutes-input.rules
usermod -aG two-minutes "${SUDO_USER}"
udevadm control --reload-rules
udevadm trigger --subsystem-match=input

echo "Permission installed. Sign out and sign back in before starting Two Minutes."

