# ADR-001: Lua Scripting Engine Choice

**Status:** Proposed  
**Date:** 2025-10-06  
**Authors:** Development Team

## Context

Automata Wallet requires a scripting language for user automation. The language must be:
1. Safe to execute in a browser extension
2. Sandboxable with strong isolation
3. Easy to learn for non-programmers
4. Fast enough for real-time blockchain operations
5. Small bundle size

## Decision Candidates

### Option 1: Lua via WASM (Fengari/Emscripten)
**Pros:**
- Lua is simple and beginner-friendly
- Strong sandboxing via WASM
- Small runtime (~500KB)
- Excellent performance
- Mature language with good documentation

**Cons:**
- WASM compilation complexity
- Need to build custom bindings
- Less familiar than JavaScript

### Option 2: JavaScript (QuickJS in WASM)
**Pros:**
- Users already know JavaScript
- Rich ecosystem
- Easy to integrate

**Cons:**
- Larger bundle size (~1.5MB)
- Harder to sandbox safely
- More security surface area
- Complexity makes it harder to audit

### Option 3: Python (Pyodide)
**Pros:**
- Popular in data science
- Excellent for analytics scripts

**Cons:**
- Massive bundle size (~6MB+)
- Slow startup time
- Overkill for simple automation

## Decision

**We will use Lua compiled to WASM (via Fengari or custom Emscripten build).**

### Rationale

1. **Security First:** WASM provides strong isolation boundaries. Lua's simple design makes it easier to audit.
2. **Performance:** Lua is fast and has minimal overhead.
3. **Bundle Size:** ~500KB is acceptable for an extension.
4. **Learning Curve:** Lua is simpler than JavaScript for beginners.
5. **Control:** We can carefully design the API surface.

### Implementation Plan (Phase 0.2)

**Week 1: Research & Selection**
- Test Fengari (pure Lua interpreter in JS, then to WASM)
- Test custom Emscripten build of standard Lua 5.4
- Benchmark both for performance
- Document findings

**Week 2: Proof of Concept**
Build PoC demonstrating:
- Lua execution in Web Worker
- Bidirectional JS ↔ Lua communication
- Error handling and stack traces
- Memory management
- 1000+ contract read operations benchmark

### Success Criteria

- [ ] Lua code executes in isolated WASM environment
- [ ] Can pass data between JS and Lua bidirectionally
- [ ] Error messages are clear and actionable
- [ ] Performance: 1000 contract reads in <5 seconds
- [ ] Bundle size: <1MB total (including runtime)
- [ ] Memory usage: <50MB for typical scripts

### Fallback Plan

If WASM approach fails or performance is inadequate:
1. **Fallback A:** Use QuickJS (JavaScript in WASM)
2. **Fallback B:** Design a custom DSL (domain-specific language)
3. **Fallback C:** Use JavaScript with vm2 library (less secure)

## Consequences

### Positive
- Strong security boundaries
- Excellent performance
- Small bundle size
- Simple, auditable code

### Negative
- Users must learn Lua (mitigated by examples and docs)
- Custom tooling needed for debugging
- WASM might have browser compatibility issues (mitigated: Chrome-only initially)

### Neutral
- Need to build comprehensive API documentation
- Lua community is smaller than JavaScript

## References

- [Fengari Documentation](https://fengari.io/)
- [Lua 5.4 Reference Manual](https://www.lua.org/manual/5.4/)
- [Emscripten Documentation](https://emscripten.org/)
- [WebAssembly Security](https://webassembly.org/docs/security/)

## Related ADRs

- [ADR-002: Sandbox Security Model](./ADR-002-sandbox-security.md)
- [ADR-004: API Design Principles](./ADR-004-api-design.md) (Planned)

---

**Note:** This decision will be finalized after Phase 0.2 PoC completion.
