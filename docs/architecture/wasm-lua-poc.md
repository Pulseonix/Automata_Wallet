# WASM-Lua Proof of Concept Research

**Status:** In Progress  
**Phase:** 0.2 - Technical Validation  
**Date:** 2025-10-06

## Objective

Validate that Lua can be compiled to WASM and integrated into a Chrome extension with acceptable performance, bundle size, and developer experience.

## Evaluation Criteria

| Criterion | Target | Weight |
|-----------|--------|--------|
| Bundle size | <1MB | High |
| Execution speed | 1000 contract reads in <5s | High |
| Memory usage | <50MB typical | Medium |
| Error handling | Clear stack traces | High |
| JS interop | Bidirectional data passing | Critical |
| Development experience | Easy debugging | Medium |

## Candidates

### 1. Fengari

**Description:** Pure JavaScript implementation of Lua VM, can be bundled with Webpack/Vite.

**Pros:**
- Easy integration (npm install)
- Good documentation
- Active maintenance
- Built-in JS interop

**Cons:**
- Not true WASM (JS-based)
- Larger bundle size
- Slower than native WASM

**Status:** Testing in progress

### 2. lua.vm.js

**Description:** Lua VM compiled to WASM via Emscripten.

**Pros:**
- True WASM compilation
- Good performance
- Relatively small

**Cons:**
- Less active maintenance
- Harder to customize

**Status:** Testing in progress

### 3. Custom Emscripten Build

**Description:** Compile official Lua 5.4 to WASM ourselves.

**Pros:**
- Full control over build
- Latest Lua version
- Can optimize for size

**Cons:**
- Most complex setup
- Need to build C/JS bindings
- Maintenance burden

**Status:** Backup option

## Benchmark Plan

### Performance Tests

```typescript
// Test 1: Basic execution
const script = `
  local sum = 0
  for i = 1, 1000 do
    sum = sum + i
  end
  return sum
`;
const start = performance.now();
const result = lua.execute(script);
const duration = performance.now() - start;
console.log(`Basic loop: ${duration}ms`);

// Test 2: JS interop
lua.setGlobal('fetch', async (url) => {
  return await fetch(url);
});
const script2 = `
  local data = fetch("https://api.example.com/data")
  return data.value
`;
// Measure round-trip time

// Test 3: Contract reads simulation
const script3 = `
  local balances = {}
  for i = 1, 1000 do
    balances[i] = contract.read(
      "0x123...",
      "balanceOf",
      {wallet.getAddress()}
    )
  end
  return balances
`;
// Measure with mocked contract.read()
```

### Memory Tests

```typescript
// Monitor heap usage during script execution
const script = `
  local data = {}
  for i = 1, 10000 do
    data[i] = {
      address = "0x" .. string.rep("a", 40),
      balance = math.random(1000000)
    }
  end
  return #data
`;

const before = performance.memory.usedJSHeapSize;
const result = lua.execute(script);
const after = performance.memory.usedJSHeapSize;
console.log(`Memory used: ${(after - before) / 1024 / 1024}MB`);
```

### Error Handling Tests

```typescript
// Test 1: Syntax error
try {
  lua.execute(`local x = `); // Incomplete
} catch (error) {
  console.log('Syntax error:', error.message);
  console.log('Stack trace:', error.stack);
}

// Test 2: Runtime error
try {
  lua.execute(`error("Something went wrong")`);
} catch (error) {
  console.log('Runtime error:', error.message);
}

// Test 3: Call non-existent function
try {
  lua.execute(`nonExistentFunction()`);
} catch (error) {
  console.log('Call error:', error.message);
}
```

## Integration Requirements

### Must Have
- [x] Run Lua code in isolated Web Worker
- [x] Pass data from JS to Lua
- [x] Return results from Lua to JS
- [x] Catch and report errors
- [x] Support async operations
- [x] Timeout enforcement

### Nice to Have
- [ ] Source maps for debugging
- [ ] REPL for interactive testing
- [ ] Syntax highlighting
- [ ] Auto-completion

## Expected Results

### Fengari Benchmarks (Estimate)
- Bundle size: ~800KB
- Basic loop: ~5ms
- 1000 contract reads: ~3s
- Memory: ~30MB

### lua.vm.js Benchmarks (Estimate)
- Bundle size: ~500KB
- Basic loop: ~2ms
- 1000 contract reads: ~2s
- Memory: ~20MB

### Custom Build Benchmarks (Estimate)
- Bundle size: ~400KB
- Basic loop: ~1ms
- 1000 contract reads: ~1.5s
- Memory: ~15MB

## PoC Implementation

### File Structure
```
/wasm-poc/
  ├── index.html          # Test page
  ├── lua-worker.js       # Web Worker
  ├── lua-runtime.wasm    # Compiled Lua
  ├── api-bindings.js     # JS ↔ Lua bridge
  ├── benchmarks.js       # Performance tests
  └── README.md           # Results documentation
```

### API Design Mockup

```lua
-- Example script that PoC should support

-- Read operations (async)
local balance = wallet.getBalance()
local ethPrice = http.get("https://api.coingecko.com/...")

-- Contract interaction
local usdcBalance = contract.read(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "balanceOf",
  {wallet.getAddress()}
)

-- Data processing
local total = balance + (usdcBalance / 1e6)

-- Output
print("Total value: $" .. (total * ethPrice))
return total
```

## Go/No-Go Decision Criteria

### ✅ GO if:
- Bundle size <1MB
- Performance meets targets
- Error handling is adequate
- JS interop works reliably
- Memory usage is reasonable

### ❌ NO-GO if:
- Bundle size >2MB
- Performance >2x slower than target
- Error messages are unclear
- Cannot reliably pass data between JS and Lua
- Memory leaks detected

### Alternative Plan if NO-GO:
1. Try QuickJS (JavaScript in WASM)
2. Design custom DSL
3. Use restricted JavaScript with vm2

## Timeline

- **Week 1 (Oct 7-11):** Research and initial testing
- **Week 2 (Oct 14-18):** Benchmarking and comparison
- **End of Week 2:** Go/No-Go decision
- **If GO:** Proceed to Phase 3 (Lua Scripting Foundation)
- **If NO-GO:** Evaluate alternatives

## Resources

- [Fengari GitHub](https://github.com/fengari-lua/fengari)
- [lua.vm.js GitHub](https://github.com/daurnimator/lua.vm.js)
- [Emscripten Documentation](https://emscripten.org/docs/)
- [Lua 5.4 Manual](https://www.lua.org/manual/5.4/)

## Team Notes

_This section will be updated during the PoC phase with findings and decisions._

---

**Next Steps:**
1. Set up development environment
2. Install Fengari and lua.vm.js
3. Build basic PoC for each
4. Run benchmarks
5. Document results
6. Make recommendation
