# Two Minutes

**Your timer starts with your first keystroke.**

Two Minutes is a small, privacy-first desktop timer for focused typing drills.
It waits for a key press or mouse click, starts a configurable countdown, rings, and
stops. No keystrokes, text, history, accounts, or analytics are stored.

## MVP status

This repository contains the first Linux/Wayland MVP, targeted at Ubuntu 25.04.

- Always-on-top compact timer
- Linux system-tray status with live remaining time
- Starts on the first global key press or mouse click while armed
- Defaults to two minutes
- Rings and stops at zero
- Manual **Ready again** rearming
- Closing the window keeps the timer running in the tray
- Local duration, sound, and volume settings
- Reads only the input event type/value; key and button codes are discarded

## Run on Ubuntu

1. Install Node.js 20 or later.
2. Install dependencies: `npm install`
3. Grant input access: `sudo ./scripts/install-linux-permissions.sh`
4. Sign out and sign back in so the new group membership takes effect.
5. Start the app: `npm start`

If keyboard access is unavailable, the app opens normally and explains how to
enable it. Pressing a key while the Two Minutes window itself is focused also
starts the timer, allowing the UI to be tested without elevated permissions.

## Privacy model

On Wayland, applications cannot observe global keyboard or mouse activity through
the window system. The Linux MVP therefore opens keyboard and pointer event devices
in read-only mode. The detector checks only whether an event is a new key press or
button press and emits an anonymous `activity` signal. It never sends the key or
button code to the UI and never writes input events to disk or the network.

## Development

```bash
npm test
npm start
```

## Roadmap

1. Validate the Ubuntu/Wayland MVP on real hardware.
2. Add signed AppImage and DEB packages.
3. Add Windows and macOS input adapters.
4. Publish the English landing page and download flow.
