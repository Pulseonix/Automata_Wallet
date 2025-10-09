# 🔐 Phase 1: Core Wallet Infrastructure - Implementation Plan

**Status**: 🚀 STARTING  
**Start Date**: October 9, 2025  
**Estimated Duration**: 5-6 weeks  
**Previous Phase**: Phase 0 - Foundation & Technical Validation ✅ COMPLETE

---

## 📋 Executive Summary

Phase 1 will build the secure core wallet infrastructure for Automata Wallet, implementing BIP-39/44 key management, WebCrypto encryption, and basic ETH transaction capabilities. This phase transforms the validated Lua sandbox foundation into a functional crypto wallet.

### Goals

1. **Secure Key Management**: BIP-39 mnemonic generation, BIP-44 derivation, encrypted storage
2. **Password Protection**: PBKDF2-based encryption with 100k iterations
3. **Blockchain Integration**: ethers.js v6 integration with RPC provider management
4. **Transaction Flow**: Send/receive ETH with gas estimation
5. **Wallet UI**: Basic wallet interface replacing demo UI

### Success Criteria

- ✅ Generate cryptographically secure BIP-39 seed phrases (12/24 words)
- ✅ Encrypt/decrypt wallet data with AES-GCM (256-bit)
- ✅ Derive addresses using BIP-44 standard path (m/44'/60'/0'/0/x)
- ✅ Send ETH transactions on testnet (Sepolia)
- ✅ Display transaction history and balances
- ✅ 100% test coverage for crypto operations
- ✅ Password validation with rate limiting
- ✅ Auto-lock after 30 minutes inactivity

---

## 🏗️ Architecture Overview

### Key Management Flow

```
User Creates Wallet
    ↓
Generate BIP-39 Mnemonic (128-256 bits)
    ↓ PBKDF2
Derive Root Seed (512 bits)
    ↓ HMAC-SHA512
HD Wallet (BIP-44: m/44'/60'/0'/0/0)
    ↓
Derive Private Key + Public Address
    ↓ User Password + PBKDF2 (100k iterations)
Encryption Key (AES-256)
    ↓ AES-GCM
Encrypted Mnemonic + Auth Tag + IV
    ↓
chrome.storage.local (encrypted at OS level)
```

### Component Structure

```
src/lib/
├── crypto/
│   ├── bip39.ts          # Mnemonic generation & validation
│   ├── encryption.ts      # AES-GCM + PBKDF2 wrapper
│   ├── derivation.ts      # BIP-44 key derivation
│   └── password.ts        # Password validation & hashing
├── wallet/
│   ├── core.ts           # Wallet creation, unlock, lock
│   ├── storage.ts        # Secure chrome.storage wrapper
│   ├── session.ts        # Session management (30min timeout)
│   └── accounts.ts       # Multi-account management
├── blockchain/
│   ├── provider.ts       # RPC provider (Infura/Alchemy)
│   ├── transactions.ts   # Transaction building & signing
│   ├── gas.ts            # Gas estimation
│   └── history.ts        # Transaction history fetching
└── types/
    ├── wallet.ts         # Wallet type definitions
    ├── crypto.ts         # Crypto type definitions
    └── blockchain.ts     # Blockchain type definitions
```

---

## 📦 Phase 1 Tasks Breakdown

### Week 1: Crypto Foundation (Oct 9-15)

#### Task 1.1: BIP-39 Implementation
**Files**: `src/lib/crypto/bip39.ts`, `src/lib/crypto/bip39.test.ts`

**Requirements**:
- Generate cryptographically secure entropy (128/256 bits)
- Compute BIP-39 checksum
- Convert to mnemonic (12/24 words)
- Validate mnemonic integrity
- Convert mnemonic to seed (PBKDF2-SHA512, 2048 iterations)

**Dependencies**: 
- `ethers` (includes BIP-39 implementation)
- WebCrypto API for secure random generation

**Test Coverage**:
- [ ] Generate valid 12-word mnemonic
- [ ] Generate valid 24-word mnemonic
- [ ] Validate correct mnemonics
- [ ] Reject invalid mnemonics
- [ ] Reject checksums
- [ ] Match test vectors from BIP-39 spec
- [ ] Handle edge cases (invalid word count, etc.)

#### Task 1.2: Encryption Layer
**Files**: `src/lib/crypto/encryption.ts`, `src/lib/crypto/encryption.test.ts`

**Requirements**:
- PBKDF2 key derivation (100k iterations, SHA-256)
- AES-GCM encryption (256-bit keys)
- Unique IV per encryption
- Authentication tag validation
- Secure random salt generation

**API Design**:
```typescript
interface EncryptionResult {
  ciphertext: string;  // Base64
  iv: string;          // Base64
  salt: string;        // Base64
  authTag: string;     // Base64 (included in ciphertext for AES-GCM)
}

async function encrypt(
  plaintext: string,
  password: string
): Promise<EncryptionResult>

async function decrypt(
  encrypted: EncryptionResult,
  password: string
): Promise<string>
```

**Test Coverage**:
- [ ] Encrypt/decrypt round-trip
- [ ] Incorrect password throws error
- [ ] Unique IV per encryption
- [ ] Unique salt per encryption
- [ ] Tampered ciphertext detected
- [ ] PBKDF2 iterations = 100k
- [ ] Performance: encryption <200ms

#### Task 1.3: BIP-44 Derivation
**Files**: `src/lib/crypto/derivation.ts`, `src/lib/crypto/derivation.test.ts`

**Requirements**:
- Derive HD wallet from seed
- Support Ethereum path: m/44'/60'/0'/0/x
- Generate multiple accounts
- Validate derivation paths

**API Design**:
```typescript
interface DerivedAccount {
  address: string;
  path: string;
  index: number;
}

function deriveAccount(
  hdNode: HDNodeWallet,
  index: number
): DerivedAccount

function deriveAccounts(
  hdNode: HDNodeWallet,
  count: number
): DerivedAccount[]
```

**Test Coverage**:
- [ ] Derive account at index 0
- [ ] Derive multiple accounts
- [ ] Match test vectors
- [ ] Validate addresses (checksum)
- [ ] Support custom derivation paths

#### Task 1.4: Password Validation
**Files**: `src/lib/crypto/password.ts`, `src/lib/crypto/password.test.ts`

**Requirements**:
- Minimum 12 characters
- Mixed case letters
- At least one number
- At least one special character
- Check against common password list
- Rate limiting (5 attempts, 5-minute lockout)

**Test Coverage**:
- [ ] Accept strong passwords
- [ ] Reject weak passwords
- [ ] Reject common passwords
- [ ] Rate limiting works
- [ ] Lockout timer enforced

---

### Week 2: Wallet Core (Oct 16-22)

#### Task 2.1: Wallet Creation
**Files**: `src/lib/wallet/core.ts`, `src/lib/wallet/core.test.ts`

**Requirements**:
- Create new wallet flow
- Import existing wallet
- Show mnemonic once (with warning)
- Encrypt and store mnemonic
- Derive first account
- Initialize wallet metadata

**API Design**:
```typescript
interface CreateWalletParams {
  password: string;
  mnemonicLength?: 12 | 24;
}

interface CreateWalletResult {
  address: string;
  mnemonic: string;  // Show once, user must backup
}

async function createWallet(
  params: CreateWalletParams
): Promise<CreateWalletResult>

async function importWallet(
  mnemonic: string,
  password: string
): Promise<{ address: string }>
```

**Test Coverage**:
- [ ] Create wallet with 12 words
- [ ] Create wallet with 24 words
- [ ] Import wallet from mnemonic
- [ ] Reject invalid mnemonic on import
- [ ] Encrypt mnemonic correctly
- [ ] Store metadata correctly

#### Task 2.2: Wallet Unlock/Lock
**Files**: `src/lib/wallet/core.ts`, `src/lib/wallet/session.ts`

**Requirements**:
- Unlock wallet with password
- Decrypt mnemonic
- Recreate HD wallet in memory
- Auto-lock after 30 minutes
- Manual lock function
- Clear sensitive data on lock

**API Design**:
```typescript
interface UnlockWalletResult {
  address: string;
  accountCount: number;
  network: string;
}

async function unlockWallet(
  password: string
): Promise<UnlockWalletResult>

function lockWallet(): void

function isWalletLocked(): boolean

function resetLockTimer(): void
```

**Test Coverage**:
- [ ] Unlock with correct password
- [ ] Reject incorrect password
- [ ] Auto-lock after 30 minutes
- [ ] Manual lock clears memory
- [ ] Timer resets on activity
- [ ] Rate limiting on unlock attempts

#### Task 2.3: Secure Storage
**Files**: `src/lib/wallet/storage.ts`, `src/lib/wallet/storage.test.ts`

**Requirements**:
- Wrapper around chrome.storage.local
- Store encrypted mnemonic
- Store wallet metadata
- Type-safe storage operations
- Migration support

**Storage Schema**:
```typescript
interface WalletStorage {
  version: string;
  encrypted: {
    mnemonic: string;  // Encrypted
    salt: string;
    iv: string;
  };
  public: {
    addresses: string[];
    accountCount: number;
    network: string;
    createdAt: number;
  };
  settings: {
    autoLockMinutes: number;
    defaultGasLimit: string;
  };
}
```

**Test Coverage**:
- [ ] Store and retrieve data
- [ ] Type validation
- [ ] Migration from old versions
- [ ] Clear data on reset
- [ ] Handle storage errors

---

### Week 3: Blockchain Integration (Oct 23-29)

#### Task 3.1: RPC Provider Setup
**Files**: `src/lib/blockchain/provider.ts`, `src/lib/blockchain/provider.test.ts`

**Requirements**:
- Configure Infura/Alchemy providers
- Support multiple networks (Mainnet, Sepolia)
- Fallback providers
- Rate limiting handling
- Connection health monitoring

**API Design**:
```typescript
interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
}

function getProvider(network: string): JsonRpcProvider

async function switchNetwork(network: string): Promise<void>

async function getBlockNumber(): Promise<number>

async function getBalance(address: string): Promise<bigint>
```

**Test Coverage**:
- [ ] Connect to Sepolia testnet
- [ ] Get current block number
- [ ] Get address balance
- [ ] Switch networks
- [ ] Handle provider errors
- [ ] Fallback to backup provider

#### Task 3.2: Transaction Building
**Files**: `src/lib/blockchain/transactions.ts`, `src/lib/blockchain/transactions.test.ts`

**Requirements**:
- Build ETH transfer transaction
- Calculate nonce
- Estimate gas
- Set gas price
- Sign transaction
- Broadcast transaction

**API Design**:
```typescript
interface TransactionParams {
  to: string;
  value: string;  // ETH amount in ether
  gasLimit?: string;
  gasPrice?: string;
}

interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
}

async function buildTransaction(
  params: TransactionParams
): Promise<Transaction>

async function signTransaction(
  tx: Transaction,
  accountIndex: number
): Promise<string>

async function sendTransaction(
  signedTx: string
): Promise<TransactionResult>
```

**Test Coverage**:
- [ ] Build valid transaction
- [ ] Calculate correct nonce
- [ ] Sign transaction correctly
- [ ] Send transaction to testnet
- [ ] Handle insufficient funds
- [ ] Handle gas estimation failures

#### Task 3.3: Gas Estimation
**Files**: `src/lib/blockchain/gas.ts`, `src/lib/blockchain/gas.test.ts`

**Requirements**:
- Estimate gas for ETH transfer
- Get current gas price
- Calculate transaction cost
- Suggest gas prices (slow/normal/fast)

**API Design**:
```typescript
interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: bigint;  // gasLimit * gasPrice
  totalCostEth: string;
}

interface GasSuggestions {
  slow: bigint;
  normal: bigint;
  fast: bigint;
}

async function estimateGas(
  tx: TransactionParams
): Promise<GasEstimate>

async function getGasSuggestions(): Promise<GasSuggestions>
```

**Test Coverage**:
- [ ] Estimate gas for simple transfer
- [ ] Get current gas price
- [ ] Calculate total cost correctly
- [ ] Provide gas suggestions
- [ ] Handle estimation failures

---

### Week 4-5: Wallet UI & Transaction History (Oct 30 - Nov 12)

#### Task 4.1: Wallet Creation UI
**Files**: 
- `src/components/wallet/CreateWallet.tsx`
- `src/components/wallet/ImportWallet.tsx`
- `src/components/wallet/BackupWarning.tsx`

**Requirements**:
- Create new wallet flow
- Import wallet flow
- Show mnemonic with backup warning
- Password creation with strength indicator
- Confirmation step

#### Task 4.2: Main Wallet UI
**Files**: 
- `src/popup/WalletView.tsx`
- `src/components/wallet/BalanceDisplay.tsx`
- `src/components/wallet/AccountSelector.tsx`
- `src/components/wallet/NetworkSelector.tsx`

**Requirements**:
- Display ETH balance
- Show current address
- Copy address button
- Network selector
- Account selector
- Lock/unlock status

#### Task 4.3: Send Transaction UI
**Files**: 
- `src/components/wallet/SendTransaction.tsx`
- `src/components/wallet/TransactionPreview.tsx`
- `src/components/wallet/GasSelector.tsx`

**Requirements**:
- Address input with validation
- Amount input with max button
- Gas limit/price selector
- Transaction preview
- Confirmation dialog
- Success/error feedback

#### Task 4.4: Transaction History
**Files**: 
- `src/lib/blockchain/history.ts`
- `src/components/wallet/TransactionHistory.tsx`
- `src/components/wallet/TransactionItem.tsx`

**Requirements**:
- Fetch transaction history (Etherscan API)
- Display sent/received transactions
- Show transaction status
- Link to block explorer
- Pagination support

---

### Week 6: Testing & Polish (Nov 13-19)

#### Task 5.1: Integration Tests
**Files**: `src/__tests__/wallet-integration.test.ts`

**Test Scenarios**:
- [ ] Full wallet creation flow
- [ ] Import wallet and send transaction
- [ ] Lock/unlock cycle
- [ ] Auto-lock timeout
- [ ] Network switching
- [ ] Multi-account management

#### Task 5.2: Security Testing
**Files**: `src/__tests__/security.test.ts`

**Test Scenarios**:
- [ ] Password brute force protection
- [ ] Encrypted storage validation
- [ ] Memory cleanup after lock
- [ ] Invalid transaction rejection
- [ ] XSS/injection prevention

#### Task 5.3: Performance Testing
**Files**: `src/__tests__/performance.test.ts`

**Benchmarks**:
- [ ] Wallet creation <2 seconds
- [ ] Wallet unlock <1 second
- [ ] Transaction signing <500ms
- [ ] Gas estimation <2 seconds
- [ ] UI render <100ms

#### Task 5.4: Documentation
**Files**: 
- `docs/guides/wallet-usage.md`
- `docs/guides/security-best-practices.md`
- `docs/api/wallet-api.md`

---

## 🔐 Security Checklist

### Before Phase 1 Completion

- [ ] All crypto operations use WebCrypto API
- [ ] Private keys never exposed to Lua scripts
- [ ] Passwords never logged or stored plaintext
- [ ] Mnemonic shown only once during creation
- [ ] Encrypted data validated before use
- [ ] Auto-lock implemented and tested
- [ ] Rate limiting on password attempts
- [ ] Clear sensitive data from memory on lock
- [ ] Test vectors validated for BIP-39/44
- [ ] Password strength requirements enforced
- [ ] Storage encrypted with OS-level encryption
- [ ] No eval() or Function() constructors
- [ ] CSP headers properly configured
- [ ] HTTPS only for RPC connections
- [ ] Error messages don't leak sensitive info

---

## 📊 Dependencies & Bundle Size

### New Dependencies

```json
{
  "ethers": "^6.13.4"  // Already included
}
```

**No additional dependencies needed!** All crypto functionality available through:
- `ethers` (BIP-39, BIP-44, HD wallets, signing)
- WebCrypto API (AES-GCM, PBKDF2, random generation)
- Chrome Extensions API (storage)

### Bundle Size Target

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Extension Base | 155 KB | <200 KB | 🟢 |
| Lua Worker | 111 KB | <150 KB | 🟢 |
| Wallet Core | - | <100 KB | 🎯 New |
| WASM | 500 KB | <500 KB | 🟢 |
| **Total** | **656 KB** | **<1 MB** | **🟢 34% margin** |

**Post-Phase 1 Target**: <800 KB (200 KB margin remaining)

---

## 🧪 Testing Strategy

### Unit Tests (Target: 100% Coverage)

**Crypto Module**:
- BIP-39 generation/validation
- Encryption/decryption
- BIP-44 derivation
- Password validation
- Test vector validation

**Wallet Module**:
- Wallet creation/import
- Lock/unlock mechanism
- Storage operations
- Session management

**Blockchain Module**:
- Provider connections
- Transaction building
- Gas estimation
- History fetching

### Integration Tests

- Complete wallet lifecycle
- Transaction flow (testnet)
- Multi-network support
- Error recovery

### Security Tests

- Password brute force
- Memory leaks
- Storage encryption
- XSS prevention

### Performance Tests

- Wallet creation time
- Unlock time
- Transaction signing time
- UI responsiveness

---

## 📈 Success Metrics

### Functional Requirements

- [ ] Users can create new wallet
- [ ] Users can import existing wallet
- [ ] Users can send ETH on testnet
- [ ] Users can view transaction history
- [ ] Users can manage multiple accounts
- [ ] Users can switch networks

### Non-Functional Requirements

- [ ] Wallet creation <2 seconds
- [ ] Wallet unlock <1 second
- [ ] 100% test coverage for crypto code
- [ ] Zero security vulnerabilities
- [ ] Bundle size <800 KB
- [ ] Memory usage <50 MB
- [ ] Auto-lock after 30 minutes

### User Experience

- [ ] Clear error messages
- [ ] Loading indicators
- [ ] Transaction confirmation
- [ ] Backup warnings
- [ ] Password strength feedback
- [ ] Intuitive UI flow

---

## 🚧 Risk Management

### Technical Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| WebCrypto performance | Medium | Benchmark early, optimize | 🟡 Monitor |
| RPC rate limits | Medium | Implement fallback providers | 🟡 Monitor |
| Gas estimation accuracy | Low | Use ethers.js built-in | 🟢 Low risk |
| Browser compatibility | Low | Target Chrome 120+ only | 🟢 Low risk |

### Security Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Key exposure | Critical | Multi-layer encryption | 🟢 Addressed |
| Password weakness | High | Strong validation + rate limit | 🟢 Addressed |
| Memory dumps | Medium | Clear sensitive data | 🟢 Addressed |
| Phishing | Medium | Warning messages | 🟡 Monitor |

### Schedule Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Crypto complexity | Medium | Follow ADR-003 closely | 🟢 Low risk |
| UI scope creep | Medium | MVP first, iterate later | 🟢 Low risk |
| Testing time | Low | Write tests alongside code | 🟢 Low risk |

---

## 📅 Milestones & Checkpoints

### Milestone 1: Crypto Foundation (Week 1)
**Date**: October 15, 2025

**Deliverables**:
- ✅ BIP-39 implementation with tests
- ✅ AES-GCM encryption with tests
- ✅ BIP-44 derivation with tests
- ✅ Password validation with tests

**Go/No-Go Criteria**:
- All crypto tests passing
- Test vectors validated
- Performance <200ms for encryption

---

### Milestone 2: Wallet Core (Week 2)
**Date**: October 22, 2025

**Deliverables**:
- ✅ Wallet creation flow
- ✅ Wallet import flow
- ✅ Lock/unlock mechanism
- ✅ Secure storage layer

**Go/No-Go Criteria**:
- Create → Lock → Unlock cycle works
- Encrypted storage verified
- Session timeout enforced

---

### Milestone 3: Blockchain Integration (Week 3)
**Date**: October 29, 2025

**Deliverables**:
- ✅ RPC provider setup
- ✅ Transaction building
- ✅ Transaction signing
- ✅ Gas estimation

**Go/No-Go Criteria**:
- Successfully send testnet transaction
- Gas estimation accurate
- Balance fetching works

---

### Milestone 4: UI Complete (Week 4-5)
**Date**: November 12, 2025

**Deliverables**:
- ✅ Wallet creation UI
- ✅ Main wallet view
- ✅ Send transaction UI
- ✅ Transaction history

**Go/No-Go Criteria**:
- Complete user flow functional
- UI responsive and intuitive
- Error handling graceful

---

### Milestone 5: Testing & Release (Week 6)
**Date**: November 19, 2025

**Deliverables**:
- ✅ 100% test coverage (crypto)
- ✅ Integration tests passing
- ✅ Security tests passing
- ✅ Documentation complete

**Go/No-Go Criteria**:
- All tests passing
- No critical security issues
- Performance targets met
- Ready for Phase 2

---

## 🎯 Definition of Done

Phase 1 is complete when:

### Functional
- [ ] Users can create/import wallet
- [ ] Users can send ETH on testnet
- [ ] Users can view balances
- [ ] Users can view transaction history
- [ ] Auto-lock works correctly

### Technical
- [ ] 100% test coverage for crypto code
- [ ] All integration tests passing
- [ ] Security tests passing
- [ ] Performance benchmarks met
- [ ] Bundle size <800 KB

### Documentation
- [ ] API documentation complete
- [ ] User guide complete
- [ ] Security guide complete
- [ ] ADRs updated

### Quality
- [ ] Code review completed
- [ ] No critical bugs
- [ ] No security vulnerabilities
- [ ] TypeScript strict mode passing
- [ ] Linting passing

---

## 📚 References

### Specifications
- **BIP-39**: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- **BIP-44**: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- **WebCrypto**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **ethers.js v6**: https://docs.ethers.org/v6/

### Internal Docs
- **ADR-003**: Key Management Strategy (`docs/architecture/ADR-003-key-management.md`)
- **Phase 0.2 Complete**: `PHASE_0.2_COMPLETE.md`
- **Security Model**: `SECURITY.md`

### Test Vectors
- **BIP-39**: https://github.com/trezor/python-mnemonic/blob/master/vectors.json
- **BIP-44**: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#test-vectors

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Read ADR-003** (`docs/architecture/ADR-003-key-management.md`)
2. **Set up development environment** (`pnpm install`)
3. **Start with Task 1.1** (BIP-39 implementation)
4. **Write tests alongside code**
5. **Benchmark crypto operations**

### Development Workflow

```bash
# Start development build
pnpm run dev:build

# Run tests in watch mode
pnpm test --watch

# Type check
pnpm run type-check

# Lint
pnpm run lint
```

### First Implementation

Start with `src/lib/crypto/bip39.ts`:

```typescript
import { Mnemonic, randomBytes } from 'ethers';

export async function generateMnemonic(
  strength: 128 | 256 = 128
): Promise<string> {
  const entropy = randomBytes(strength / 8);
  const mnemonic = Mnemonic.fromEntropy(entropy);
  return mnemonic.phrase;
}
```

---

**Status**: 🟢 Ready to begin Phase 1  
**Confidence**: 95% (Very High)  
**Risk Level**: 🟢 Low  
**Team Velocity**: Excellent (Phase 0 completed 1.5 weeks early)

**Let's build a secure crypto wallet! 🔐**
