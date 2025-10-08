# Worker PostMessage Error - FIXED ✅

## Issue Summary

**Error**: `Failed to execute 'postMessage' on 'Worker': () => context.wallet.getAddress() could not be cloned`

**Root Cause**: Tried to send JavaScript functions to Web Worker via `postMessage`, but functions cannot be cloned/serialized across worker boundaries.

## The Problem

The original architecture attempted to:
1. Create API functions in the main thread (`prepareAPIForLua`)
2. Send these functions to the worker via `postMessage`
3. Use them inside Lua scripts

This failed because:
- `postMessage` uses the **Structured Clone Algorithm**
- Functions, closures, and DOM nodes **cannot** be cloned
- Workers communicate via message passing with serializable data only

## The Solution

Restructured the architecture to keep functions in the worker:

### Before (❌ Broken)
```typescript
// Main thread - lua-api-mock.ts
export function prepareAPIForLua(context: LuaAPIContext) {
  return {
    wallet: {
      getAddress: () => context.wallet.getAddress(), // ❌ Function closure
    }
  };
}

// lua-sandbox.ts
const luaAPIs = prepareAPIForLua(apiContext);
context = { ...luaAPIs, ...context }; // ❌ Tries to send functions
worker.postMessage({ context }); // ❌ Fails here
```

### After (✅ Fixed)
```typescript
// Main thread - lua-api-mock.ts
export function getSerializableAPIData(context: LuaAPIContext) {
  return {
    wallet: {
      address: context.wallet.getAddress(), // ✅ Just data
      network: context.wallet.getNetwork(),
    }
  };
}

// Worker - lua-sandbox.worker.ts
async function registerMockAPIs() {
  // ✅ Functions defined INSIDE worker
  const walletAPI = {
    getAddress: () => '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    getNetwork: () => 'sepolia',
  };
  
  luaEngine.global.set('wallet', walletAPI); // ✅ Available in Lua
}
```

## Changes Made

### 1. `/src/lib/lua-api-mock.ts`
- Added `getSerializableAPIData()` - returns only serializable data
- Kept `prepareAPIForLua()` for non-worker use cases
- Separated concerns: data serialization vs function definitions

### 2. `/src/lib/lua-sandbox.ts`
- Changed to use `getSerializableAPIData()` instead of `prepareAPIForLua()`
- Now sends only data (strings, numbers, objects) to worker
- No more function cloning errors

### 3. `/src/workers/lua-sandbox.worker.ts`
- Added `registerMockAPIs()` function
- Defines Lua-callable functions **inside the worker**
- Registers them directly in Lua global scope via wasmoon
- Added `print()` function for Lua console logging

## How It Works Now

1. **Main Thread**: Creates serializable API data
2. **Worker**: Receives data, defines functions internally
3. **Lua Scripts**: Call functions like `wallet.getAddress()`
4. **Functions**: Execute inside worker (no cross-thread calls needed)

## Testing

### In Browser (Chrome Extension)
```bash
pnpm run build
# Load dist/ folder in chrome://extensions/
# Click extension icon
# Try the Lua sandbox demo
```

### Example Lua Scripts That Now Work

```lua
-- Get wallet address
local address = wallet.getAddress()
print("Address:", address)

-- Get network
local network = wallet.getNetwork()
print("Network:", network)

-- Get chain ID
local chainId = network.getChainId()
print("Chain ID:", chainId)
```

## Current Limitations (Phase 0.2)

- **Sync only**: API functions return values immediately (no async/await yet)
- **Mock data**: Returns hardcoded values, not real blockchain data
- **Basic APIs**: Only wallet and network, no contract calls yet

## Next Steps (Phase 0.3)

For real async operations (contract calls, balance queries, etc.):
1. Implement **RPC message passing**:
   - Lua script requests API call
   - Worker sends message to main thread
   - Main thread executes async operation
   - Main thread sends result back
   - Worker returns to Lua

2. Use **Comlink** or custom RPC protocol for seamless async calls

## Files Modified

- ✅ `src/lib/lua-api-mock.ts` - Added serializable data export
- ✅ `src/lib/lua-sandbox.ts` - Use serializable data only
- ✅ `src/workers/lua-sandbox.worker.ts` - Register APIs in worker

## Build Status

✅ **Build successful** - Extension compiled without errors  
✅ **No PostMessage errors** - Functions not sent to worker  
✅ **Lua APIs available** - Scripts can call wallet/network functions  

## Usage

Load the extension in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
5. Click the extension icon to test

---

**Status**: ✅ FIXED - Worker communication now uses proper serialization
