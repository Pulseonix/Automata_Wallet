# 🚀 Phase 1: Core Wallet Infrastructure - Preparation Document

**Start Date**: Week of October 7, 2025  
**Duration**: 5 weeks (Weeks 4-8)  
**Status**: ✅ Ready to Begin  
**Prerequisites**: ✅ Phase 0 Complete

---

## 🎯 Phase 1 Overview

**Goal**: Build a secure, production-ready Ethereum wallet core with key management, encryption, and basic transaction functionality.

**Deliverable**: Functional ETH-only wallet that can:
- Generate/import seed phrases (BIP-39)
- Derive HD wallet keys (BIP-44)
- Encrypt/decrypt private keys (WebCrypto AES-GCM)
- Send and receive ETH
- Display balances with USD conversion
- Sign transactions securely

---

## 📋 Task Breakdown

### Week 4-5: Key Management & Security

#### Task 1.1: BIP-39 Seed Phrase Generation (8 hours)

**Objective**: Implement secure seed phrase generation and validation

**Requirements**:
- Generate 12-word and 24-word seed phrases
- Validate existing seed phrases
- Support multiple languages (English initially)
- Proper entropy source (WebCrypto)
- No seed phrase logging or storage in plaintext

**Implementation**:
```typescript
// src/lib/crypto/bip39.ts
import { randomBytes } from 'crypto';
import { wordlists } from 'bip39-wordlists';

export class BIP39Manager {
  generateMnemonic(strength: 128 | 256 = 128): string;
  validateMnemonic(mnemonic: string): boolean;
  mnemonicToSeed(mnemonic: string, password?: string): Promise<Uint8Array>;
}
```

**Tests**:
- ✅ Generate 12-word phrase
- ✅ Generate 24-word phrase
- ✅ Validate correct phrase
- ✅ Reject invalid phrase
- ✅ Reject tampered phrase
- ✅ Entropy randomness
- ✅ Password-protected seed

**Dependencies**: `@ethersproject/hdnode`, `@noble/hashes`

**Acceptance Criteria**:
- 100% test coverage for crypto operations
- No plaintext seed phrases in logs
- Proper error messages
- BIP-39 compliant

---

#### Task 1.2: HD Wallet Derivation (BIP-44) (6 hours)

**Objective**: Implement hierarchical deterministic wallet key derivation

**Requirements**:
- BIP-44 standard compliance: `m/44'/60'/0'/0/i`
- Support multiple accounts (index-based)
- Derive public keys without exposing private keys
- Path validation

**Implementation**:
```typescript
// src/lib/crypto/hd-wallet.ts
import { HDNode } from '@ethersproject/hdnode';

export class HDWallet {
  constructor(seed: Uint8Array);
  
  deriveAccount(index: number): WalletAccount;
  deriveAddress(accountIndex: number, addressIndex: number): string;
  getPrivateKey(accountIndex: number, addressIndex: number): string;
  getPublicKey(accountIndex: number, addressIndex: number): string;
}

export interface WalletAccount {
  index: number;
  address: string;
  publicKey: string;
  path: string;
}
```

**Tests**:
- ✅ Derive account 0
- ✅ Derive multiple accounts
- ✅ Consistent address generation
- ✅ Correct BIP-44 paths
- ✅ Public key derivation
- ✅ Path validation

**Dependencies**: `@ethersproject/hdnode`, `ethers`

**Acceptance Criteria**:
- BIP-44 compliant paths
- Deterministic key derivation
- Match standard wallet addresses
- No private key leaks

---

#### Task 1.3: Encryption Layer (WebCrypto AES-GCM) (10 hours)

**Objective**: Implement secure encryption for storing private keys and seed phrases

**Requirements**:
- AES-256-GCM encryption
- PBKDF2 key derivation from password
- Salt generation and storage
- IV (initialization vector) per encryption
- Authentication tag validation
- Secure key wiping after use

**Implementation**:
```typescript
// src/lib/crypto/encryption.ts
export class EncryptionManager {
  async encrypt(
    data: string | Uint8Array,
    password: string
  ): Promise<EncryptedData>;
  
  async decrypt(
    encryptedData: EncryptedData,
    password: string
  ): Promise<string | Uint8Array>;
  
  async deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey>;
}

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
  tag: string; // Base64 authentication tag
  algorithm: 'aes-256-gcm';
  iterations: number;
}
```

**Tests**:
- ✅ Encrypt/decrypt string data
- ✅ Encrypt/decrypt binary data
- ✅ Wrong password fails
- ✅ Tampered ciphertext fails
- ✅ Tampered IV fails
- ✅ Tampered tag fails
- ✅ Tampered salt fails
- ✅ Key derivation consistency
- ✅ Different salts produce different keys
- ✅ Performance (encrypt in <100ms)

**Dependencies**: WebCrypto API (native)

**Acceptance Criteria**:
- FIPS 140-2 compliant (AES-GCM)
- 100,000+ PBKDF2 iterations
- Authentication tags verified
- No key material in memory after use
- Constant-time comparisons

---

#### Task 1.4: Password Management & Rate Limiting (4 hours)

**Objective**: Implement secure password requirements and rate limiting

**Requirements**:
- Password strength validation (min 8 chars, complexity)
- Password confirmation (double entry)
- Decryption rate limiting (prevent brute force)
- Failed attempt tracking
- Progressive delays (exponential backoff)

**Implementation**:
```typescript
// src/lib/crypto/password-manager.ts
export class PasswordManager {
  validatePassword(password: string): PasswordValidation;
  checkPasswordStrength(password: string): PasswordStrength;
  recordFailedAttempt(walletId: string): void;
  canAttemptDecryption(walletId: string): {
    allowed: boolean;
    waitTime?: number;
  };
  resetAttempts(walletId: string): void;
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export enum PasswordStrength {
  WEAK = 0,
  MEDIUM = 1,
  STRONG = 2,
  VERY_STRONG = 3,
}
```

**Rate Limiting Strategy**:
```
Attempt 1-3:   No delay
Attempt 4-6:   5 second delay
Attempt 7-10:  15 second delay
Attempt 11-15: 30 second delay
Attempt 16+:   60 second delay
```

**Tests**:
- ✅ Accept strong password
- ✅ Reject weak password (too short)
- ✅ Reject weak password (no complexity)
- ✅ Rate limiting works
- ✅ Exponential backoff
- ✅ Reset after success
- ✅ Persistent across sessions

**Acceptance Criteria**:
- NIST password guidelines
- Exponential backoff prevents brute force
- State persists to storage
- Clear user feedback

---

#### Task 1.5: Wallet Storage & Persistence (6 hours)

**Objective**: Implement secure storage for encrypted wallet data

**Requirements**:
- Chrome storage API integration
- Encrypted wallet data
- Multiple wallet support
- Active wallet tracking
- Backup/export functionality

**Implementation**:
```typescript
// src/lib/wallet/wallet-storage.ts
export class WalletStorage {
  async saveWallet(wallet: EncryptedWallet): Promise<void>;
  async loadWallet(walletId: string): Promise<EncryptedWallet | null>;
  async listWallets(): Promise<WalletMetadata[]>;
  async deleteWallet(walletId: string): Promise<void>;
  async setActiveWallet(walletId: string): Promise<void>;
  async getActiveWallet(): Promise<string | null>;
}

export interface EncryptedWallet {
  id: string;
  name: string;
  encryptedSeed: EncryptedData;
  accounts: WalletAccount[];
  createdAt: number;
  updatedAt: number;
}

export interface WalletMetadata {
  id: string;
  name: string;
  accountCount: number;
  createdAt: number;
}
```

**Tests**:
- ✅ Save wallet
- ✅ Load wallet
- ✅ List wallets
- ✅ Delete wallet
- ✅ Set active wallet
- ✅ Multiple wallets
- ✅ Data persistence

**Acceptance Criteria**:
- Encrypted at rest
- Chrome storage quota managed
- Data integrity checks
- Proper error handling

---

### Week 6-7: Transaction Functionality

#### Task 1.6: Ethers.js Integration (4 hours)

**Objective**: Integrate ethers.js v6 for blockchain interactions

**Requirements**:
- Configure RPC providers (Infura/Alchemy)
- Network management (Mainnet, Sepolia testnet)
- Provider failover
- Request rate limiting

**Implementation**:
```typescript
// src/lib/blockchain/provider.ts
import { ethers } from 'ethers';

export class ProviderManager {
  getProvider(network: Network): ethers.JsonRpcProvider;
  switchNetwork(network: Network): void;
  getCurrentNetwork(): Network;
  testConnection(): Promise<boolean>;
}

export enum Network {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
```

**Tests**:
- ✅ Connect to Sepolia
- ✅ Get current block number
- ✅ Switch networks
- ✅ Handle connection errors
- ✅ Provider failover

**Dependencies**: `ethers@^6.0.0`

**Acceptance Criteria**:
- Works with Infura and Alchemy
- Automatic failover
- Network switching
- Error handling

---

#### Task 1.7: Balance Fetching & Display (4 hours)

**Objective**: Fetch and display ETH balances with USD conversion

**Requirements**:
- Real-time ETH balance
- USD price conversion
- Balance caching (2-minute TTL)
- Multiple account support
- Loading states

**Implementation**:
```typescript
// src/lib/blockchain/balance.ts
export class BalanceManager {
  async getBalance(address: string): Promise<Balance>;
  async getBalanceUSD(address: string): Promise<number>;
  async getEthPrice(): Promise<number>;
  invalidateCache(address?: string): void;
}

export interface Balance {
  address: string;
  eth: string; // Human-readable
  wei: string; // Raw value
  usd: number;
  updatedAt: number;
}
```

**Tests**:
- ✅ Fetch balance (testnet)
- ✅ Convert to USD
- ✅ Cache works
- ✅ Cache invalidation
- ✅ Handle errors
- ✅ Multiple accounts

**Acceptance Criteria**:
- Accurate balance display
- USD conversion
- Caching reduces API calls
- Loading states

---

#### Task 1.8: Transaction Construction (8 hours)

**Objective**: Build and sign Ethereum transactions

**Requirements**:
- Transaction parameter validation
- Gas estimation with buffer (10%)
- Nonce management
- Transaction signing
- EIP-1559 support (Type 2 transactions)
- Legacy transaction support (Type 0)

**Implementation**:
```typescript
// src/lib/blockchain/transaction.ts
export class TransactionManager {
  async buildTransaction(params: TransactionParams): Promise<Transaction>;
  async estimateGas(tx: Transaction): Promise<bigint>;
  async signTransaction(tx: Transaction, privateKey: string): Promise<string>;
  async sendTransaction(signedTx: string): Promise<TransactionReceipt>;
  async getTransactionStatus(txHash: string): Promise<TransactionStatus>;
}

export interface TransactionParams {
  from: string;
  to: string;
  value: string; // ETH amount
  data?: string;
  gasLimit?: bigint;
  maxFeePerGas?: bigint; // EIP-1559
  maxPriorityFeePerGas?: bigint; // EIP-1559
  gasPrice?: bigint; // Legacy
  nonce?: number;
}

export interface Transaction {
  type: 0 | 2; // 0 = Legacy, 2 = EIP-1559
  chainId: number;
  nonce: number;
  to: string;
  value: bigint;
  data: string;
  gasLimit: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}
```

**Tests**:
- ✅ Build transaction
- ✅ Estimate gas
- ✅ Sign transaction
- ✅ Validate parameters
- ✅ Handle insufficient balance
- ✅ Handle invalid address
- ✅ Nonce management
- ✅ EIP-1559 transaction
- ✅ Legacy transaction

**Acceptance Criteria**:
- Accurate gas estimation
- Proper transaction signing
- EIP-1559 support
- Error handling

---

#### Task 1.9: Transaction Broadcasting & Confirmation (6 hours)

**Objective**: Send transactions and track confirmations

**Requirements**:
- Broadcast signed transactions
- Confirmation tracking (6 blocks)
- Transaction status updates
- Error handling (reverted, dropped)
- Transaction history

**Implementation**:
```typescript
// src/lib/blockchain/broadcaster.ts
export class TransactionBroadcaster {
  async broadcast(signedTx: string): Promise<string>; // Returns tx hash
  async waitForConfirmation(
    txHash: string,
    confirmations: number = 6
  ): Promise<TransactionReceipt>;
  async getReceipt(txHash: string): Promise<TransactionReceipt | null>;
  subscribeToStatus(
    txHash: string,
    callback: (status: TransactionStatus) => void
  ): () => void;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: 'success' | 'reverted';
  confirmations: number;
}
```

**Tests**:
- ✅ Broadcast transaction (testnet)
- ✅ Get receipt
- ✅ Wait for confirmation
- ✅ Handle reverted tx
- ✅ Handle dropped tx
- ✅ Status subscription

**Acceptance Criteria**:
- Reliable broadcasting
- Confirmation tracking
- Status updates
- Error recovery

---

### Week 8: UI & Integration

#### Task 1.10: Wallet Creation Flow (8 hours)

**Objective**: Build UI for creating/importing wallets

**Requirements**:
- Create new wallet (generate seed)
- Import existing wallet (enter seed)
- Password setup
- Seed phrase display with warnings
- Seed phrase backup confirmation
- Wallet naming

**Components**:
```typescript
// src/components/wallet/WalletCreateFlow.tsx
- WalletCreate
- SeedPhraseDisplay
- SeedPhraseConfirm
- PasswordSetup
- WalletNaming

// src/components/wallet/WalletImport.tsx
- WalletImport
- SeedPhraseInput
- PasswordSetup
```

**Tests**:
- ✅ Create wallet flow
- ✅ Import wallet flow
- ✅ Password validation
- ✅ Seed confirmation
- ✅ Error states

**Acceptance Criteria**:
- Clear user guidance
- Security warnings prominent
- Validation feedback
- Responsive design

---

#### Task 1.11: Main Wallet UI (10 hours)

**Objective**: Build main wallet interface

**Requirements**:
- Display wallet address (with copy)
- Show ETH balance (with USD value)
- Account switcher
- Network selector
- Refresh button
- Loading states
- Error states

**Components**:
```typescript
// src/components/wallet/WalletDashboard.tsx
- WalletHeader
- BalanceDisplay
- AccountList
- NetworkSelector
- RefreshButton

// src/components/wallet/AddressDisplay.tsx
- Address with QR code
- Copy button
- Share button
```

**Tests**:
- ✅ Display balance
- ✅ Copy address
- ✅ Switch accounts
- ✅ Switch networks
- ✅ Refresh balance
- ✅ Loading states

**Acceptance Criteria**:
- Clean, modern design
- Responsive layout
- Accessible (WCAG 2.1)
- Fast performance

---

#### Task 1.12: Send Transaction UI (10 hours)

**Objective**: Build transaction sending interface

**Requirements**:
- Address input with validation
- Amount input with max button
- Gas settings (auto/custom)
- Transaction preview
- Confirmation modal
- Progress tracking
- Success/failure feedback

**Components**:
```typescript
// src/components/wallet/SendTransaction.tsx
- AddressInput
- AmountInput
- GasSelector
- TransactionPreview
- ConfirmationModal
- TransactionStatus

// src/hooks/useTransaction.ts
- Build transaction hook
- Send transaction hook
- Track transaction hook
```

**Tests**:
- ✅ Input validation
- ✅ Amount validation
- ✅ Gas estimation
- ✅ Transaction preview
- ✅ Send transaction
- ✅ Track confirmation
- ✅ Error handling

**Acceptance Criteria**:
- Clear validation
- Gas estimation accurate
- Confirmation clear
- Status tracking
- Error recovery

---

## 📊 Testing Strategy

### Unit Tests (Target: 100% coverage for crypto)

```
Key Management:         20 tests
Encryption:             15 tests
Transaction Building:   25 tests
Balance Fetching:       10 tests
Provider Management:     8 tests
Wallet Storage:         12 tests

Total:                  90+ tests
```

### Integration Tests

```
Wallet Creation:        5 tests
Wallet Import:          3 tests
Transaction Flow:       8 tests
Balance Display:        4 tests
Network Switching:      3 tests

Total:                  23+ tests
```

### E2E Tests (Manual for Phase 1)

```
✅ Create wallet
✅ Import wallet
✅ View balance
✅ Send transaction (testnet)
✅ Receive transaction (testnet)
✅ Switch networks
✅ Switch accounts
```

---

## 🔐 Security Checklist

### Key Management

- [ ] No private keys in logs
- [ ] No seed phrases in logs
- [ ] Keys wiped from memory after use
- [ ] Proper entropy source
- [ ] BIP-39/44 compliant
- [ ] No key material in error messages

### Encryption

- [ ] AES-256-GCM used
- [ ] 100,000+ PBKDF2 iterations
- [ ] Unique salt per wallet
- [ ] Unique IV per encryption
- [ ] Authentication tags verified
- [ ] Constant-time comparisons

### Storage

- [ ] All data encrypted at rest
- [ ] Chrome storage quotas managed
- [ ] Data integrity checks
- [ ] No sensitive data in unencrypted state

### UI/UX

- [ ] Password never displayed
- [ ] Seed phrase warnings clear
- [ ] Transaction confirmations required
- [ ] Gas estimates include buffer
- [ ] Error messages don't leak data

### Testing

- [ ] 100% crypto function coverage
- [ ] All error paths tested
- [ ] Edge cases covered
- [ ] Security-focused tests
- [ ] Manual security testing

---

## 📦 Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "ethers": "^6.13.4",
    "@noble/hashes": "^1.4.0",
    "@scure/bip39": "^1.3.0"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.278"
  }
}
```

### RPC Provider Setup

**Infura**:
- Sign up: https://infura.io/
- Create project
- Get API key
- Add to `.env.local`: `VITE_INFURA_KEY=your_key`

**Alchemy** (backup):
- Sign up: https://www.alchemy.com/
- Create app
- Get API key
- Add to `.env.local`: `VITE_ALCHEMY_KEY=your_key`

---

## 🎯 Success Criteria

### Functional

- [ ] Create wallet from new seed phrase
- [ ] Import wallet from existing seed
- [ ] Display ETH balance (with USD)
- [ ] Send ETH transaction (testnet)
- [ ] Receive ETH (show in balance)
- [ ] Switch between accounts
- [ ] Switch between networks
- [ ] Persistent across sessions

### Performance

- [ ] Balance fetch <500ms
- [ ] Transaction signing <100ms
- [ ] Encryption <100ms
- [ ] UI responsive (<100ms interactions)
- [ ] Build size <2MB

### Security

- [ ] 100% crypto test coverage
- [ ] No private keys in logs
- [ ] Rate limiting works
- [ ] Encryption verified
- [ ] No XSS vulnerabilities

### Quality

- [ ] 90+ tests passing
- [ ] TypeScript strict mode
- [ ] ESLint clean
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Documentation complete

---

## 📅 Timeline

```
Week 4:  Key Management (Tasks 1.1-1.3)
Week 5:  Security & Storage (Tasks 1.4-1.5)
Week 6:  Blockchain Integration (Tasks 1.6-1.7)
Week 7:  Transactions (Tasks 1.8-1.9)
Week 8:  UI Integration (Tasks 1.10-1.12)

Total: 5 weeks (Weeks 4-8)
```

### Milestones

- **End of Week 5**: Encrypted wallet storage working
- **End of Week 7**: Send transaction working (testnet)
- **End of Week 8**: Full wallet UI complete

---

## 🚦 Risk Assessment

### Technical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Key management bugs | High | Medium | 100% test coverage |
| Encryption vulnerabilities | High | Low | Use WebCrypto, external review |
| RPC provider failures | Medium | Medium | Failover to backup |
| Gas estimation errors | Medium | Medium | 10% buffer, user override |
| Transaction failures | Low | Medium | Clear error messages |

### Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Crypto implementation complex | +1 week | Start early, seek review |
| UI polish takes longer | +0.5 week | Basic UI acceptable |
| Testing finds issues | +0.5 week | Test as you go |

**Overall Risk**: **MEDIUM** (manageable with proper planning)

---

## 📚 Resources

### Documentation

- **BIP-39**: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- **BIP-44**: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- **EIP-1559**: https://eips.ethereum.org/EIPS/eip-1559
- **Ethers.js v6**: https://docs.ethers.org/v6/
- **WebCrypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

### References

- **MetaMask**: https://github.com/MetaMask/metamask-extension
- **Rabby**: https://github.com/RabbyHub/Rabby
- **Frame**: https://github.com/floating/frame

---

## 🤝 Team Coordination

### Roles

**Backend (Crypto/Blockchain)**: 60% effort
- Key management
- Encryption
- Transaction handling
- Provider integration

**Frontend (UI/UX)**: 40% effort
- Component development
- State management
- User flows
- Styling

### Communication

- **Daily standups**: Quick sync on blockers
- **Mid-week review**: Progress check
- **End-of-week demo**: Show working features
- **Security review**: Week 5 and Week 8

---

## ✅ Phase 1 Readiness Checklist

### Prerequisites (from Phase 0)

- [x] Project structure complete
- [x] Build system working
- [x] Lua sandbox functional
- [x] Documentation comprehensive
- [x] Testing infrastructure ready

### Setup Tasks

- [ ] Install new dependencies
- [ ] Configure RPC providers (Infura/Alchemy)
- [ ] Set up test wallets (Sepolia testnet)
- [ ] Create UI component library
- [ ] Set up Zustand store
- [ ] Configure error boundaries

### Development Environment

- [ ] Node.js 18+ ✅
- [ ] pnpm 8+ ✅
- [ ] Chrome Dev ✅
- [ ] Infura account ⏳
- [ ] Alchemy account ⏳
- [ ] Testnet ETH (faucet) ⏳

---

## 🎊 Let's Build!

Phase 1 is the **core of the wallet** - getting this right is critical for everything that follows.

### Key Focus Areas

1. **Security First**: 100% test coverage for crypto
2. **User Experience**: Clear, intuitive flows
3. **Error Handling**: Graceful failure, helpful messages
4. **Performance**: Fast, responsive UI
5. **Documentation**: Keep docs updated

### Development Principles

- ✅ Test as you go (don't defer testing)
- ✅ Security review crypto code
- ✅ Use testnet for all testing
- ✅ Keep components small and focused
- ✅ Document complex logic
- ✅ Handle errors gracefully

**Let's build something secure, fast, and user-friendly! 🚀**

---

**Document Created**: October 7, 2025  
**Phase**: 1 - Core Wallet Infrastructure  
**Duration**: 5 weeks (Weeks 4-8)  
**Status**: Ready to begin

---

*"Phase 0 validation exceeded all expectations. Phase 1 is where we build the secure foundation for the programmable wallet vision. Let's make it excellent!"* 🎯

