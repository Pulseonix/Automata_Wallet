# Automata Wallet - AI Coding Instructions

## Project Overview

**Automata Wallet** is a programmable crypto wallet Chrome extension with Lua scripting capabilities. Think "Tasker for Web3" - enabling users to automate blockchain interactions through secure, sandboxed Lua scripts.

**Current Status**: Phase 0 Complete (Foundation & Technical Validation) - **Ready for Phase 1** (Core Wallet Infrastructure)

**Tech Stack**: React 18 + TypeScript + Vite + Chrome Manifest V3 + Wasmoon (Lua in WASM) + ethers.js v6

## Architecture: The Big Picture

### Three-Tier Security Model

```
Main Thread (UI/Wallet)
    ↓ postMessage
Script Execution Service (Validation/Rate Limiting)
    ↓ postMessage
Web Worker (Lua WASM Sandbox - ZERO extension API access)
```

**Critical**: Lua scripts run in **isolated Web Workers** with **WASM sandbox** (Wasmoon). They NEVER have direct access to wallet keys, Chrome APIs, or DOM. All operations go through message passing with explicit approval flows.

### Key Components

1. **`src/lib/lua-sandbox.ts`**: Main thread orchestrator - manages worker lifecycle, handles timeouts, routes messages
2. **`src/workers/lua-sandbox.worker.ts`**: Isolated execution environment - runs Lua via Wasmoon, enforces limits
3. **`src/lib/lua-api-mock.ts`**: Mock APIs for Phase 0.2 PoC - will become real RPC bridge in Phase 3
4. **`src/popup/App.tsx`**: Extension popup UI - currently shows demo, will become full wallet interface
5. **`src/background/index.ts`**: MV3 service worker - handles wallet operations, storage, alarms

**Data Flow Example**: User clicks "Run Script" → `LuaSandbox.execute()` sends message to worker → Worker runs Lua in WASM → Results via `postMessage` → UI updates

## Critical Development Patterns

### 1. Chrome Extension MV3 Development Workflow

**IMPORTANT**: Standard Vite dev server (`pnpm dev`) doesn't work well with service workers due to CORS.

**Use this instead**:
```bash
pnpm run dev:build  # Watch mode that builds to dist/
```

Then load `dist/` folder in Chrome (`chrome://extensions` → Load unpacked). Extension auto-rebuilds on changes.

**Why**: Service workers can't load modules from `http://localhost:5173` due to Chrome security. See `DEVELOPMENT.md` for details.

### 2. Web Worker + WASM Pattern

When creating new worker functionality:

```typescript
// Main thread (lua-sandbox.ts)
const worker = new Worker(
  new URL('../workers/lua-sandbox.worker.ts', import.meta.url),
  { type: 'module' }
);

// Use structured clone messages (no functions!)
worker.postMessage({ type: 'execute', id, code, context });
```

**Key constraint**: You CANNOT pass functions via `postMessage`. Use serializable data only. See `getSerializableAPIData()` in `lua-api-mock.ts` for the pattern.

### 3. Lua API Design (Future Phase 3)

Current mock APIs in `lua-api-mock.ts` return static data. Phase 3 will implement real async RPC:

```typescript
// Phase 3 pattern (not yet implemented)
function createWalletAPI() {
  return {
    getBalance: () => sendRPCMessage({ method: 'wallet.getBalance' })
    // Returns promise that main thread resolves with actual balance
  };
}
```

**When adding new Lua APIs**: Follow ADR-002 security model - read operations can auto-approve, write operations (txns) MUST show user approval dialog.

### 4. BIP-39/44 Standard (Phase 1 - Upcoming)

When implementing wallet core (see ADR-003):
- Use `ethers.HDNodeWallet` for BIP-44 derivation: `m/44'/60'/0'/0/0`
- Encrypt mnemonic with WebCrypto AES-GCM (PBKDF2 100k iterations)
- NEVER expose raw private keys to Lua scripts
- Store encrypted data in `chrome.storage.local`

### 5. Testing Strategy

```bash
pnpm test              # Vitest unit tests
pnpm test:ui           # Interactive test UI
pnpm test:coverage     # Coverage report
pnpm test:benchmarks   # Lua performance benchmarks
```

**Important**: Tests in `src/__tests__/lua-sandbox.test.ts` run in **browser environment** (jsdom). Web Worker tests need ~100ms initialization delay before running.

**Performance target**: Lua operations must complete in <10ms (currently averaging 0.05ms - 100x better than target!)

## Project-Specific Conventions

### File Organization

- **`src/lib/`**: Core libraries (crypto, wallet, lua) - pure logic, no UI
- **`src/components/`**: Reusable React components (UI-only)
- **`src/popup/`**: Extension popup entry point
- **`src/background/`**: Service worker (MV3 background script)
- **`src/workers/`**: Web Workers (isolated execution contexts)
- **`docs/architecture/`**: ADRs (Architectural Decision Records) - **READ THESE FIRST** when working on core features

### TypeScript Patterns

**Always use explicit types for worker messages**:
```typescript
export interface ExecuteScriptMessage {
  type: 'execute';
  id: string;
  code: string;
  timeout?: number;
  context?: Record<string, unknown>;  // NOT Record<string, any>
}
```

**Discriminated unions for results**:
```typescript
type ExecuteResponse<T> = 
  | { success: true; result: T; executionTime: number }
  | { success: false; error: string; executionTime: number };
```

### Security First

Before implementing ANY feature that:
- Accesses private keys/mnemonic
- Sends transactions
- Stores sensitive data
- Exposes new Lua APIs

**You MUST**: Read ADR-002 (Sandbox Security) and ADR-003 (Key Management). Then implement with multi-layer defense.

### Naming Conventions

- **Files**: kebab-case (`lua-sandbox.ts`, not `LuaSandbox.ts`)
- **React components**: PascalCase files + named exports (`LuaSandboxDemo.tsx` exports `LuaSandboxDemo`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EXECUTION_TIME`)
- **Interfaces**: PascalCase with descriptive names (`ExecuteScriptMessage`, not `Message`)

## Phase Roadmap Context

**Completed**:
- ✅ Phase 0.1: Project setup (Vite, React, TypeScript, Tailwind)
- ✅ Phase 0.2: WASM-Lua PoC (Wasmoon validation, 50-100x performance targets)

**Current Phase**: Phase 1 (Weeks 2-7) - Core Wallet Infrastructure
- BIP-39 seed generation
- WebCrypto encryption (AES-GCM + PBKDF2)
- Password management with rate limiting
- ethers.js integration (RPC providers)
- Basic ETH send/receive
- Transaction history

**Next**: Phase 2 (ERC-20 tokens), Phase 3 (Lua API implementation), Phase 4 (State-changing operations)

When implementing Phase 1 features, reference ADR-003 for crypto patterns.

## Common Tasks & Commands

```bash
# Development
pnpm run dev:build       # Build + watch for extension development
pnpm run build           # Production build
pnpm run type-check      # TypeScript validation (no emit)

# Testing
pnpm test                # Run all tests
pnpm test:sandbox        # Test Lua sandbox specifically
pnpm test:benchmarks     # Run performance benchmarks

# Code Quality
pnpm run lint            # ESLint check
pnpm run lint:fix        # Auto-fix linting issues
pnpm run format          # Prettier format
pnpm run format:check    # Check formatting

# Debugging
# Service worker logs: chrome://extensions → "service worker" link
# Popup logs: Right-click extension icon → "Inspect popup"
```

## Key Files to Understand First

When working on a new feature, read these in order:

1. **`README.md`**: Vision, status, tech stack overview
2. **`docs/architecture/ADR-00X-*.md`**: Architectural decisions for your feature area
3. **`src/lib/lua-sandbox.ts`**: Core sandbox orchestration pattern
4. **`PHASE_0.2_COMPLETE.md`**: What's been validated, what works, performance baselines
5. **Relevant test files**: See working examples of the component

## Dependencies: Key Libraries

- **`wasmoon`**: Lua 5.4 in WASM - sandboxed script execution
- **`ethers`**: Blockchain interactions (v6, NOT v5 - breaking changes!)
- **`@crxjs/vite-plugin`**: Chrome extension build tooling
- **`zustand`**: State management (when we add wallet state in Phase 1)
- **`@monaco-editor/react`**: Code editor with Lua syntax highlighting

**Bundle size constraint**: Total extension must stay <1MB (currently 656KB - 34% margin). When adding dependencies, check bundle impact with `pnpm run build` and inspect `dist/` sizes.

## Anti-Patterns to Avoid

❌ **Don't** expose private keys or mnemonic to Lua scripts - EVER  
❌ **Don't** use `eval()` or `Function()` constructors - violates CSP  
❌ **Don't** make synchronous blocking calls in workers - use async patterns  
❌ **Don't** assume `pnpm dev` works for extension testing - use `dev:build`  
❌ **Don't** bypass timeout enforcement - infinite loops must be caught  
❌ **Don't** add external network calls without updating `host_permissions` in `manifest.json`  

✅ **Do** use Web Workers for CPU-intensive tasks  
✅ **Do** implement proper error boundaries and recovery  
✅ **Do** write tests for security-critical code (100% coverage goal)  
✅ **Do** document architectural decisions in ADRs  
✅ **Do** follow the existing message-passing patterns  

## Questions to Ask Before Coding

1. **Does this feature involve private keys or transactions?** → Read ADR-003 first
2. **Will Lua scripts interact with this?** → Read ADR-002, ensure proper sandboxing
3. **Is this a new dependency?** → Check bundle size impact, security audit status
4. **Does this require network access?** → Update `manifest.json` host_permissions
5. **Is this performance-sensitive?** → Add benchmarks, target <10ms for Lua operations

## Additional Resources

- **Architecture Docs**: `/docs/architecture/` - ADRs for major decisions
- **Phase Summaries**: `PHASE_X.X_COMPLETE.md` files - what's done, what's next
- **Development Guide**: `DEVELOPMENT.md` - Chrome extension quirks, debugging tips
- **Security Policy**: `SECURITY.md` - Threat model, reporting vulnerabilities
- **Contributing**: `CONTRIBUTING.md` - Code style, PR process (coming in Phase 3)

---

**Security Notice**: This is a crypto wallet handling real funds (eventually). Every line of code in `src/lib/crypto/`, `src/lib/wallet/`, and `src/workers/` is security-critical. When in doubt, ask for review or reference the ADRs.

**Performance Notice**: Lua execution must feel instant (<100ms perceived latency). Always benchmark new Lua APIs with `pnpm test:benchmarks`.
