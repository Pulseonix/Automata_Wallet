# Security Policy

## Reporting Security Vulnerabilities

**DO NOT** create public GitHub issues for security vulnerabilities.

### How to Report

Send security reports to: [security@automata-wallet.io] (TBD - use encrypted email when available)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will respond within 48 hours and aim to resolve critical issues within 7 days.

## Bug Bounty Program

**Status:** Not yet active (will launch after Phase 5 security audit)

**Future Scope:**
- Critical: $500-2000
- High: $200-500
- Medium: $50-200
- Low: $10-50

## Security Best Practices

### For Users
- ✅ Never share your seed phrase with anyone
- ✅ Always verify transaction details before approving
- ✅ Review scripts before running them
- ✅ Use strong, unique passwords (12+ characters)
- ✅ Keep your browser updated
- ⛔ Don't install scripts from untrusted sources
- ⛔ Don't use this wallet for large amounts during beta

### For Developers
- ✅ All crypto operations use WebCrypto API
- ✅ Lua scripts run in sandboxed WASM environment
- ✅ User approval required for all state changes
- ✅ Content Security Policy enforced
- ✅ No eval() or Function() constructor usage
- ✅ Input validation on all user data
- ✅ Rate limiting on sensitive operations

## Known Limitations (Phase 0)

This is alpha software:
- ❌ No external security audit yet (planned Phase 5)
- ❌ Limited testing coverage
- ❌ Experimental Lua sandbox
- ❌ No formal verification
- ⚠️ **DO NOT USE WITH REAL FUNDS**

## Security Architecture

### Key Management
- BIP-39 seed phrase generation
- BIP-44 HD wallet derivation
- AES-GCM encryption with PBKDF2 key derivation
- Keys stored in Chrome's encrypted storage
- Memory cleared after operations

### Script Sandboxing
- Lua runs in WASM sandbox
- Isolated from main extension context
- Web Worker process isolation
- No direct access to browser APIs
- Whitelisted API surface only
- Timeout enforcement (30s max)

### Transaction Safety
- All transactions require explicit user approval
- Clear transaction preview with simulation
- Script attribution shown
- Rate limiting (max 10 txns per execution)
- Gas estimation with safety buffer

## Audit History

**Current Status:** Not yet audited

**Planned:** External security audit in Phase 5 (Week 18-20)
- Scope: Full codebase review
- Focus: Crypto operations, sandbox security, transaction flow
- Vendor: TBD (Trail of Bits, OpenZeppelin, or similar)

## Updates

This policy will be updated as the project matures. Last updated: October 2025
