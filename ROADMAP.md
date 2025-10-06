# Automata Wallet - Development Roadmap

## Timeline Overview

**Total Duration**: 24 weeks to beta launch  
**Current Status**: Phase 0.1 Complete ✅  
**Next Milestone**: Phase 0.2 - WASM-Lua PoC

---

## Phase 0: Foundation & Technical Validation (3 weeks)

### Week 1: ✅ COMPLETE - Project & Infrastructure Setup
**Status**: ✅ All tasks completed

- [x] Initialize Git repository with security config
- [x] Set up CI/CD pipeline (GitHub Actions)
- [x] Configure Vite + React + TypeScript development environment
- [x] Create error tracking and logging infrastructure (Sentry)
- [x] Create comprehensive project documentation
- [x] Set up Chrome Manifest V3 extension structure

**Deliverables**: Production-ready project foundation with 35+ files

### Week 2-3: ⏳ IN PROGRESS - WASM-Lua Proof of Concept
**Status**: ⏳ Starting now

Tasks:
- [ ] Research Lua WASM compilers (Fengari, lua.vm.js, Emscripten)
- [ ] Build comprehensive PoC demonstrating:
  - [ ] Running Lua in WASM sandbox
  - [ ] Bidirectional data passing (JS ↔ Lua)
  - [ ] Memory management and garbage collection
  - [ ] Error handling and stack traces
  - [ ] Performance benchmarks (1000+ contract reads)
- [ ] Document PoC findings and create decision document
- [ ] Make Go/No-Go decision for Lua approach

**Success Criteria**:
- Bundle size <1MB
- 1000 contract reads in <5s
- Clear error messages
- Reliable JS-Lua interop

**Deliverable**: Technical validation report with Go/No-Go recommendation

---

## Phase 1: Secure Core Wallet (5 weeks)

### Week 4-5: Key Management & Security
Tasks:
- [ ] Implement BIP-39 seed phrase generation (12/24 word)
- [ ] Build HD wallet derivation (BIP-44 compatible)
- [ ] Create encryption layer using WebCrypto API (AES-GCM)
- [ ] Implement secure password requirements
- [ ] Build password-based key decryption flow with rate limiting
- [ ] Write comprehensive unit tests for all crypto operations

### Week 6-7: Basic Transaction Functionality
Tasks:
- [ ] Integrate ethers.js v6
- [ ] Implement RPC provider management (Infura/Alchemy)
- [ ] Build transaction construction for ETH transfers
- [ ] Implement gas estimation with buffer
- [ ] Create transaction signing flow
- [ ] Build transaction broadcasting and confirmation tracking

### Week 8: UI & Asset Display
Tasks:
- [ ] Design and implement main wallet UI
- [ ] Display wallet address with copy functionality
- [ ] Show ETH balance with USD conversion
- [ ] Build send transaction UI with validation
- [ ] Create transaction confirmation modal

**Deliverable**: Functional ETH-only wallet that can send/receive

---

## Phase 2: Enhanced Wallet Features (3 weeks)

### Week 9-10: ERC-20 Token Support
Tasks:
- [ ] Implement token contract detection and balance fetching
- [ ] Add support for 10 major tokens (USDC, USDT, DAI, etc.)
- [ ] Build token selection UI for sending
- [ ] Implement token approval flow
- [ ] Add token import by contract address

### Week 10-11: Transaction History & Network Management
Tasks:
- [ ] Integrate Etherscan API for transaction history
- [ ] Build transaction list UI with filtering
- [ ] Add network switcher (Mainnet, Sepolia testnet)
- [ ] Implement custom RPC endpoint configuration
- [ ] Add activity feed with status updates

**Deliverable**: Full-featured wallet comparable to basic MetaMask

---

## Phase 3: Lua Scripting Foundation (5 weeks)

### Week 12-13: Sandbox Integration
Tasks:
- [ ] Integrate Lua WASM module into extension bundle
- [ ] Build isolated execution context (Web Worker + WASM)
- [ ] Implement message-passing bridge
- [ ] Add script timeout mechanism (max 30s)
- [ ] Create memory limits and resource quotas
- [ ] Build comprehensive error handling system

### Week 14-15: Read-Only API Implementation
Tasks:
- [ ] Design and document Lua API specification
- [ ] Implement wallet.* API (getAddress, getBalance)
- [ ] Implement contract.read() for view functions
- [ ] Implement network.* API
- [ ] Add http.get() for external data
- [ ] Write API documentation with examples

### Week 16: Script Editor UI
Tasks:
- [ ] Integrate Monaco Editor
- [ ] Add Lua syntax highlighting and autocomplete
- [ ] Build script management UI (save/load/delete)
- [ ] Create console panel for script output
- [ ] Add script templates and examples

**Deliverable**: Users can write and run read-only Lua scripts

---

## Phase 4: State-Changing Operations (3 weeks)

### Week 17: Transaction API Design
Tasks:
- [ ] Design state-changing API specification
- [ ] Implement transaction builder pattern in Lua
- [ ] Create wallet.sendETH() function
- [ ] Create wallet.sendToken() function
- [ ] Create contract.write() for contract interactions

### Week 18-19: Approval Flow Integration
Tasks:
- [ ] Build transaction preview UI for script-generated txns
- [ ] Show clear attribution (which script created transaction)
- [ ] Implement multi-transaction approval flow
- [ ] Add transaction simulation preview
- [ ] Create "approve all" option with safeguards
- [ ] Add rate limiting (max 10 txns per script)

**Deliverable**: Scripts can create transactions requiring user approval

---

## Phase 5: Security Hardening (3 weeks)

### Week 20: Internal Security Review
Tasks:
- [ ] Conduct threat modeling workshop
- [ ] Perform code review focused on security
- [ ] Test sandbox escape scenarios
- [ ] Validate encryption implementation
- [ ] Check for XSS/injection vulnerabilities
- [ ] Review permission model and CSP headers

### Week 21-22: External Security Audit
Tasks:
- [ ] Hire reputable security firm
- [ ] Prepare audit materials and documentation
- [ ] Address all high/critical findings
- [ ] Re-test fixed vulnerabilities
- [ ] Obtain audit report for publication

**Deliverable**: Security audit report with all critical issues resolved

---

## Phase 6: Beta Preparation (2 weeks)

### Week 23: Polish & Documentation
Tasks:
- [ ] UI/UX refinement based on internal testing
- [ ] Write comprehensive user documentation
- [ ] Create API reference documentation
- [ ] Build 10 example scripts (portfolio tracker, alerts, etc.)
- [ ] Record demo videos and tutorials

### Week 24: Infrastructure & Analytics
Tasks:
- [ ] Build landing page with waitlist
- [ ] Set up private Discord
- [ ] Implement analytics (Plausible)
- [ ] Create feedback collection system
- [ ] Prepare Chrome Web Store assets
- [ ] Write Terms of Service and Privacy Policy

**Deliverable**: Complete beta launch package

---

## Phase 7: Beta Launch & Iteration (6+ weeks)

### Week 25-26: Limited Beta (50 users)
- Deploy as unlisted Chrome extension
- High-touch onboarding in Discord
- Daily check-ins on critical issues
- Hot-fix deployment capability

### Week 27-28: Expanded Beta (200 users)
- Invite second wave
- Analyze usage patterns
- Identify most-requested features
- Deploy 1-2 minor updates

### Week 29-30: Full Beta (500 users)
- Open to all waitlist members
- Analyze churn and retention
- Prepare public launch decision

**Success Metrics**:
- Zero critical vulnerabilities
- <1% crash rate
- >60% script execution success
- >40% weekly active retention
- Average user creates 3+ scripts

---

## Current Progress Tracker

```
Phase 0: Foundation              [████████████░░░░░░] 67% (Week 1 of 3)
Phase 1: Core Wallet             [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 2: Enhanced Features       [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 3: Lua Scripting           [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 4: State Changes           [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 5: Security Hardening      [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 6: Beta Prep               [░░░░░░░░░░░░░░░░░░]  0% (Not started)
Phase 7: Beta Launch             [░░░░░░░░░░░░░░░░░░]  0% (Not started)

Overall Progress: █░░░░░░░░░░░░░░░░░░ 4%
```

---

## Resource Requirements

### Recommended Team
- 1 Senior Blockchain Developer (full-time)
- 1 Frontend Developer (full-time)
- 1 Security Consultant (10 hrs/week during Phases 3-5)
- **Total**: ~2.5 FTE

### Budget (6 months)
- Development tools: $200/month
- RPC providers: $500-1000/month
- Security audit: $15,000-30,000
- **Total**: $25,000-40,000

---

## Risk Mitigation

### Technical Risks
- **WASM Performance**: Early PoC with benchmarks (Phase 0.2)
- **Chrome Rejection**: Study policies, launch on Firefox/Edge too
- **RPC Costs**: Aggressive caching, user-configurable endpoints

### Security Risks
- **Sandbox Escape**: External audit + bug bounty
- **Phishing Scripts**: Script signing system in future

### Market Risks
- **Low Adoption**: Strong examples + marketing
- **Competitor**: Focus on better UX and documentation

---

## Post-Beta Features (V2)

Ideas for future development:
1. Multi-chain support (Polygon, Base, Arbitrum)
2. Script marketplace with ratings
3. Advanced scripting (scheduled execution, webhooks)
4. Mobile app (React Native + WalletConnect)
5. Team/shared wallets with multi-sig
6. Python scripting option
7. DeFi protocol integrations

---

## Current Status: Week 1 Complete ✅

**Completed**: Phase 0.1 - Project & Infrastructure Setup  
**Next**: Phase 0.2 - WASM-Lua Proof of Concept  
**ETA to Beta**: 23 weeks remaining  

🎉 **Excellent progress! Foundation is solid and ready for next phase.**
