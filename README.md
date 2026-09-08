# Note Everywhere

A React app that syncs notes in real time between browsers and devices using an 8-character sync code.

## Features

- 🔐 **Secure sessions** - Generate or join with an 8-character sync code
- ✨ **Real-time sync** - Type on one device and see it immediately on every device using the same code
- 📱 **QR code sharing** - Share sync codes easily via QR code
- 📷 **QR scanner** - Join a note by scanning its QR code with the device camera
- 💾 **Auto-save** - Notes are automatically saved per sync code
- 🚀 **Fast & lightweight** - Built with React + Vite
- 📱 **Responsive** - Works on desktop and mobile

## How it works

1. **Create a session** - Generate a random 8-character code (e.g., `A7K9M2P4`)
2. **Share the code** - Give the code or QR to others you want to sync with
3. **Join the session** - Enter the code on another device/tab
4. **Type away** - All connected devices with the same code stay synced in real-time

The browser saves changes through the Node.js API. The server persists notes and broadcasts updates to connected devices with Server-Sent Events. Every device must open the same deployed app URL and use the same sync code.

## Security

- Each 8-character code creates an isolated sync session
- Only tabs/devices with the exact same code can sync
- Codes use alphanumeric characters (excluding confusing ones like O/0, I/1)
- Notes are stored unencrypted on the app server; the sync code acts as the access key
- Leave a session anytime without affecting others

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

For cross-device development testing, build and run the Node server, then open the computer's LAN IP from both devices:

```bash
npm run build
npm start
```

The server listens on all network interfaces by default. Ensure port `3006` is allowed by the host firewall. Set `NOTES_FILE` to choose the persistent note database location.

## Build

```bash
npm run build
```

## Try it out

1. Start the dev server
2. Click "Generate Sync Code" to create a new session
3. Copy the code or show the QR code
4. Open the same app URL on another device (or scan the QR code)
5. Click "Join Existing Session" and enter the code
6. Start typing in either tab and watch it sync! ✨

## Use Cases

- 📝 Sync notes between your phone and computer
- 👥 Collaborate on text with teammates
- 🔄 Keep notes synced across multiple browser tabs
- 📋 Quick text sharing without email/messaging apps
