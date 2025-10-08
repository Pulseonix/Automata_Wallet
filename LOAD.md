# 🚀 Quick Load Instructions

## Load in Chrome (3 Steps)

1. **Open**: `chrome://extensions/`
2. **Enable**: "Developer mode" toggle (top-right)
3. **Load**: Click "Load unpacked" → Select `dist` folder

Path: `/home/pulseonix/Desktop/zX/wallet/dist`

---

## Test It Works

Click the extension icon → Try this Lua code:

```lua
local address = wallet.getAddress()
local network = wallet.getNetwork()
local balance = wallet.getBalance()
return string.format("Address: %s\nNetwork: %s\nBalance: %s ETH", address, network, balance)
```

Expected output:
```
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Network: sepolia
Balance: 1.5 ETH
```

---

## More Test Scripts

**Get Chain Info**:
```lua
local chainId = network.getChainId()
local block = network.getBlockNumber()
return "Chain ID: " .. chainId .. ", Block: " .. block
```

**With Debug Logging**:
```lua
print("Checking wallet...")
local address = wallet.getAddress()
print("Found address:", address)
return address
```
(Check console for `[Lua]` logs)

---

## Development Commands

| Command | Use Case |
|---------|----------|
| `pnpm run dev:build` | 🔄 Watch mode - auto rebuild |
| `pnpm run build` | 📦 Production build |
| `pnpm run dev` | 🎨 Popup UI dev (browser tab) |

---

## Reload After Changes

1. Make code changes
2. Wait for rebuild (if using `dev:build`)
3. Go to `chrome://extensions/`
4. Click ↻ (refresh) on extension card
5. Test changes

---

## Debug

**Service Worker**: `chrome://extensions/` → Click "service worker"  
**Popup**: Right-click icon → "Inspect popup"  
**Worker Console**: Inspect popup → See `[Lua]` logs from `print()`

---

**All fixed!** No more CORS, postMessage, or API errors. 🎉
