# Automata Wallet - Development Roadmap

## Timeline Overview

**Total Duration**: 24 weeks to beta launch  
**Current Status**: Phase 0 Complete ✅ | Phase 1 Starting 🚀  
**Current Week**: Week 2 of 24 (October 9, 2025)  
**Schedule Status**: 1.5 weeks ahead of schedule  
**Next Milestone**: Phase 1.1 - Crypto Foundation (Week 2)

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

### Week 2-3: ✅ COMPLETE - WASM-Lua Proof of Concept
**Status**: ✅ Completed Week 1.5 (ahead of schedule)

Tasks:
- [x] Research Lua WASM compilers (Fengari, lua.vm.js, Emscripten)
- [x] Selected Wasmoon as optimal solution
- [x] Build comprehensive PoC demonstrating:
  - [x] Running Lua in WASM sandbox (Web Worker isolation)
  - [x] Bidirectional data passing (JS ↔ Lua)
  - [x] Memory management and garbage collection
  - [x] Error handling and stack traces
  - [x] Performance benchmarks (6,000 operations)
- [x] Document PoC findings and create decision document
- [x] Make Go/No-Go decision for Lua approach

**Success Criteria**: ✅ ALL EXCEEDED
- Bundle size <1MB ✅ (656KB - 34% under target)
- 1000 contract reads in <5s ✅ (6000 ops in 0.32s - 94x better!)
- Clear error messages ✅ (Stack traces with line numbers)
- Reliable JS-Lua interop ✅ (5 APIs with TypeScript types)

**Deliverable**: ✅ Technical validation report - **GO decision with 95% confidence**

**Additional Achievements**:
- ✅ Lua sandbox with Web Worker (13 tests)
- ✅ JS-Lua communication bridge (18 tests)
- ✅ 5 mock APIs (Wallet, Contract, Network, HTTP, Storage)
- ✅ Interactive demo UI with Monaco editor
- ✅ Comprehensive documentation (5 guides, 3,500+ lines)

---

## Phase 1: Secure Core Wallet (5-6 weeks)

**Status**: 🚀 STARTING (October 9, 2025)  
**Target Completion**: November 19, 2025  
**Detailed Plan**: See `PHASE_1_START.md`

### Week 2 (Oct 9-15): 🚀 CURRENT - Crypto Foundation
**Focus**: BIP-39, WebCrypto, BIP-44 derivation

Tasks:
- [ ] Implement BIP-39 seed phrase generation (12/24 word)
  - Create `src/lib/crypto/bip39.ts`
  - Secure entropy generation with WebCrypto
  - Mnemonic validation and checksum
  - Tests with BIP-39 test vectors
- [ ] Build encryption layer using WebCrypto API (AES-GCM)
  - Create `src/lib/crypto/encryption.ts`
  - PBKDF2 key derivation (100k iterations)
  - AES-256-GCM encryption/decryption
  - Unique IV per encryption
  - Tests with known vectors
- [ ] Build HD wallet derivation (BIP-44 compatible)
  - Create `src/lib/crypto/derivation.ts`
  - Ethereum path: m/44'/60'/0'/0/x
  - Multi-account support
  - Tests with BIP-44 vectors
- [ ] Implement secure password requirements
  - Create `src/lib/crypto/password.ts`
  - 12+ chars, mixed case, numbers, special chars
  - Common password detection
  - Rate limiting (5 attempts, 5-min lockout)
  - Comprehensive tests

**Milestone 1 Checkpoint** (Oct 15):
- ✅ All crypto tests passing (target: 100% coverage)
- ✅ BIP-39/44 test vectors validated
- ✅ Encryption performance <200ms
- ✅ Ready for wallet core implementation

### Week 3 (Oct 16-22): Wallet Core
**Focus**: Wallet creation, unlock/lock, secure storage

Tasks:
- [ ] Implement wallet creation flow
  - Create `src/lib/wallet/core.ts`
  - New wallet generation
  - Import existing wallet
  - Show mnemonic with backup warning
  - Encrypt and store securely
- [ ] Build unlock/lock mechanism
  - Update `src/lib/wallet/core.ts`
  - Password-based unlock
  - In-memory HD wallet
  - Auto-lock after 30 minutes
  - Manual lock with memory cleanup
  - Session management
- [ ] Create secure storage layer
  - Create `src/lib/wallet/storage.ts`
  - chrome.storage.local wrapper
  - Type-safe operations
  - Encrypted mnemonic storage
  - Wallet metadata storage

**Milestone 2 Checkpoint** (Oct 22):
- ✅ Create → Lock → Unlock cycle works
- ✅ Encrypted storage validated
- ✅ Session timeout enforced
- ✅ All wallet core tests passing

### Week 4 (Oct 23-29): Blockchain Integration
**Focus**: RPC providers, transactions, gas estimation

Tasks:
- [ ] Integrate ethers.js v6
  - Create `src/lib/blockchain/provider.ts`
  - Configure Infura/Alchemy providers
  - Multi-network support (Mainnet, Sepolia)
  - Fallback provider handling
  - Connection health monitoring
- [ ] Build transaction construction
  - Create `src/lib/blockchain/transactions.ts`
  - ETH transfer transaction builder
  - Nonce calculation
  - Transaction signing
  - Broadcast and confirmation tracking
- [ ] Implement gas estimation
  - Create `src/lib/blockchain/gas.ts`
  - Gas limit estimation
  - Current gas price fetching
  - Transaction cost calculation
  - Gas price suggestions (slow/normal/fast)

**Milestone 3 Checkpoint** (Oct 29):
- ✅ Successfully send testnet transaction
- ✅ Gas estimation accurate
- ✅ Balance fetching works
- ✅ All blockchain tests passing

### Week 5-6 (Oct 30 - Nov 12): Wallet UI
**Focus**: User interface for wallet operations

Tasks:
- [ ] Build wallet creation UI
  - Create `src/components/wallet/CreateWallet.tsx`
  - Create `src/components/wallet/ImportWallet.tsx`
  - Create `src/components/wallet/BackupWarning.tsx`
  - Password creation with strength indicator
  - Mnemonic display with confirmation
- [ ] Design main wallet view
  - Create `src/popup/WalletView.tsx`
  - Create `src/components/wallet/BalanceDisplay.tsx`
  - Create `src/components/wallet/AccountSelector.tsx`
  - Create `src/components/wallet/NetworkSelector.tsx`
  - Display ETH balance
  - Show current address with copy
  - Network and account selectors
- [ ] Build send transaction UI
  - Create `src/components/wallet/SendTransaction.tsx`
  - Create `src/components/wallet/TransactionPreview.tsx`
  - Create `src/components/wallet/GasSelector.tsx`
  - Address validation
  - Amount input with max button
  - Gas configuration
  - Transaction preview and confirmation
- [ ] Add transaction history
  - Create `src/lib/blockchain/history.ts`
  - Create `src/components/wallet/TransactionHistory.tsx`
  - Create `src/components/wallet/TransactionItem.tsx`
  - Fetch from Etherscan API
  - Display sent/received transactions
  - Link to block explorer

**Milestone 4 Checkpoint** (Nov 12):
- ✅ Complete user flow functional
- ✅ UI responsive and intuitive
- ✅ Error handling graceful
- ✅ All components tested

### Week 7 (Nov 13-19): Testing & Polish
**Focus**: Integration tests, security, performance, documentation

Tasks:
- [ ] Write integration tests
  - Create `src/__tests__/wallet-integration.test.ts`
  - Full wallet creation flow
  - Lock/unlock cycles
  - Transaction sending
  - Network switching
  - Multi-account management
- [ ] Security testing
  - Create `src/__tests__/security.test.ts`
  - Password brute force protection
  - Encrypted storage validation
  - Memory cleanup verification
  - XSS/injection prevention
- [ ] Performance testing
  - Create `src/__tests__/performance.test.ts`
  - Wallet creation <2 seconds
  - Wallet unlock <1 second
  - Transaction signing <500ms
  - Gas estimation <2 seconds
- [ ] Documentation
  - Create `docs/guides/wallet-usage.md`
  - Create `docs/guides/security-best-practices.md`
  - Create `docs/api/wallet-api.md`
  - Update ADRs if needed

**Milestone 5 / Phase 1 Complete** (Nov 19):
- ✅ 100% test coverage (crypto modules)
- ✅ All integration tests passing
- ✅ Security tests passing
- ✅ Performance targets met
- ✅ Documentation complete
- ✅ Ready for Phase 2

**Deliverable**: Functional ETH-only wallet that can send/receive with secure key management

---

## Phase 2: Enhanced Wallet Features (3 weeks)

**Status**: ⏳ NOT STARTED  
**Planned Start**: November 20, 2025  
**Target Completion**: December 10, 2025

### Week 8-9 (Nov 20 - Dec 3): ERC-20 Token Support
Tasks:
- [ ] Implement token contract detection and balance fetching
- [ ] Add support for 10 major tokens (USDC, USDT, DAI, etc.)
- [ ] Build token selection UI for sending
- [ ] Implement token approval flow
- [ ] Add token import by contract address

### Week 10 (Dec 4-10): Transaction History & Network Management
Tasks:
- [ ] Integrate Etherscan API for transaction history
- [ ] Build transaction list UI with filtering
- [ ] Add network switcher (Mainnet, Sepolia testnet)
- [ ] Implement custom RPC endpoint configuration
- [ ] Add activity feed with status updates

**Deliverable**: Full-featured wallet comparable to basic MetaMask

---

## Phase 3: Lua Scripting Foundation (5 weeks)

**Status**: ⏳ NOT STARTED  
**Planned Start**: December 11, 2025  
**Target Completion**: January 14, 2026

### Week 11-12 (Dec 11-24): Sandbox Integration
Tasks:
- [ ] Integrate Lua WASM module into extension bundle
- [ ] Build isolated execution context (Web Worker + WASM)
- [ ] Implement message-passing bridge
- [ ] Add script timeout mechanism (max 30s)
- [ ] Create memory limits and resource quotas
- [ ] Build comprehensive error handling system

### Week 13-14 (Dec 25 - Jan 7): Read-Only API Implementation
Tasks:
- [ ] Design and document Lua API specification
- [ ] Implement wallet.* API (getAddress, getBalance)
- [ ] Implement contract.read() for view functions
- [ ] Implement network.* API
- [ ] Add http.get() for external data
- [ ] Write API documentation with examples

### Week 15 (Jan 8-14): Script Editor UI
Tasks:
- [ ] Integrate Monaco Editor
- [ ] Add Lua syntax highlighting and autocomplete
- [ ] Build script management UI (save/load/delete)
- [ ] Create console panel for script output
- [ ] Add script templates and examples

**Deliverable**: Users can write and run read-only Lua scripts

---

## Phase 4: State-Changing Operations (3 weeks)

**Status**: ⏳ NOT STARTED  
**Planned Start**: January 15, 2026  
**Target Completion**: February 4, 2026

### Week 16 (Jan 15-21): Transaction API Design
Tasks:
- [ ] Design state-changing API specification
- [ ] Implement transaction builder pattern in Lua
- [ ] Create wallet.sendETH() function
- [ ] Create wallet.sendToken() function
- [ ] Create contract.write() for contract interactions

### Week 17-18 (Jan 22 - Feb 4): Approval Flow Integration
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

**Status**: ⏳ NOT STARTED  
**Planned Start**: February 5, 2026  
**Target Completion**: February 25, 2026

### Week 19 (Feb 5-11): Internal Security Review
Tasks:
- [ ] Conduct threat modeling workshop
- [ ] Perform code review focused on security
- [ ] Test sandbox escape scenarios
- [ ] Validate encryption implementation
- [ ] Check for XSS/injection vulnerabilities
- [ ] Review permission model and CSP headers

### Week 20-21 (Feb 12-25): External Security Audit
Tasks:
- [ ] Hire reputable security firm
- [ ] Prepare audit materials and documentation
- [ ] Address all high/critical findings
- [ ] Re-test fixed vulnerabilities
- [ ] Obtain audit report for publication

**Deliverable**: Security audit report with all critical issues resolved

---

## Phase 6: Beta Preparation (2 weeks)

**Status**: ⏳ NOT STARTED  
**Planned Start**: February 26, 2026  
**Target Completion**: March 11, 2026

### Week 22 (Feb 26 - Mar 4): Polish & Documentation
Tasks:
- [ ] UI/UX refinement based on internal testing
- [ ] Write comprehensive user documentation
- [ ] Create API reference documentation
- [ ] Build 10 example scripts (portfolio tracker, alerts, etc.)
- [ ] Record demo videos and tutorials

### Week 23 (Mar 5-11): Infrastructure & Analytics
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

**Status**: ⏳ NOT STARTED  
**Planned Start**: March 12, 2026  
**Beta Launch Target**: March 12, 2026

### Week 24-25 (Mar 12-25): Limited Beta (50 users)
- Deploy as unlisted Chrome extension
- High-touch onboarding in Discord
- Daily check-ins on critical issues
- Hot-fix deployment capability

### Week 26-27 (Mar 26 - Apr 8): Expanded Beta (200 users)
- Invite second wave
- Analyze usage patterns
- Identify most-requested features
- Deploy 1-2 minor updates

### Week 28-29 (Apr 9-22): Full Beta (500 users)
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

**Current Date**: October 9, 2025  
**Current Week**: Week 2 of 29 (7% complete)  
**Current Phase**: Phase 1 - Core Wallet Infrastructure 🚀  
**Schedule Status**: ✅ 1.5 weeks ahead

```
Phase 0: Foundation              [████████████████████] 100% ✅ COMPLETE (Week 0-1.5)
Phase 1: Core Wallet             [██░░░░░░░░░░░░░░░░░]  10% 🚀 STARTING (Week 2-7)
Phase 2: Enhanced Features       [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 8-10)
Phase 3: Lua Scripting           [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 11-15)
Phase 4: State Changes           [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 16-18)
Phase 5: Security Hardening      [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 19-21)
Phase 6: Beta Prep               [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 22-23)
Phase 7: Beta Launch             [░░░░░░░░░░░░░░░░░░]   0% ⏳ (Week 24-29)

Overall Progress: ███░░░░░░░░░░░░░░░░ 14% (Week 2 of 29)
ETA to Beta:      22 weeks remaining (March 12, 2026)
```

### Phase Completion Summary

| Phase | Status | Start Date | End Date | Duration | Progress |
|-------|--------|-----------|----------|----------|----------|
| Phase 0 | ✅ COMPLETE | Sept 25 | Oct 6 | 1.5 weeks | 100% |
| Phase 1 | 🚀 STARTING | Oct 9 | Nov 19 | 6 weeks | 10% |
| Phase 2 | ⏳ PENDING | Nov 20 | Dec 10 | 3 weeks | 0% |
| Phase 3 | ⏳ PENDING | Dec 11 | Jan 14 | 5 weeks | 0% |
| Phase 4 | ⏳ PENDING | Jan 15 | Feb 4 | 3 weeks | 0% |
| Phase 5 | ⏳ PENDING | Feb 5 | Feb 25 | 3 weeks | 0% |
| Phase 6 | ⏳ PENDING | Feb 26 | Mar 11 | 2 weeks | 0% |
| Phase 7 | ⏳ PENDING | Mar 12 | Apr 22+ | 6+ weeks | 0% |

### Current Week Focus (Week 2: Oct 9-15)

**Phase**: 1.1 - Crypto Foundation  
**Priority**: Critical path - all future work depends on this

**Tasks This Week**:
1. 🔐 Implement BIP-39 seed generation (`src/lib/crypto/bip39.ts`)
2. 🔐 Build WebCrypto encryption layer (`src/lib/crypto/encryption.ts`)
3. 🔐 Create BIP-44 derivation (`src/lib/crypto/derivation.ts`)
4. 🔐 Add password validation (`src/lib/crypto/password.ts`)
5. ✅ Write comprehensive tests (target: 100% coverage)

**Checkpoint**: Friday, October 15, 2025
- All crypto tests passing
- BIP-39/44 test vectors validated
- Encryption performance <200ms
- Ready for Milestone 1 sign-off

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

## Current Status: Week 2 - Phase 1 Starting 🚀

**Completed**: Phase 0 - Foundation & Technical Validation ✅  
**Current**: Phase 1.1 - Crypto Foundation (Oct 9-15, 2025) 🚀  
**Next Milestone**: Milestone 1 - Crypto Complete (Oct 15)  
**ETA to Beta**: 22 weeks remaining (March 12, 2026)  
**Schedule Status**: ✅ 1.5 weeks ahead

### Phase 0 Final Results

- ✅ **Performance**: 50-100x better than targets (0.053ms avg vs 5-10ms target)
- ✅ **Bundle Size**: 656KB (34% under 1MB limit)
- ✅ **Tests**: 38 tests + 6,000 benchmark operations
- ✅ **Documentation**: 3,500+ lines across 5 comprehensive guides
- ✅ **Security**: Multi-layer defense implemented and tested
- ✅ **Timeline**: 1.5 weeks vs 3 weeks planned

**Full Report**: See `PHASE_0.2_COMPLETE.md`

### Phase 1 Resources

- **Detailed Plan**: `PHASE_1_START.md` - Complete implementation guide
- **Architecture**: `docs/architecture/ADR-003-key-management.md` - Crypto specs
- **Schedule**: 6 weeks with 5 major milestones
- **Target**: Functional ETH wallet with secure key management

🎉 **Outstanding progress! Phase 0 complete 1.5 weeks ahead of schedule.**  
🚀 **GO decision confirmed - proceeding to Phase 1 with 95% confidence!**
