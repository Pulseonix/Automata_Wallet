/**
 * Lua API Integration Tests
 * 
 * Tests the bidirectional communication between TypeScript and Lua
 * using the mock API implementations.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LuaSandbox } from '../lib/lua-sandbox';

describe('Lua API Integration', () => {
  let sandbox: LuaSandbox;

  beforeAll(() => {
    sandbox = new LuaSandbox();
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(() => {
    sandbox.destroy();
  });

  describe('Wallet API', () => {
    it('should get wallet address', async () => {
      const result = await sandbox.execute<string>('return wallet.getAddress()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toMatch(/^0x[a-fA-F0-9]+$/);
        expect(result.result.length).toBeGreaterThan(10);
      }
    });

    it('should get wallet balance', async () => {
      const result = await sandbox.execute<string>('return wallet.getBalance()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe('1.5');
      }
    });

    it('should get network name', async () => {
      const result = await sandbox.execute<string>('return wallet.getNetwork()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe('sepolia');
      }
    });

    it('should get token balance', async () => {
      const code = `
        local usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        return wallet.getTokenBalance(usdc)
      `;
      
      const result = await sandbox.execute<string>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe('1000.50');
      }
    });
  });

  describe('Contract API', () => {
    it('should read from contract', async () => {
      const code = `
        local usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        return contract.read(usdcAddress, "balanceOf", {wallet.getAddress()})
      `;
      
      const result = await sandbox.execute<string>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe('1000000000');
      }
    });

    it('should get contract decimals', async () => {
      const code = `
        local tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        return contract.read(tokenAddress, "decimals", {})
      `;
      
      const result = await sandbox.execute<number>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe(6);
      }
    });
  });

  describe('Network API', () => {
    it('should get chain ID', async () => {
      const result = await sandbox.execute<number>('return network.getChainId()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe(11155111); // Sepolia
      }
    });

    it('should get block number', async () => {
      const result = await sandbox.execute<number>('return network.getBlockNumber()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeGreaterThan(0);
      }
    });

    it('should get gas price', async () => {
      const result = await sandbox.execute<string>('return network.getGasPrice()');
      
      expect(result.success).toBe(true);
      if (result.success) {
        const gasPrice = parseFloat(result.result);
        expect(gasPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('HTTP API', () => {
    it('should fetch from whitelisted URL', async () => {
      const code = `
        local response = http.get("https://api.coingecko.com/api/v3/simple/price")
        return response.data.ethereum.usd
      `;
      
      const result = await sandbox.execute<number>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeGreaterThan(0);
      }
    });

    it('should check if URL is whitelisted', async () => {
      const code = `
        local allowed = http.isWhitelisted("https://api.coingecko.com/test")
        local blocked = http.isWhitelisted("https://evil.com/test")
        return {allowed = allowed, blocked = blocked}
      `;
      
      const result = await sandbox.execute<{ allowed: boolean; blocked: boolean }>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.allowed).toBe(true);
        expect(result.result.blocked).toBe(false);
      }
    });
  });

  describe('Storage API', () => {
    it('should store and retrieve data', async () => {
      const code = `
        storage.set("testKey", "testValue")
        return storage.get("testKey")
      `;
      
      const result = await sandbox.execute<string>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe('testValue');
      }
    });

    it('should handle complex data structures', async () => {
      const code = `
        local data = {
          name = "Test",
          count = 42,
          items = {"a", "b", "c"}
        }
        storage.set("complexData", data)
        return storage.get("complexData")
      `;
      
      const result = await sandbox.execute<Record<string, unknown>>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toHaveProperty('name', 'Test');
        expect(result.result).toHaveProperty('count', 42);
      }
    });

    it('should remove stored data', async () => {
      const code = `
        storage.set("toRemove", "value")
        storage.remove("toRemove")
        return storage.get("toRemove")
      `;
      
      const result = await sandbox.execute(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeNull();
      }
    });
  });

  describe('Complex Wallet Scripts', () => {
    it('should calculate portfolio value', async () => {
      const code = `
        -- Get wallet data
        local address = wallet.getAddress()
        local ethBalance = tonumber(wallet.getBalance())
        local network = wallet.getNetwork()
        
        -- Get token balances
        local usdcBalance = tonumber(wallet.getTokenBalance(
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        ))
        
        -- Get prices (mock)
        local ethPrice = 2000
        local usdcPrice = 1
        
        -- Calculate portfolio
        local ethValue = ethBalance * ethPrice
        local usdcValue = usdcBalance * usdcPrice
        local totalValue = ethValue + usdcValue
        
        return {
          address = address,
          network = network,
          eth = ethBalance,
          usdc = usdcBalance,
          ethValue = ethValue,
          usdcValue = usdcValue,
          total = totalValue
        }
      `;
      
      const result = await sandbox.execute<{
        address: string;
        network: string;
        eth: number;
        usdc: number;
        ethValue: number;
        usdcValue: number;
        total: number;
      }>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.address).toMatch(/^0x/);
        expect(result.result.network).toBe('sepolia');
        expect(result.result.eth).toBe(1.5);
        expect(result.result.usdc).toBe(1000.50);
        expect(result.result.total).toBe(4000.50); // 1.5*2000 + 1000.50*1
      }
    });

    it('should monitor contract events', async () => {
      const code = `
        -- Contract monitoring script
        local usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        
        -- Get current balance
        local balance = contract.read(usdcAddress, "balanceOf", {wallet.getAddress()})
        
        -- Get token info
        local symbol = contract.read(usdcAddress, "symbol", {})
        local decimals = contract.read(usdcAddress, "decimals", {})
        
        -- Calculate human-readable balance
        local readableBalance = tonumber(balance) / (10 ^ decimals)
        
        return {
          token = symbol,
          rawBalance = balance,
          balance = readableBalance,
          decimals = decimals
        }
      `;
      
      const result = await sandbox.execute<{
        token: string;
        rawBalance: string;
        balance: number;
        decimals: number;
      }>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.token).toBe('USDC');
        expect(result.result.decimals).toBe(6);
        expect(result.result.balance).toBe(1000); // 1000000000 / 10^6
      }
    });

    it('should handle errors gracefully', async () => {
      const code = `
        -- Try to access non-whitelisted URL
        local success, error = pcall(function()
          return http.get("https://evil.com/steal-keys")
        end)
        
        return {
          success = success,
          error = tostring(error)
        }
      `;
      
      const result = await sandbox.execute<{
        success: boolean;
        error: string;
      }>(code);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.success).toBe(false);
        expect(result.result.error).toContain('not whitelisted');
      }
    });
  });

  describe('API Execution Without APIs', () => {
    it('should execute without APIs when disabled', async () => {
      const result = await sandbox.execute<number>(
        'return 2 + 2',
        { includeAPIs: false }
      );
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe(4);
      }
    });

    it('should fail when trying to access wallet API with APIs disabled', async () => {
      const result = await sandbox.execute(
        'return wallet.getAddress()',
        { includeAPIs: false }
      );
      
      expect(result.success).toBe(false);
    });
  });
});
