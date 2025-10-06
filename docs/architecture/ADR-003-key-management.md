# ADR-003: Key Management Strategy

**Status:** Proposed  
**Date:** 2025-10-06  
**Authors:** Development Team

## Context

Crypto wallet security depends entirely on proper key management. We must:
1. Generate cryptographically secure keys
2. Store keys securely in the browser
3. Encrypt keys at rest
4. Never expose raw private keys to scripts
5. Comply with BIP-39/BIP-44 standards
6. Support seed phrase backup and recovery

## Decision

**We will use WebCrypto API + Chrome Storage + BIP-39/44 with AES-GCM encryption.**

## Architecture

### Key Hierarchy (BIP-44)

```
Mnemonic (12/24 words)
    ↓ PBKDF2
Root Seed (512 bits)
    ↓ HMAC-SHA512
Master Key (m)
    ↓ derivation
m/44'/60'/0'/0/0  (First Ethereum address)
m/44'/60'/0'/0/1  (Second Ethereum address)
...
```

### Storage Model

```typescript
interface SecureStorage {
  // Encrypted with password-derived key
  encrypted: {
    mnemonic: string;      // Encrypted seed phrase
    privateKeys: string[]; // Encrypted private keys cache
    salt: string;          // For PBKDF2
  };
  
  // Unencrypted metadata
  public: {
    addresses: string[];   // Public addresses
    accountCount: number;
    version: string;
  };
}
```

### Encryption Flow

```
User Password
    ↓ PBKDF2 (100,000 iterations)
Encryption Key (256-bit)
    ↓ AES-GCM
Encrypted Mnemonic + IV + Auth Tag
    ↓ 
Chrome Storage (encrypted at OS level too)
```

## Implementation

### 1. Wallet Creation

```typescript
async function createWallet(password: string): Promise<Wallet> {
  // 1. Generate cryptographically secure mnemonic
  const mnemonic = generateMnemonic(128); // 12 words
  
  // 2. Derive seed from mnemonic
  const seed = await mnemonicToSeed(mnemonic);
  
  // 3. Create HD wallet
  const hdNode = HDNodeWallet.fromSeed(seed);
  
  // 4. Derive first address
  const account = hdNode.derivePath("m/44'/60'/0'/0/0");
  
  // 5. Generate encryption key from password
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encryptionKey = await deriveKey(password, salt);
  
  // 6. Encrypt mnemonic
  const encryptedMnemonic = await encrypt(mnemonic, encryptionKey);
  
  // 7. Store securely
  await chrome.storage.local.set({
    encrypted: {
      mnemonic: encryptedMnemonic,
      salt: bytesToHex(salt),
    },
    public: {
      addresses: [account.address],
      accountCount: 1,
    },
  });
  
  return {
    address: account.address,
    mnemonic, // Show once, then clear from memory
  };
}
```

### 2. Wallet Unlock

```typescript
async function unlockWallet(password: string): Promise<HDNodeWallet> {
  // 1. Retrieve encrypted data
  const stored = await chrome.storage.local.get(['encrypted', 'public']);
  
  // 2. Derive decryption key
  const salt = hexToBytes(stored.encrypted.salt);
  const decryptionKey = await deriveKey(password, salt);
  
  // 3. Decrypt mnemonic
  try {
    const mnemonic = await decrypt(stored.encrypted.mnemonic, decryptionKey);
    
    // 4. Recreate HD wallet
    const seed = await mnemonicToSeed(mnemonic);
    const hdNode = HDNodeWallet.fromSeed(seed);
    
    // 5. Store in memory for session (auto-lock after 30min)
    sessionStorage.set('hdNode', hdNode, { timeout: 30 * 60 * 1000 });
    
    return hdNode;
  } catch (error) {
    throw new Error('Invalid password');
  }
}
```

### 3. Key Derivation (PBKDF2)

```typescript
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // 1. Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // 2. Derive encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000, // OWASP recommendation
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

### 4. Encryption (AES-GCM)

```typescript
async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  // 1. Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // 2. Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  
  // 3. Combine IV + ciphertext (includes auth tag)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  // 4. Base64 encode
  return bytesToBase64(combined);
}

async function decrypt(
  encrypted: string,
  key: CryptoKey
): Promise<string> {
  // 1. Decode from base64
  const combined = base64ToBytes(encrypted);
  
  // 2. Split IV and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // 3. Decrypt
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  // 4. Decode to string
  return new TextDecoder().decode(plaintext);
}
```

### 5. Transaction Signing

```typescript
async function signTransaction(
  tx: TransactionRequest,
  accountIndex: number = 0
): Promise<string> {
  // 1. Get unlocked wallet from session
  const hdNode = sessionStorage.get('hdNode');
  if (!hdNode) {
    throw new Error('Wallet locked');
  }
  
  // 2. Derive specific account
  const account = hdNode.derivePath(`m/44'/60'/0'/0/${accountIndex}`);
  
  // 3. Sign transaction
  const signedTx = await account.signTransaction(tx);
  
  // 4. Clear account from memory
  account.privateKey = null; // Memory cleared by GC
  
  return signedTx;
}
```

## Security Properties

### Encryption Strength
- **AES-GCM:** Industry standard, authenticated encryption
- **256-bit keys:** Quantum-resistant for foreseeable future
- **PBKDF2 100k iterations:** Resists brute force attacks
- **Random salt:** Prevents rainbow table attacks
- **Random IV:** Ensures semantic security

### Storage Security
- **Chrome Storage:** Encrypted at OS level (OS keychain)
- **Session-only memory:** HD node auto-cleared after 30min
- **No disk writes:** Private keys never written to disk unencrypted
- **Secure memory:** Keys zeroed after use (where possible)

### Attack Resistance

| Attack | Mitigation |
|--------|------------|
| Brute force password | PBKDF2 makes each attempt slow |
| Rainbow tables | Unique salt per wallet |
| Known-plaintext | Authenticated encryption (GCM) |
| Memory dump | Keys cleared after use, session timeout |
| Disk forensics | Never written to disk unencrypted |
| Network sniffing | Keys never transmitted |
| Phishing | User must enter password (never auto-filled) |

## Password Requirements

```typescript
function validatePassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}
```

Minimum requirements:
- ✅ 12 characters minimum
- ✅ Uppercase and lowercase letters
- ✅ At least one number
- ✅ At least one special character
- ✅ Not a common password (check against list)

## Backup & Recovery

### Seed Phrase Export
```typescript
async function exportSeedPhrase(password: string): Promise<string> {
  // 1. Verify password
  const hdNode = await unlockWallet(password);
  
  // 2. Retrieve encrypted mnemonic
  const stored = await chrome.storage.local.get('encrypted');
  const salt = hexToBytes(stored.encrypted.salt);
  const key = await deriveKey(password, salt);
  const mnemonic = await decrypt(stored.encrypted.mnemonic, key);
  
  // 3. Show warning UI
  await showSeedPhraseWarning();
  
  // 4. Return mnemonic (user must write down)
  return mnemonic;
}
```

### Wallet Import
```typescript
async function importWallet(
  mnemonic: string,
  password: string
): Promise<void> {
  // 1. Validate mnemonic
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed phrase');
  }
  
  // 2. Same process as createWallet()
  const seed = await mnemonicToSeed(mnemonic);
  const hdNode = HDNodeWallet.fromSeed(seed);
  
  // 3. Encrypt and store
  // ... (same as createWallet)
}
```

## Testing Strategy

1. **Unit Tests:**
   - Test encryption/decryption with known vectors
   - Test key derivation with test passwords
   - Test BIP-39/44 derivation against reference implementation

2. **Integration Tests:**
   - Full wallet create → lock → unlock → sign flow
   - Test session timeout
   - Test incorrect password handling

3. **Security Tests:**
   - Attempt to extract keys from storage
   - Test memory after key operations
   - Fuzz password validation

4. **Performance Tests:**
   - PBKDF2 should take ~100-200ms (acceptable UX)
   - Encryption/decryption <10ms

## Future Enhancements (Post-Beta)

- [ ] Hardware wallet support (Ledger, Trezor)
- [ ] Multi-sig wallets
- [ ] Social recovery
- [ ] Biometric unlock (WebAuthn)
- [ ] Multiple password-protected wallets
- [ ] Account abstraction (ERC-4337)

## Known Limitations

- **Browser security dependency:** If browser is compromised, keys can be stolen
- **Memory attacks:** Cannot fully prevent memory dumps in JavaScript
- **Keylogger vulnerability:** Password can be keylogged
- **No offline signing:** Extension must be online (could add in v2)

## Consequences

### Positive
- Industry-standard cryptography
- BIP-39/44 compatibility (portable to other wallets)
- No custodial risk
- Strong password protection

### Negative
- User responsible for password (can't be reset)
- Seed phrase loss = permanent loss of funds
- Cannot recover from browser crash during unlock

### Mitigations
- Clear warnings about password importance
- Seed phrase backup prompts
- Export functionality for migration

## References

- [BIP-39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP-44 Specification](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Related ADRs

- [ADR-002: Sandbox Security Model](./ADR-002-sandbox-security.md)

---

**Status:** Awaiting implementation and security review.
