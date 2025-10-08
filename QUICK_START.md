# Quick Start Guide

## ✅ Extension Built Successfully!

Your extension has been built and is ready to load in Chrome.

## Load Extension in Chrome

1. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - OR click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select: `/home/pulseonix/Desktop/zX/wallet/dist`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "Automata Wallet" in your extensions list
   - The extension icon should appear in your Chrome toolbar

## Development Workflow

### For Active Development

```bash
# Watch mode - rebuilds automatically on file changes
pnpm run dev:build
```

**After making changes:**
1. The extension will rebuild automatically
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Automata Wallet card
4. Test your changes

### For UI Development Only (Popup)

```bash
# Fast reload for popup UI
pnpm run dev
```

Then open `http://localhost:5173/popup.html` in a regular browser tab for faster development.

**Note**: Service worker won't work in dev mode due to CORS. Use `dev:build` for full extension testing.

### Production Build

```bash
pnpm run build
```

## Debugging

### Check Service Worker Logs
1. Go to `chrome://extensions/`
2. Find "Automata Wallet"
3. Click "service worker" link under "Inspect views"

### Check Popup Logs
1. Right-click the extension icon
2. Select "Inspect popup"

### Force Complete Reload
If things get weird:
```bash
# Remove extension from chrome://extensions/
pnpm run build
# Re-add the dist folder
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Vite dev server (popup only, CORS issues) |
| `pnpm run dev:build` | Watch mode (recommended for extension dev) |
| `pnpm run build` | Production build |
| `pnpm run test` | Run tests |
| `pnpm run lint` | Check code quality |

## What Was Fixed

The error you saw (`Service worker registration failed. Status code: 3`) was caused by:
- Chrome extensions can't load service workers from `http://localhost:5173` (CORS)
- Manifest V3 service workers require proper module loading
- Vite's dev server isn't compatible with Chrome extension service workers

**Solution**: Build the extension to the `dist` folder and load from there.

## Next Steps

1. Load the extension in Chrome (see steps above)
2. Click the extension icon to open the popup
3. Start developing with `pnpm run dev:build`
4. Test your Lua sandbox and other features!

---

**Need more help?** Check `DEVELOPMENT.md` for detailed troubleshooting.
