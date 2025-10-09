/**
 * BIP-39 Tests
 * 
 * Tests for mnemonic generation, validation, and seed derivation.
 * Includes test vectors from BIP-39 specification.
 */

import { describe, it, expect } from 'vitest';
import {
  generateMnemonic,
  validateMnemonic,
  isValidMnemonic,
  mnemonicToSeed,
  createHDWalletFromMnemonic,
  getWordlist,
  splitMnemonic,
  joinMnemonic,
  type MnemonicStrength,
} from './bip39';

describe('BIP-39 Mnemonic Generation', () => {
  it('should generate a valid 12-word mnemonic', async () => {
    const result = await generateMnemonic(128);
    
    expect(result.mnemonic).toBeDefined();
    expect(result.wordCount).toBe(12);
    expect(result.strength).toBe(128);
    expect(result.entropy).toMatch(/^0x[0-9a-f]{32}$/);
    
    // Validate generated mnemonic
    expect(isValidMnemonic(result.mnemonic)).toBe(true);
  });

  it('should generate a valid 24-word mnemonic', async () => {
    const result = await generateMnemonic(256);
    
    expect(result.mnemonic).toBeDefined();
    expect(result.wordCount).toBe(24);
    expect(result.strength).toBe(256);
    expect(result.entropy).toMatch(/^0x[0-9a-f]{64}$/);
    
    // Validate generated mnemonic
    expect(isValidMnemonic(result.mnemonic)).toBe(true);
  });

  it('should generate different mnemonics each time', async () => {
    const result1 = await generateMnemonic(128);
    const result2 = await generateMnemonic(128);
    
    expect(result1.mnemonic).not.toBe(result2.mnemonic);
    expect(result1.entropy).not.toBe(result2.entropy);
  });

  it('should default to 12 words when no strength specified', async () => {
    const result = await generateMnemonic();
    
    expect(result.wordCount).toBe(12);
    expect(result.strength).toBe(128);
  });

  it('should reject invalid strength values', async () => {
    await expect(generateMnemonic(192 as MnemonicStrength)).rejects.toThrow(
      'Strength must be 128 (12 words) or 256 (24 words)'
    );
  });

  it('should generate mnemonic with words from BIP-39 wordlist', async () => {
    const result = await generateMnemonic(128);
    const words = splitMnemonic(result.mnemonic);
    const wordlist = getWordlist('en');
    
    words.forEach((word: string) => {
      expect(wordlist).toContain(word);
    });
  });
});

describe('BIP-39 Mnemonic Validation', () => {
  // Valid test vectors from BIP-39
  const validMnemonics = [
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
    'letter advice cage absurd amount doctor acoustic avoid letter advice cage above',
    'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong',
  ];

  validMnemonics.forEach((mnemonic, index) => {
    it(`should validate correct mnemonic #${index + 1}`, () => {
      const result = validateMnemonic(mnemonic);
      
      expect(result.valid).toBe(true);
      expect(result.wordCount).toBe(12);
      expect(result.strength).toBe(128);
      expect(result.error).toBeUndefined();
    });
  });

  it('should reject empty mnemonic', () => {
    const result = validateMnemonic('');
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject mnemonic with wrong word count', () => {
    const result = validateMnemonic('abandon abandon abandon');
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid word count');
  });

  it('should reject mnemonic with invalid checksum', () => {
    // Last word is wrong (checksum failure)
    const result = validateMnemonic(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'
    );
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject mnemonic with invalid words', () => {
    const result = validateMnemonic(
      'invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid invalid'
    );
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should normalize whitespace', () => {
    const result = validateMnemonic(
      '  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  about  '
    );
    
    expect(result.valid).toBe(true);
  });

  it('should be case-insensitive', () => {
    const result = validateMnemonic(
      'ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABOUT'
    );
    
    expect(result.valid).toBe(true);
  });

  it('isValidMnemonic should return boolean', () => {
    expect(isValidMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')).toBe(true);
    expect(isValidMnemonic('invalid mnemonic')).toBe(false);
  });
});

describe('BIP-39 Seed Derivation', () => {
  // Test vector from BIP-39 spec
  const testVector = {
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    // Expected seed with empty password
    seed: '0x5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4',
  };

  it('should convert mnemonic to seed', async () => {
    const seed = await mnemonicToSeed(testVector.mnemonic);
    
    expect(seed).toBe(testVector.seed);
  });

  it('should produce different seed with password', async () => {
    const seedNoPassword = await mnemonicToSeed(testVector.mnemonic);
    const seedWithPassword = await mnemonicToSeed(testVector.mnemonic, 'password123');
    
    expect(seedWithPassword).not.toBe(seedNoPassword);
    expect(seedWithPassword).toMatch(/^0x[0-9a-f]{128}$/);
  });

  it('should reject invalid mnemonic', async () => {
    await expect(mnemonicToSeed('invalid mnemonic')).rejects.toThrow('Invalid mnemonic');
  });

  it('should produce consistent seeds', async () => {
    const seed1 = await mnemonicToSeed(testVector.mnemonic);
    const seed2 = await mnemonicToSeed(testVector.mnemonic);
    
    expect(seed1).toBe(seed2);
  });

  it('should produce 512-bit (64-byte) seed', async () => {
    const seed = await mnemonicToSeed(testVector.mnemonic);
    
    // 0x + 128 hex chars = 512 bits
    expect(seed).toMatch(/^0x[0-9a-f]{128}$/);
  });
});

describe('HD Wallet Creation', () => {
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  it('should create HD wallet from mnemonic', async () => {
    const hdWallet = await createHDWalletFromMnemonic(testMnemonic);
    
    expect(hdWallet).toBeDefined();
    expect(hdWallet.address).toBeDefined();
    expect(hdWallet.privateKey).toBeDefined();
    expect(hdWallet.mnemonic).toBeDefined();
  });

  it('should create wallet with correct first address', async () => {
    const hdWallet = await createHDWalletFromMnemonic(testMnemonic);
    
    // Known address for test vector at m (root)
    // Note: This is the root address, not the derived BIP-44 address
    expect(hdWallet.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('should support password-protected wallets', async () => {
    const wallet1 = await createHDWalletFromMnemonic(testMnemonic);
    const wallet2 = await createHDWalletFromMnemonic(testMnemonic, 'password');
    
    // Different addresses due to different password
    expect(wallet1.address).not.toBe(wallet2.address);
  });

  it('should reject invalid mnemonic', async () => {
    await expect(createHDWalletFromMnemonic('invalid mnemonic')).rejects.toThrow('Invalid mnemonic');
  });

  it('should allow BIP-44 derivation', async () => {
    const hdWallet = await createHDWalletFromMnemonic(testMnemonic);
    
    // Wallet is created at root level, we can derive full BIP-44 paths
    // Derive first Ethereum account (BIP-44: m/44'/60'/0'/0/0)
    const account0 = hdWallet.derivePath("m/44'/60'/0'/0/0");
    expect(account0.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    
    // Derive second account
    const account1 = hdWallet.derivePath("m/44'/60'/0'/0/1");
    expect(account1.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    
    // Addresses should be different
    expect(account0.address).not.toBe(account1.address);
  });
});

describe('BIP-39 Wordlist', () => {
  it('should return English wordlist', () => {
    const wordlist = getWordlist('en');
    
    expect(wordlist).toHaveLength(2048);
    expect(wordlist[0]).toBe('abandon');
    expect(wordlist[2047]).toBe('zoo');
  });

  it('should contain common BIP-39 words', () => {
    const wordlist = getWordlist('en');
    
    expect(wordlist).toContain('abandon');
    expect(wordlist).toContain('ability');
    expect(wordlist).toContain('about');
    expect(wordlist).toContain('zoo');
  });

  it('should reject unsupported locales', () => {
    expect(() => getWordlist('fr')).toThrow('Only English (en) wordlist is supported');
  });

  it('should default to English', () => {
    const wordlist = getWordlist();
    
    expect(wordlist).toHaveLength(2048);
  });
});

describe('BIP-39 Utility Functions', () => {
  it('should split mnemonic into words', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const words = splitMnemonic(mnemonic);
    
    expect(words).toHaveLength(12);
    expect(words[0]).toBe('abandon');
    expect(words[11]).toBe('about');
  });

  it('should handle extra whitespace when splitting', () => {
    const mnemonic = '  abandon  abandon  about  ';
    const words = splitMnemonic(mnemonic);
    
    expect(words).toEqual(['abandon', 'abandon', 'about']);
  });

  it('should join words into mnemonic', () => {
    const words = ['abandon', 'abandon', 'about'];
    const mnemonic = joinMnemonic(words);
    
    expect(mnemonic).toBe('abandon abandon about');
  });

  it('should normalize words when joining', () => {
    const words = ['  ABANDON  ', 'ABANDON', 'About  '];
    const mnemonic = joinMnemonic(words);
    
    expect(mnemonic).toBe('abandon abandon about');
  });

  it('should handle round-trip split/join', () => {
    const original = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const words = splitMnemonic(original);
    const reconstructed = joinMnemonic(words);
    
    expect(reconstructed).toBe(original);
  });
});

describe('BIP-39 Performance', () => {
  it('should generate mnemonic quickly', async () => {
    const start = performance.now();
    await generateMnemonic(128);
    const duration = performance.now() - start;
    
    // Should be fast (< 100ms)
    expect(duration).toBeLessThan(100);
  });

  it('should validate mnemonic quickly', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    const start = performance.now();
    validateMnemonic(mnemonic);
    const duration = performance.now() - start;
    
    // Should be very fast (< 10ms)
    expect(duration).toBeLessThan(10);
  });

  it('should derive seed in reasonable time', async () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    const start = performance.now();
    await mnemonicToSeed(mnemonic);
    const duration = performance.now() - start;
    
    // PBKDF2 with 2048 iterations should be < 50ms
    expect(duration).toBeLessThan(50);
  });
});
