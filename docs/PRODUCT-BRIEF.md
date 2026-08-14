# Two Minutes — Product brief

## Product promise

Two Minutes removes the friction from timed typing drills. The user arms the
timer, presses a key or clicks in any application, and receives a clear sound when the
interval ends.

## Positioning

- **Category:** keyboard-triggered interval timer
- **Initial audience:** personal typing practice
- **Initial price:** free
- **Language:** English
- **Personality:** minimal and professional
- **Privacy:** local-only; no account, history, analytics, or key content

## Primary flow

1. Open the app manually.
2. The compact always-on-top window displays **Ready** and `2:00`.
3. The first keyboard press or mouse click in any application starts the countdown.
4. At zero, the app rings and stops.
5. The user presses **Ready again** to arm the next interval.

The Linux system tray keeps the app visible while its window is hidden and
shows **Ready**, **In progress · M:SS**, or **Complete**. Its menu can reopen the
timer, rearm a completed interval, or quit the application.

## MVP settings

- Duration in minutes (default: 2)
- Sound: Bell, Soft, or Digital
- Volume

## Brand foundation

- **Name:** Two Minutes
- **Technical name:** `two-minutes`
- **Descriptor:** Keyboard-triggered interval timer
- **Tagline:** Your timer starts with your first keystroke.
- **Preferred domain:** `twominutes.app` (availability still to be verified)

## Platform plan

The first validation target is Ubuntu 25.04 on Wayland. The interface is built
with web technology inside Electron; keyboard activity is handled by a small,
platform-specific adapter. Future Windows and macOS versions can reuse the UI
and timer while replacing only the input adapter and permission flow.

## Definition of MVP success

- Starts reliably from a key press or mouse click in browser, terminal, editor, and office app
- Does not expose or retain key codes, button codes, or typed content
- Timer remains accurate while other applications are focused
- Alert is audible at the configured volume
- Rearming never begins a block until the next key press
