# Note Everywhere

A secure React app that syncs notes in real-time using an 8-character sync code. Only users with the same code can see and edit the notes.

## Features

- 🔐 **Secure sessions** - Generate or join with an 8-character sync code
- ✨ **Real-time sync** - Type in one tab, see it instantly in all tabs with the same code
- 📱 **QR code sharing** - Share sync codes easily via QR code
- 💾 **Auto-save** - Notes are automatically saved per sync code
- 🚀 **Fast & lightweight** - Built with React + Vite
- 📱 **Responsive** - Works on desktop and mobile

## How it works

1. **Create a session** - Generate a random 8-character code (e.g., `A7K9M2P4`)
2. **Share the code** - Give the code or QR to others you want to sync with
3. **Join the session** - Enter the code on another device/tab
4. **Type away** - All connected devices with the same code stay synced in real-time

Uses the **BroadcastChannel API** with session-specific channels. Each sync code creates an isolated sync group. Notes are stored in localStorage with the sync code as a key.

## Security

- Each 8-character code creates an isolated sync session
- Only tabs/devices with the exact same code can sync
- Codes use alphanumeric characters (excluding confusing ones like O/0, I/1)
- Notes are stored locally on each device (not sent to any server)
- Leave a session anytime without affecting others

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Try it out

1. Start the dev server
2. Click "Generate Sync Code" to create a new session
3. Copy the code or show the QR code
4. Open the app in another tab/window
5. Click "Join Existing Session" and enter the code
6. Start typing in either tab and watch it sync! ✨

## Use Cases

- 📝 Sync notes between your phone and computer
- 👥 Collaborate on text with teammates
- 🔄 Keep notes synced across multiple browser tabs
- 📋 Quick text sharing without email/messaging apps
