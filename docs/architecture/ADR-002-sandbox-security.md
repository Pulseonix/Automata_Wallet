# ADR-002: Sandbox Security Model

**Status:** Proposed  
**Date:** 2025-10-06  
**Authors:** Development Team

## Context

User-provided scripts represent the highest security risk in Automata Wallet. We must ensure that malicious or buggy scripts cannot:
- Access private keys or seed phrases
- Make unauthorized transactions
- Escape the sandbox to access browser APIs
- Consume excessive resources
- Steal user data
- Perform CSRF or XSS attacks

## Decision

**We will implement a multi-layer sandbox using Web Workers + WASM + Message Passing.**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Extension Context (Main Thread)                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Popup UI / Background Service Worker                    │ │
│ │ - React components                                       │ │
│ │ - Wallet operations                                      │ │
│ │ - Transaction approval UI                                │ │
│ └──────────────────────┬──────────────────────────────────┘ │
│                        │ postMessage()                       │
│                        ▼                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Script Execution Service                                 │ │
│ │ - Message validation                                     │ │
│ │ - Rate limiting                                          │ │
│ │ - Transaction queuing                                    │ │
│ └──────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼──────────────────────────────────────┘
                         │ postMessage()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Web Worker (Isolated Thread)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Lua Sandbox Controller                                   │ │
│ │ - Script timeout enforcement                             │ │
│ │ - Memory limits                                          │ │
│ │ - API whitelisting                                       │ │
│ └──────────────────────┬──────────────────────────────────┘ │
│                        ▼                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ WASM Lua Runtime                                         │ │
│ │ - Lua 5.4 interpreter                                    │ │
│ │ - Zero access to JS globals                              │ │
│ │ - Only exposed API available                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

### Layer 1: Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
connect-src https://*.infura.io https://*.alchemy.com;
```

### Layer 2: Web Worker Isolation
- Scripts run in separate thread
- No access to DOM
- No access to extension APIs
- Communication only via structured clone messages

### Layer 3: WASM Sandbox
- Lua code compiled to WASM
- Linear memory isolation
- No direct access to JavaScript
- All I/O through explicit API

### Layer 4: API Whitelisting
Only explicitly exposed functions available:
```lua
-- ✅ Allowed
wallet.getBalance()
contract.read(address, "balanceOf", {myAddress})

-- ❌ Blocked (not in API)
chrome.storage.get()
fetch("https://evil.com")
process.exit()
```

### Layer 5: Message Validation
All messages validated with JSON Schema:
```typescript
type ScriptMessage = 
  | { type: 'READ', method: string, params: unknown[] }
  | { type: 'WRITE', tx: TransactionRequest }
  | { type: 'HTTP', url: string }  // whitelist checked

// Reject malformed or unauthorized messages
```

### Layer 6: Resource Limits
```typescript
const LIMITS = {
  MAX_EXECUTION_TIME: 30_000,      // 30 seconds
  MAX_MEMORY_MB: 50,                // 50MB
  MAX_TRANSACTIONS_PER_RUN: 10,    // 10 txns
  MAX_HTTP_REQUESTS: 20,            // 20 requests
  MAX_SCRIPT_SIZE_KB: 100,          // 100KB
};
```

### Layer 7: User Approval
All state-changing operations require explicit user approval:
- Transaction preview with full details
- Script attribution shown
- "Approve All" requires additional confirmation
- Rate limiting on approvals

## Implementation Details

### Script Execution Flow

```typescript
// 1. User clicks "Run Script" in UI
async function executeScript(scriptCode: string) {
  // 2. Validate script size
  if (scriptCode.length > MAX_SCRIPT_SIZE_KB * 1024) {
    throw new Error('Script too large');
  }
  
  // 3. Create isolated worker
  const worker = new Worker('lua-worker.js');
  
  // 4. Set timeout
  const timeout = setTimeout(() => {
    worker.terminate();
    throw new Error('Script timeout');
  }, MAX_EXECUTION_TIME);
  
  // 5. Send script to worker
  worker.postMessage({ type: 'EXECUTE', code: scriptCode });
  
  // 6. Handle messages
  worker.onmessage = async (event) => {
    const msg = validateMessage(event.data);
    
    if (msg.type === 'READ') {
      // Read operations are auto-approved
      const result = await handleReadOperation(msg);
      worker.postMessage({ type: 'RESULT', data: result });
    } 
    else if (msg.type === 'WRITE') {
      // Write operations require approval
      const approved = await showApprovalDialog(msg.tx);
      if (approved) {
        const txHash = await sendTransaction(msg.tx);
        worker.postMessage({ type: 'RESULT', data: txHash });
      } else {
        worker.postMessage({ type: 'ERROR', error: 'User rejected' });
      }
    }
  };
  
  // 7. Clean up
  clearTimeout(timeout);
  worker.terminate();
}
```

### Lua Worker Implementation

```typescript
// lua-worker.js
import LuaVM from './lua-runtime.wasm';

self.onmessage = async (event) => {
  if (event.data.type === 'EXECUTE') {
    const vm = new LuaVM();
    
    // Expose only whitelisted API
    vm.setGlobal('wallet', createWalletAPI());
    vm.setGlobal('contract', createContractAPI());
    
    try {
      const result = vm.execute(event.data.code);
      self.postMessage({ type: 'SUCCESS', result });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};

function createWalletAPI() {
  return {
    getBalance: () => {
      // Send message to main thread
      return sendSyncMessage({ type: 'READ', method: 'getBalance' });
    },
    sendETH: (to, amount) => {
      // Request user approval
      return sendSyncMessage({ 
        type: 'WRITE', 
        tx: { to, value: amount }
      });
    }
  };
}
```

## Threat Model Coverage

| Threat | Mitigation |
|--------|------------|
| Private key theft | Keys never exposed to scripts, stored in encrypted storage |
| Unauthorized transactions | All txns require user approval with full details |
| Sandbox escape | Multi-layer isolation (Worker + WASM + CSP) |
| Resource exhaustion | Timeout, memory limits, rate limiting |
| Phishing | Clear script attribution, warning on untrusted scripts |
| Network attacks | Whitelist allowed domains, no arbitrary HTTP |
| XSS/Injection | No eval(), structured messages only |
| Replay attacks | Nonce management, transaction validation |

## Testing Strategy

1. **Unit Tests:** Test each layer independently
2. **Integration Tests:** Test full execution flow
3. **Penetration Tests:** Attempt sandbox escapes
4. **Fuzzing:** Random inputs to find edge cases
5. **External Audit:** Professional security review (Phase 5)

## Open Questions

1. Should we allow localStorage access? (Leaning no)
2. Should scripts be able to spawn sub-scripts? (Leaning no)
3. Should we implement a permission system? (Deferred to v2)
4. Should scripts be sandboxed per-origin? (Deferred to v2)

## Consequences

### Positive
- Strong security boundaries
- Multiple layers of defense
- Clear security model
- Auditable implementation

### Negative
- Increased complexity
- Potential performance overhead
- May limit some legitimate use cases

### Risks
- WASM vulnerabilities (mitigated by staying updated)
- Worker communication overhead (mitigated by efficient serialization)
- False sense of security (mitigated by external audit)

## References

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Web Security](https://owasp.org/www-project-web-security-testing-guide/)
- [WebAssembly Security](https://webassembly.org/docs/security/)
- [Figma Plugin Security](https://www.figma.com/plugin-docs/security/) (similar sandbox model)

## Related ADRs

- [ADR-001: Lua Scripting Engine Choice](./ADR-001-lua-engine.md)
- [ADR-003: Key Management Strategy](./ADR-003-key-management.md)

---

**Status:** Awaiting implementation and security review.
