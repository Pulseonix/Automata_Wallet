/**
 * BIP-39 Mnemonic and HD Wallet Implementation
 * 
 * Implements BIP-39 for mnemonic generation and BIP-44 for HD wallet derivation.
 * Uses ethers.js v6 for cryptographic operations.
 * 
 * Security: All operations use cryptographically secure randomness.
 * 
 * References:
 * - BIP-39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * - BIP-44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 */

import { Mnemonic, HDNodeWallet, randomBytes, hexlify } from 'ethers';

/**
 * Supported mnemonic strengths (in bits)
 * 128 bits = 12 words
 * 256 bits = 24 words
 */
export type MnemonicStrength = 128 | 256;

/**
 * Number of words in mnemonic
 */
export type MnemonicWordCount = 12 | 24;

/**
 * Result of mnemonic generation
 */
export interface GenerateMnemonicResult {
  mnemonic: string;
  wordCount: MnemonicWordCount;
  strength: MnemonicStrength;
  entropy: string; // Hex-encoded entropy
}

/**
 * Result of mnemonic validation
 */
export interface ValidateMnemonicResult {
  valid: boolean;
  error?: string;
  wordCount?: MnemonicWordCount;
  strength?: MnemonicStrength;
}

/**
 * Generate a cryptographically secure BIP-39 mnemonic
 * 
 * @param strength - Entropy strength in bits (128 for 12 words, 256 for 24 words)
 * @returns Generated mnemonic and metadata
 * 
 * @example
 * ```typescript
 * const { mnemonic } = await generateMnemonic(128);
 * console.log(mnemonic); // "witch collapse practice feed shame open despair creek road again ice least"
 * ```
 */
export async function generateMnemonic(
  strength: MnemonicStrength = 128
): Promise<GenerateMnemonicResult> {
  // Validate strength
  if (strength !== 128 && strength !== 256) {
    throw new Error('Strength must be 128 (12 words) or 256 (24 words)');
  }

  try {
    // Generate cryptographically secure random entropy
    const entropyBytes = randomBytes(strength / 8);
    // Convert Uint8Array to hex string for Mnemonic.fromEntropy
    const entropy = hexlify(entropyBytes);
    
    // Create mnemonic from entropy
    const mnemonicObj = Mnemonic.fromEntropy(entropy);
    
    // Calculate word count
    const wordCount = (strength === 128 ? 12 : 24) as MnemonicWordCount;
    
    return {
      mnemonic: mnemonicObj.phrase,
      wordCount,
      strength,
      entropy: entropy,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate mnemonic: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate a BIP-39 mnemonic
 * 
 * Checks:
 * - Word count (must be 12 or 24)
 * - All words are in BIP-39 wordlist
 * - Checksum is valid
 * 
 * @param mnemonic - Mnemonic phrase to validate
 * @returns Validation result with error details if invalid
 * 
 * @example
 * ```typescript
 * const result = validateMnemonic("witch collapse practice...");
 * if (result.valid) {
 *   console.log(`Valid ${result.wordCount}-word mnemonic`);
 * } else {
 *   console.error(`Invalid: ${result.error}`);
 * }
 * ```
 */
export function validateMnemonic(mnemonic: string): ValidateMnemonicResult {
  try {
    // Trim and normalize whitespace
    const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Check if empty
    if (!normalized) {
      return {
        valid: false,
        error: 'Mnemonic is empty',
      };
    }
    
    // Count words
    const words = normalized.split(' ');
    const wordCount = words.length;
    
    // Validate word count
    if (wordCount !== 12 && wordCount !== 24) {
      return {
        valid: false,
        error: `Invalid word count: ${wordCount}. Must be 12 or 24 words.`,
      };
    }
    
    // Attempt to create Mnemonic object (validates checksum)
    try {
      Mnemonic.fromPhrase(normalized);
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid mnemonic checksum or words',
      };
    }
    
    // Calculate strength
    const strength = (wordCount === 12 ? 128 : 256) as MnemonicStrength;
    
    return {
      valid: true,
      wordCount: wordCount as MnemonicWordCount,
      strength,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Check if a string is a valid BIP-39 mnemonic (convenience function)
 * 
 * @param mnemonic - Mnemonic phrase to check
 * @returns True if valid, false otherwise
 * 
 * @example
 * ```typescript
 * if (isValidMnemonic(userInput)) {
 *   // Proceed with wallet import
 * }
 * ```
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic).valid;
}

/**
 * Convert mnemonic to seed (512-bit)
 * 
 * Uses PBKDF2-SHA512 with 2048 iterations per BIP-39 spec.
 * The seed is used to derive HD wallets (BIP-44).
 * 
 * @param mnemonic - Valid BIP-39 mnemonic
 * @param password - Optional password for additional security (default: empty string)
 * @returns 512-bit seed as hex string
 * 
 * @example
 * ```typescript
 * const seed = await mnemonicToSeed(mnemonic);
 * const hdWallet = HDNodeWallet.fromSeed(seed);
 * ```
 */
export async function mnemonicToSeed(
  mnemonic: string,
  password: string = ''
): Promise<string> {
  // Validate mnemonic first
  const validation = validateMnemonic(mnemonic);
  if (!validation.valid) {
    throw new Error(`Invalid mnemonic: ${validation.error}`);
  }
  
  try {
    // Create Mnemonic object and compute seed
    const mnemonicObj = Mnemonic.fromPhrase(mnemonic.trim().toLowerCase().replace(/\s+/g, ' '));
    
    // ethers.js v6: Use computeSeed() method which returns the 512-bit seed
    // Password parameter is handled through Mnemonic creation
    const passwordMnemonic = password 
      ? Mnemonic.fromPhrase(mnemonic.trim().toLowerCase().replace(/\s+/g, ' '), password)
      : mnemonicObj;
    
    const seed = passwordMnemonic.computeSeed();
    
    return seed;
  } catch (error) {
    throw new Error(
      `Failed to convert mnemonic to seed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create HD wallet from mnemonic
 * 
 * Convenience function that combines mnemonic validation,
 * seed derivation, and HD wallet creation.
 * 
 * @param mnemonic - Valid BIP-39 mnemonic
 * @param password - Optional password
 * @returns HD wallet instance
 * 
 * @example
 * ```typescript
 * const hdWallet = await createHDWalletFromMnemonic(mnemonic);
 * const firstAccount = hdWallet.derivePath("m/44'/60'/0'/0/0");
 * console.log(firstAccount.address);
 * ```
 */
export async function createHDWalletFromMnemonic(
  mnemonic: string,
  password: string = ''
): Promise<HDNodeWallet> {
  // Validate mnemonic
  const validation = validateMnemonic(mnemonic);
  if (!validation.valid) {
    throw new Error(`Invalid mnemonic: ${validation.error}`);
  }
  
  try {
    // Get the seed from mnemonic
    const seed = await mnemonicToSeed(mnemonic, password);
    
    // Create HD wallet from seed at root level
    // This allows us to derive any BIP-44 path
    const hdWallet = HDNodeWallet.fromSeed(seed);
    
    return hdWallet;
  } catch (error) {
    throw new Error(
      `Failed to create HD wallet: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get word list for a specific language
 * 
 * @param locale - Language code (default: 'en')
 * @returns Array of BIP-39 words
 * 
 * @example
 * ```typescript
 * const words = getWordlist('en');
 * console.log(words.length); // 2048
 * ```
 */
export function getWordlist(locale: string = 'en'): string[] {
  try {
    // ethers.js v6: Use LangEn.wordlist() for English
    // Other languages were removed in v6 for security reasons
    if (locale !== 'en') {
      throw new Error('Only English (en) wordlist is supported in ethers.js v6');
    }
    
    // Create a temporary mnemonic to access wordlist
    const entropyBytes = randomBytes(16);
    const entropy = hexlify(entropyBytes);
    const tempMnemonic = Mnemonic.fromEntropy(entropy);
    const wordlist = tempMnemonic.wordlist;
    
    return Array.from({ length: 2048 }, (_, i) => wordlist.getWord(i));
  } catch (error) {
    throw new Error(
      `Failed to get wordlist for locale '${locale}': ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Split mnemonic into individual words
 * 
 * @param mnemonic - Mnemonic phrase
 * @returns Array of normalized words
 */
export function splitMnemonic(mnemonic: string): string[] {
  return mnemonic.trim().toLowerCase().replace(/\s+/g, ' ').split(' ');
}

/**
 * Join words into mnemonic phrase
 * 
 * @param words - Array of words
 * @returns Normalized mnemonic phrase
 */
export function joinMnemonic(words: string[]): string {
  return words.map(w => w.trim().toLowerCase()).join(' ');
}
