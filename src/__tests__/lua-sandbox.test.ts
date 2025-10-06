/**
 * Lua Sandbox Integration Tests
 * 
 * Tests the Web Worker sandbox with Wasmoon integration:
 * - Basic execution
 * - Timeout enforcement
 * - Error handling
 * - Context passing
 * - Concurrent execution
 * - Worker recovery
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LuaSandbox, executeLua } from '../lib/lua-sandbox';

describe('Lua Sandbox', () => {
  let sandbox: LuaSandbox;

  beforeAll(() => {
    sandbox = new LuaSandbox();
    // Give worker time to initialize
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(() => {
    sandbox.destroy();
  });

  it('should initialize successfully', () => {
    expect(sandbox.isReady()).toBe(true);
  });

  it('should execute simple arithmetic', async () => {
    const result = await sandbox.execute<number>('return 2 + 2');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe(4);
      expect(result.executionTime).toBeLessThan(100);
    }
  });

  it('should execute string operations', async () => {
    const result = await sandbox.execute<string>('return string.upper("hello")');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe('HELLO');
    }
  });

  it('should handle loops and tables', async () => {
    const code = `
      local sum = 0
      for i = 1, 100 do
        sum = sum + i
      end
      return sum
    `;
    
    const result = await sandbox.execute<number>(code);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe(5050);
    }
  });

  it('should pass context variables', async () => {
    const result = await sandbox.execute<string>(
      'return greeting .. " " .. name .. "!"',
      {
        context: {
          greeting: 'Hello',
          name: 'Automata',
        },
      }
    );
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe('Hello Automata!');
    }
  });

  it('should handle runtime errors gracefully', async () => {
    const result = await sandbox.execute('error("Test error message")');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Test error message');
      expect(result.stack).toBeDefined();
    }
  });

  it('should handle syntax errors', async () => {
    const result = await sandbox.execute('return 2 +'); // Invalid syntax
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should enforce timeout limits', async () => {
    const code = `
      local i = 0
      while true do
        i = i + 1
      end
      return i
    `;
    
    const result = await sandbox.execute(code, { timeout: 1000 });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('timeout');
      expect(result.executionTime).toBeGreaterThanOrEqual(1000);
    }
  }, 10000); // Increase test timeout

  it('should handle concurrent executions', async () => {
    const promises = [
      sandbox.execute<number>('return 1 + 1'),
      sandbox.execute<number>('return 2 + 2'),
      sandbox.execute<number>('return 3 + 3'),
      sandbox.execute<number>('return 4 + 4'),
      sandbox.execute<number>('return 5 + 5'),
    ];
    
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(5);
    results.forEach((result, i) => {
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBe((i + 1) * 2);
      }
    });
  });

  it('should return complex data structures', async () => {
    const code = `
      return {
        name = "Automata Wallet",
        version = "0.1.0",
        features = {"scripting", "automation", "security"},
        metadata = {
          author = "Development Team",
          year = 2025
        }
      }
    `;
    
    const result = await sandbox.execute<Record<string, unknown>>(code);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toHaveProperty('name', 'Automata Wallet');
      expect(result.result).toHaveProperty('version', '0.1.0');
      expect(result.result.features).toEqual(['scripting', 'automation', 'security']);
    }
  });

  it('should track pending executions', async () => {
    expect(sandbox.getPendingCount()).toBe(0);
    
    const promise = sandbox.execute('return 42');
    
    // Pending count might be 1 during execution
    // but should return to 0 after completion
    await promise;
    
    expect(sandbox.getPendingCount()).toBe(0);
  });

  it('should provide execution time metrics', async () => {
    const result = await sandbox.execute('return 2 + 2');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(1000);
    }
  });
});

describe('executeLua convenience function', () => {
  it('should execute Lua code using default sandbox', async () => {
    const result = await executeLua<number>('return 10 * 10');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toBe(100);
    }
  });
});
