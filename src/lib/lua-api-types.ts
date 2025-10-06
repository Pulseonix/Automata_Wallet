/**
 * Lua API Type Definitions
 * 
 * Defines the TypeScript interface for APIs exposed to Lua scripts.
 * These APIs will be available in Lua as global tables/functions.
 * 
 * Phase 0.2: Mock implementations for PoC
 * Phase 3: Real implementations with wallet integration
 */

// ============================================================================
// WALLET API
// ============================================================================

/**
 * Wallet API - Account and balance operations
 * 
 * Lua usage:
 * ```lua
 * local address = wallet.getAddress()
 * local balance = wallet.getBalance()
 * local network = wallet.getNetwork()
 * ```
 */
export interface WalletAPI {
  /**
   * Get the current wallet address
   * @returns Ethereum address (0x...)
   */
  getAddress(): string;

  /**
   * Get ETH balance for current wallet
   * @returns Balance in ETH (as string to preserve precision)
   */
  getBalance(): Promise<string>;

  /**
   * Get current network name
   * @returns Network name (e.g., "mainnet", "sepolia")
   */
  getNetwork(): string;

  /**
   * Get token balance for a specific ERC20 token
   * @param tokenAddress - Token contract address
   * @returns Balance in token units (as string)
   */
  getTokenBalance(tokenAddress: string): Promise<string>;
}

// ============================================================================
// CONTRACT API
// ============================================================================

/**
 * Contract API - Smart contract interactions
 * 
 * Lua usage:
 * ```lua
 * local usdc = contract.read(
 *   "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
 *   "balanceOf",
 *   {wallet.getAddress()}
 * )
 * ```
 */
export interface ContractAPI {
  /**
   * Read data from a smart contract (view/pure functions)
   * @param address - Contract address
   * @param method - Function name
   * @param args - Function arguments
   * @returns Function return value
   */
  read(address: string, method: string, args: unknown[]): Promise<unknown>;

  /**
   * Get contract ABI (for inspection)
   * @param address - Contract address
   * @returns ABI JSON
   */
  getABI(address: string): Promise<unknown[]>;
}

// ============================================================================
// NETWORK API
// ============================================================================

/**
 * Network API - Blockchain network operations
 * 
 * Lua usage:
 * ```lua
 * local chainId = network.getChainId()
 * local blockNum = network.getBlockNumber()
 * ```
 */
export interface NetworkAPI {
  /**
   * Get current chain ID
   * @returns Chain ID (1 = mainnet, 11155111 = sepolia)
   */
  getChainId(): number;

  /**
   * Get latest block number
   * @returns Block number
   */
  getBlockNumber(): Promise<number>;

  /**
   * Get gas price estimation
   * @returns Gas price in gwei
   */
  getGasPrice(): Promise<string>;
}

// ============================================================================
// HTTP API (Rate-limited)
// ============================================================================

/**
 * HTTP API - External API calls (rate-limited for security)
 * 
 * Lua usage:
 * ```lua
 * local response = http.get("https://api.coingecko.com/...")
 * local data = response.data
 * ```
 */
export interface HttpAPI {
  /**
   * Perform GET request (rate-limited)
   * @param url - URL to fetch (must be whitelisted)
   * @returns Response data
   */
  get(url: string): Promise<{ data: unknown; status: number }>;

  /**
   * Check if URL is whitelisted
   * @param url - URL to check
   * @returns True if allowed
   */
  isWhitelisted(url: string): boolean;
}

// ============================================================================
// STORAGE API (Sandboxed)
// ============================================================================

/**
 * Storage API - Persistent storage for script data (sandboxed)
 * 
 * Lua usage:
 * ```lua
 * storage.set("lastCheck", os.time())
 * local lastCheck = storage.get("lastCheck")
 * ```
 */
export interface StorageAPI {
  /**
   * Get value from script storage
   * @param key - Storage key (scoped to script)
   * @returns Stored value or null
   */
  get(key: string): Promise<unknown | null>;

  /**
   * Set value in script storage
   * @param key - Storage key (scoped to script)
   * @param value - Value to store (must be JSON-serializable)
   */
  set(key: string, value: unknown): Promise<void>;

  /**
   * Remove value from script storage
   * @param key - Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all script storage
   */
  clear(): Promise<void>;
}

// ============================================================================
// COMBINED API SURFACE
// ============================================================================

/**
 * Complete API surface exposed to Lua scripts
 * 
 * This is injected into the Lua context as global tables.
 */
export interface LuaAPIContext {
  wallet: WalletAPI;
  contract: ContractAPI;
  network: NetworkAPI;
  http: HttpAPI;
  storage: StorageAPI;
}

// ============================================================================
// API CALL TRACKING
// ============================================================================

/**
 * API call metadata for rate limiting and monitoring
 */
export interface APICallMetadata {
  api: keyof LuaAPIContext;
  method: string;
  timestamp: number;
  executionTime?: number;
  success: boolean;
  error?: string;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxCallsPerSecond: number;
  maxCallsPerMinute: number;
  maxConcurrentCalls: number;
}

/**
 * Default rate limits (per API)
 */
export const DEFAULT_RATE_LIMITS: Record<keyof LuaAPIContext, RateLimitConfig> = {
  wallet: {
    maxCallsPerSecond: 10,
    maxCallsPerMinute: 100,
    maxConcurrentCalls: 5,
  },
  contract: {
    maxCallsPerSecond: 5,
    maxCallsPerMinute: 50,
    maxConcurrentCalls: 3,
  },
  network: {
    maxCallsPerSecond: 10,
    maxCallsPerMinute: 100,
    maxConcurrentCalls: 5,
  },
  http: {
    maxCallsPerSecond: 2,
    maxCallsPerMinute: 20,
    maxConcurrentCalls: 2,
  },
  storage: {
    maxCallsPerSecond: 20,
    maxCallsPerMinute: 200,
    maxConcurrentCalls: 10,
  },
};
