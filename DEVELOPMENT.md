# Development Guide

## Chrome Extension Development Issue

Chrome extensions with service workers (Manifest V3) don't work well with Vite's development server due to CORS restrictions. The service worker cannot load modules from `http://localhost:5173` due to Chrome's security policy.

## Solutions

### Option 1: Build Mode with Watch (Recommended)

Instead of using `npm run dev`, use the build watch mode:

```bash
pnpm run dev:build
```

This will:
- Build the extension to the `dist` folder
- Watch for changes and rebuild automatically
- Avoid CORS issues entirely

Then load the extension in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

When you make changes, the extension will rebuild automatically. You may need to click the refresh button on the extension card in `chrome://extensions/`.

### Option 2: Use Vite Dev Server (Limited)

If you want to use the dev server for faster popup development:

```bash
pnpm run dev
```

**Note**: The service worker hot reload may not work properly, and you'll see CORS errors. This is normal. The popup should still work.

To test service worker changes:
1. Stop the dev server
2. Run `pnpm run build`
3. Reload the extension in Chrome

### Option 3: Hybrid Approach

1. Keep `pnpm run dev:build` running in one terminal
2. Open `http://localhost:5173/popup.html` in a regular browser tab for faster UI development
3. Load the `dist` folder as an unpacked extension for full extension testing

## Common Issues

### Service Worker Registration Failed (Status Code 3)

**Cause**: Service worker trying to load from Vite dev server  
**Solution**: Use `pnpm run dev:build` instead of `pnpm run dev`

### CORS Errors

**Cause**: Chrome extensions can't access `http://localhost:5173` due to CORS  
**Solution**: Use build mode, not dev mode

### Changes Not Reflected

**Cause**: Chrome has cached the extension  
**Solution**: 
1. Go to `chrome://extensions/`
2. Click the refresh button on your extension
3. Or disable and re-enable the extension

## Best Practices

1. **UI Development**: Use `pnpm run dev` and open `http://localhost:5173/popup.html` in a browser tab
2. **Extension Testing**: Use `pnpm run dev:build` and load the `dist` folder
3. **Production Build**: Use `pnpm run build` before publishing

## Debugging

### Service Worker Logs

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" under "Inspect views"
4. Check the console for logs

### Popup Logs

1. Right-click on the extension icon
2. Click "Inspect popup"
3. Check the console for logs

### Force Reload

If the extension is behaving strangely:
1. Go to `chrome://extensions/`
2. Remove the extension
3. Rebuild: `pnpm run build`
4. Re-add the extension from the `dist` folder
