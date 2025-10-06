# Phase 0.2: WASM-Lua Proof of Concept - Research

**Status**: In Progress  
**Timeline**: Week 2-3 of Phase 0  
**Date Started**: October 6, 2025

## Objective

Validate that Lua can be compiled to WASM and integrated into the Chrome extension with acceptable:
- Performance (1000 contract reads in <5s)
- Bundle size (<1MB)
- Developer experience
- Error handling quality
- Memory management

## Candidates to Evaluate

### 1. Fengari
- **Type**: Lua VM implemented in JavaScript
- **Package**: `fengari-web`
- **GitHub**: https://github.com/fengari-lua/fengari
- **Status**: Active maintenance
- **Pros**: Easy integration, good documentation, JS interop built-in
- **Cons**: Not pure WASM, potentially larger bundle

### 2. lua.vm.js
- **Type**: Lua VM compiled to WASM via Emscripten
- **Package**: `lua.vm.js`
- **GitHub**: https://github.com/daurnimator/lua.vm.js
- **Status**: Maintained but less active
- **Pros**: True WASM, good performance
- **Cons**: Harder to customize, less documentation

### 3. Wasmoon
- **Type**: Lua 5.4 compiled to WASM
- **Package**: `wasmoon`
- **GitHub**: https://github.com/ceifa/wasmoon
- **Status**: Active, modern
- **Pros**: TypeScript support, modern API, good performance
- **Cons**: Newer project, less battle-tested

## Installation Plan

```bash
# Install all candidates for testing
npm install fengari-web
npm install lua.vm.js
npm install wasmoon

# Dev dependencies for testing
npm install -D @types/node
```

## Evaluation Matrix

| Criterion | Weight | Fengari | lua.vm.js | Wasmoon | Target |
|-----------|--------|---------|-----------|---------|--------|
| Bundle Size | High | ? | ? | ? | <1MB |
| Performance | High | ? | ? | ? | <5s for 1000 ops |
| Memory Usage | Medium | ? | ? | ? | <50MB |
| Error Messages | High | ? | ? | ? | Clear & actionable |
| JS Interop | Critical | ? | ? | ? | Seamless |
| Documentation | Medium | ? | ? | ? | Good |
| TypeScript Support | Medium | ? | ? | ? | Full types |
| Maintenance | Medium | ? | ? | ? | Active |

## Test Scripts to Build

1. **Basic Execution Test** - Can we run Lua code?
2. **Performance Test** - How fast is it?
3. **Memory Test** - How much RAM does it use?
4. **Error Handling Test** - Are errors clear?
5. **JS Interop Test** - Can we pass data bidirectionally?
6. **Async Test** - Can we handle async operations?
7. **Timeout Test** - Can we enforce execution limits?
8. **Bundle Size Test** - How big is the final bundle?

## Next Steps

1. ✅ Create this research document
2. ⏳ Install Fengari and test
3. ⏳ Install lua.vm.js and test
4. ⏳ Install Wasmoon and test
5. ⏳ Run all benchmark tests
6. ⏳ Document findings
7. ⏳ Make recommendation

---

**Research will be documented in**: `docs/architecture/wasm-lua-poc-results.md`
