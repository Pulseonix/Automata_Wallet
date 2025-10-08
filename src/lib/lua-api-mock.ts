/**
 * Mock Lua API Implementations
 * 
 * Phase 0.2: Mock implementations for PoC testing
 * Phase 3: Replace with real wallet/blockchain integrations
 * 
 * These mocks simulate realistic data and behavior for validation.
 */

import type {
  WalletAPI,
  ContractAPI,
  NetworkAPI,
  HttpAPI,
  StorageAPI,
  LuaAPIContext,
} from './lua-api-types';

// ============================================================================
// MOCK WALLET API
// ============================================================================

class MockWalletAPI implements WalletAPI {
  private mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  private mockBalance = '1.5';
  private mockNetwork = 'sepolia';

  getAddress(): string {
    return this.mockAddress;
  }

  async getBalance(): Promise<string> {
    // Simulate network delay
    await this.delay(50);
    return this.mockBalance;
  }

  getNetwork(): string {
    return this.mockNetwork;
  }

  async getTokenBalance(tokenAddress: string): Promise<string> {
    await this.delay(100);
    
    // Mock USDC balance
    if (tokenAddress.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
      return '1000.50'; // 1000.50 USDC
    }
    
    // Mock DAI balance
    if (tokenAddress.toLowerCase() === '0x6b175474e89094c44da98b954eedeac495271d0f') {
      return '500.75'; // 500.75 DAI
    }
    
    return '0';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MOCK CONTRACT API
// ============================================================================

class MockContractAPI implements ContractAPI {
  async read(_address: string, method: string, _args: unknown[]): Promise<unknown> {
    await this.delay(100);

    // Mock ERC20 balanceOf
    if (method === 'balanceOf') {
      return '1000000000'; // 1000 USDC (6 decimals)
    }

    // Mock ERC20 decimals
    if (method === 'decimals') {
      return 6;
    }

    // Mock ERC20 symbol
    if (method === 'symbol') {
      if (_address.toLowerCase().includes('usdc')) return 'USDC';
      if (_address.toLowerCase().includes('dai')) return 'DAI';
      return 'TKN';
    }

    // Mock ERC20 name
    if (method === 'name') {
      if (_address.toLowerCase().includes('usdc')) return 'USD Coin';
      if (_address.toLowerCase().includes('dai')) return 'Dai Stablecoin';
      return 'Token';
    }

    return null;
  }

  async getABI(_address: string): Promise<unknown[]> {
    await this.delay(50);
    
    // Mock ERC20 ABI (simplified)
    return [
      {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
      {
        name: 'decimals',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
      },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MOCK NETWORK API
// ============================================================================

class MockNetworkAPI implements NetworkAPI {
  private mockChainId = 11155111; // Sepolia testnet
  private mockBlockNumber = 5000000;
  private mockGasPrice = '25';

  getChainId(): number {
    return this.mockChainId;
  }

  async getBlockNumber(): Promise<number> {
    await this.delay(50);
    // Increment block number to simulate new blocks
    this.mockBlockNumber += Math.floor(Math.random() * 3);
    return this.mockBlockNumber;
  }

  async getGasPrice(): Promise<string> {
    await this.delay(50);
    // Vary gas price slightly
    const variation = Math.random() * 10 - 5;
    const gasPrice = parseFloat(this.mockGasPrice) + variation;
    return gasPrice.toFixed(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MOCK HTTP API
// ============================================================================

class MockHttpAPI implements HttpAPI {
  private whitelistedDomains = [
    'api.coingecko.com',
    'api.etherscan.io',
    'sepolia.etherscan.io',
  ];

  async get(url: string): Promise<{ data: unknown; status: number }> {
    if (!this.isWhitelisted(url)) {
      throw new Error(`URL not whitelisted: ${url}`);
    }

    await this.delay(200);

    // Mock CoinGecko price API
    if (url.includes('coingecko')) {
      return {
        data: {
          ethereum: {
            usd: 2000 + Math.random() * 100,
            usd_24h_change: Math.random() * 10 - 5,
          },
        },
        status: 200,
      };
    }

    // Mock Etherscan API
    if (url.includes('etherscan')) {
      return {
        data: {
          status: '1',
          message: 'OK',
          result: '1500000000000000000', // 1.5 ETH in wei
        },
        status: 200,
      };
    }

    return {
      data: { message: 'Mock response' },
      status: 200,
    };
  }

  isWhitelisted(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.whitelistedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MOCK STORAGE API
// ============================================================================

class MockStorageAPI implements StorageAPI {
  private storage = new Map<string, unknown>();

  async get(key: string): Promise<unknown | null> {
    await this.delay(10);
    return this.storage.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.delay(10);
    
    // Validate JSON-serializable
    try {
      JSON.stringify(value);
      this.storage.set(key, value);
    } catch (error) {
      throw new Error(`Value for key "${key}" must be JSON-serializable`);
    }
  }

  async remove(key: string): Promise<void> {
    await this.delay(10);
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    await this.delay(10);
    this.storage.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// MOCK API CONTEXT FACTORY
// ============================================================================

/**
 * Create a mock API context for Lua scripts
 * 
 * Phase 0.2: Uses mocks for PoC validation
 * Phase 3: Replace with real implementations
 */
export function createMockLuaAPIContext(): LuaAPIContext {
  return {
    wallet: new MockWalletAPI(),
    contract: new MockContractAPI(),
    network: new MockNetworkAPI(),
    http: new MockHttpAPI(),
    storage: new MockStorageAPI(),
  };
}

/**
 * Get serializable API data for Lua context
 * 
 * Phase 0.2: Returns mock data that can be safely sent to worker
 * Note: Functions cannot be sent via postMessage, so we return static data
 * and let the worker register the actual API functions using wasmoon
 */
export function getSerializableAPIData(context: LuaAPIContext): Record<string, unknown> {
  // For now, just return static/sync data that Lua can access
  // Async operations will be implemented via RPC in Phase 0.3
  return {
    wallet: {
      address: context.wallet.getAddress(),
      network: context.wallet.getNetwork(),
    },
    network: {
      chainId: context.network.getChainId(),
    },
    // Note: Async API calls (getBalance, contract.read, etc.) 
    // will be implemented via message passing in future iterations
  };
}

/**
 * Prepare API context with actual function implementations
 * 
 * This version keeps functions in the main thread context
 * Use this when NOT sending to a worker
 */
export function prepareAPIForLua(context: LuaAPIContext): Record<string, unknown> {
  return {
    wallet: {
      getAddress: () => context.wallet.getAddress(),
      getBalance: async () => await context.wallet.getBalance(),
      getNetwork: () => context.wallet.getNetwork(),
      getTokenBalance: async (addr: string) => await context.wallet.getTokenBalance(addr),
    },
    contract: {
      read: async (addr: string, method: string, args: unknown[]) => 
        await context.contract.read(addr, method, args),
      getABI: async (addr: string) => await context.contract.getABI(addr),
    },
    network: {
      getChainId: () => context.network.getChainId(),
      getBlockNumber: async () => await context.network.getBlockNumber(),
      getGasPrice: async () => await context.network.getGasPrice(),
    },
    http: {
      get: async (url: string) => await context.http.get(url),
      isWhitelisted: (url: string) => context.http.isWhitelisted(url),
    },
    storage: {
      get: async (key: string) => await context.storage.get(key),
      set: async (key: string, value: unknown) => await context.storage.set(key, value),
      remove: async (key: string) => await context.storage.remove(key),
      clear: async () => await context.storage.clear(),
    },
  };
}
