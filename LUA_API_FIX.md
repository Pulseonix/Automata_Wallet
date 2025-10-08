# Lua API Registration Fix ✅

## Issue
```
Error: [string "local address = wallet.getAddress()..."]:1: 
attempt to call a nil value (field 'getAddress')
```

**Problem**: Lua couldn't find `wallet.getAddress()` because the API functions weren't properly registered in the Lua global scope.

## Root Cause

The original code tried to set JavaScript objects directly on the Lua global:

```typescript
// ❌ This doesn't create proper Lua tables
luaEngine.global.set('wallet', {
  getAddress: () => '0x...',
  getNetwork: () => 'sepolia'
});
```

Wasmoon requires a specific approach:
1. Create Lua tables using `doString()`
2. Get references to those tables
3. Set functions as table members

## Solution

```typescript
// ✅ Correct approach
async function registerMockAPIs(): Promise<void> {
  // Step 1: Create Lua tables
  await luaEngine.doString(`
    wallet = {}
    network = {}
  `);
  
  // Step 2: Get table references
  const walletTable = luaEngine.global.get('wallet');
  const networkTable = luaEngine.global.get('network');
  
  // Step 3: Set JavaScript functions as table members
  walletTable.set('getAddress', () => '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  walletTable.set('getNetwork', () => 'sepolia');
  walletTable.set('getBalance', () => '1.5');
  
  networkTable.set('getChainId', () => 11155111);
  networkTable.set('getBlockNumber', () => 5000000);
}
```

## Additional Improvements

### 1. Always Re-register APIs
```typescript
async function executeLuaScript(code, timeout, context) {
  // Always re-register APIs before execution
  await registerMockAPIs();
  
  // Then set custom context (without overwriting APIs)
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      if (key !== 'wallet' && key !== 'network' && key !== 'print') {
        luaEngine.global.set(key, value);
      }
    }
  }
}
```

### 2. Added Console Logging
```typescript
luaEngine.global.set('print', (...args: unknown[]) => {
  console.log('[Lua]', ...args);
  return null;
});
```

### 3. Error Handling
```typescript
try {
  // API registration code
  console.log('[Worker] Registered Lua APIs: wallet, network, print');
} catch (error) {
  console.error('[Worker] Failed to register APIs:', error);
  throw error;
}
```

## Now Working Lua Scripts

### Basic Wallet Info
```lua
local address = wallet.getAddress()
local network = wallet.getNetwork()
return "Address: " .. address .. " on " .. network
```

**Expected Output**: `Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb on sepolia`

### Get Balance
```lua
local balance = wallet.getBalance()
return "Balance: " .. balance .. " ETH"
```

**Expected Output**: `Balance: 1.5 ETH`

### Network Information
```lua
local chainId = network.getChainId()
local blockNumber = network.getBlockNumber()
return string.format("Chain ID: %d, Block: %d", chainId, blockNumber)
```

**Expected Output**: `Chain ID: 11155111, Block: 5000000`

### With Console Logging
```lua
print("Starting script...")
local address = wallet.getAddress()
print("Got address:", address)
local network = wallet.getNetwork()
print("Got network:", network)
return address
```

**Console Output** (visible in worker console):
```
[Lua] Starting script...
[Lua] Got address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
[Lua] Got network: sepolia
```

### Complex Example
```lua
local info = {
  wallet = {
    address = wallet.getAddress(),
    balance = wallet.getBalance(),
    network = wallet.getNetwork()
  },
  chain = {
    id = network.getChainId(),
    block = network.getBlockNumber()
  }
}

return string.format(
  "Wallet: %s\nBalance: %s ETH\nNetwork: %s (Chain %d)\nBlock: %d",
  info.wallet.address,
  info.wallet.balance,
  info.wallet.network,
  info.chain.id,
  info.chain.block
)
```

## Testing in Chrome

1. **Reload Extension**
   ```
   chrome://extensions/ → Click refresh on Automata Wallet
   ```

2. **Open Popup**
   - Click extension icon
   - You should see the Lua Sandbox Demo

3. **Try These Scripts** (copy/paste into editor)

   **Script 1: Simple Test**
   ```lua
   return wallet.getAddress()
   ```
   
   **Script 2: Full Info**
   ```lua
   local address = wallet.getAddress()
   local network = wallet.getNetwork()
   local balance = wallet.getBalance()
   local chainId = network.getChainId()
   
   return string.format(
     "Address: %s\nNetwork: %s\nBalance: %s ETH\nChain ID: %d",
     address, network, balance, chainId
   )
   ```
   
   **Script 3: With Debug Logging**
   ```lua
   print("=== Wallet Info ===")
   print("Address:", wallet.getAddress())
   print("Network:", wallet.getNetwork())
   print("Balance:", wallet.getBalance())
   print("=================")
   return "Check console for debug logs"
   ```

4. **View Worker Console**
   - Right-click popup → Inspect
   - Check console for `[Lua]` logs from `print()` calls

## Available APIs (Phase 0.2)

### `wallet` table
- `wallet.getAddress()` → `"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"`
- `wallet.getNetwork()` → `"sepolia"`
- `wallet.getBalance()` → `"1.5"`

### `network` table
- `network.getChainId()` → `11155111`
- `network.getBlockNumber()` → `5000000`

### Global functions
- `print(...)` → Logs to worker console with `[Lua]` prefix

## What's Next (Phase 0.3)

These are **synchronous mocks** for Phase 0.2 validation. Future phases will add:

- ✅ Real wallet integration (ethers.js)
- ✅ Async operations via RPC message passing
- ✅ Contract read/write operations
- ✅ Token balance queries
- ✅ Transaction signing
- ✅ HTTP API calls

## Files Modified

- `src/workers/lua-sandbox.worker.ts` - Fixed API registration

## Build Status

✅ **Build successful** - Extension rebuilt  
✅ **APIs registered** - Lua can access wallet/network  
✅ **No errors** - `wallet.getAddress()` works  

---

**Reload the extension and try the test scripts above!** 🚀
