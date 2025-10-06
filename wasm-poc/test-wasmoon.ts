/**
 * Wasmoon Tests
 * Testing Lua 5.4 compiled to WASM
 */

import { LuaFactory } from 'wasmoon';
import { recordTest } from './test-harness';

async function testWasmoon() {
  console.log('\n🧪 Testing Wasmoon...\n');

  // Test 1: Basic Execution
  await recordTest('Wasmoon', 'Basic Execution', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const result = await lua.doString('return 2 + 2');
      if (result !== 4) throw new Error(`Expected 4, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 2: String Manipulation
  await recordTest('Wasmoon', 'String Manipulation', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const result = await lua.doString('return string.upper("hello world")');
      if (result !== 'HELLO WORLD') throw new Error(`Expected HELLO WORLD, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 3: Table Operations
  await recordTest('Wasmoon', 'Table Operations', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const code = `
        local t = {1, 2, 3, 4, 5}
        local sum = 0
        for i, v in ipairs(t) do
          sum = sum + v
        end
        return sum
      `;
      const result = await lua.doString(code);
      if (result !== 15) throw new Error(`Expected 15, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 4: Loop Performance (1000 iterations)
  await recordTest('Wasmoon', 'Loop Performance (1000 iterations)', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const code = `
        local sum = 0
        for i = 1, 1000 do
          sum = sum + i
        end
        return sum
      `;
      const result = await lua.doString(code);
      if (result !== 500500) throw new Error(`Expected 500500, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 5: Error Handling
  await recordTest('Wasmoon', 'Error Handling', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const code = 'error("This is a test error")';
      await lua.doString(code);
      throw new Error('Should have thrown an error');
    } catch (e: unknown) {
      const error = e as Error;
      if (!error.message.includes('test error')) {
        throw new Error('Error message not clear');
      }
    } finally {
      lua.global.close();
    }
  });

  // Test 6: JS Interop - Call JS from Lua
  await recordTest('Wasmoon', 'JS Interop (Lua calls JS)', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      // Set a JS function that Lua can call
      lua.global.set('double', (x: number) => x * 2);

      const result = await lua.doString('return double(21)');
      if (result !== 42) throw new Error(`Expected 42, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 7: Complex Data Structures
  await recordTest('Wasmoon', 'Complex Data Structures', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const code = `
        local wallet = {
          address = "0x1234567890abcdef",
          balance = 1.5,
          tokens = {
            {name = "USDC", balance = 100},
            {name = "DAI", balance = 50}
          }
        }
        return wallet.balance + wallet.tokens[1].balance
      `;
      const result = await lua.doString(code);
      if (result !== 101.5) throw new Error(`Expected 101.5, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 8: Memory Intensive Task
  await recordTest('Wasmoon', 'Memory Intensive (10000 table entries)', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      const code = `
        local data = {}
        for i = 1, 10000 do
          data[i] = {
            id = i,
            value = "item_" .. i,
            balance = math.random(1000000)
          }
        end
        return #data
      `;
      const result = await lua.doString(code);
      if (result !== 10000) throw new Error(`Expected 10000, got ${result}`);
    } finally {
      lua.global.close();
    }
  });

  // Test 9: Async Operations
  await recordTest('Wasmoon', 'Async Operations', async () => {
    const factory = new LuaFactory();
    const lua = await factory.createEngine();

    try {
      // Set an async JS function
      lua.global.set('asyncFetch', async (url: string) => {
        // Simulate API call
        return new Promise((resolve) => {
          setTimeout(() => resolve(`Data from ${url}`), 10);
        });
      });

      const code = `
        local data = asyncFetch("https://api.example.com")
        return data
      `;
      const result = await lua.doString(code);
      if (!result || typeof result !== 'string' || !result.includes('example.com')) {
        throw new Error(`Expected async result, got ${result}`);
      }
    } finally {
      lua.global.close();
    }
  });

  // Test 10: Multiple Concurrent Engines
  await recordTest('Wasmoon', 'Multiple Concurrent Engines', async () => {
    const factory = new LuaFactory();
    const engines = await Promise.all([
      factory.createEngine(),
      factory.createEngine(),
      factory.createEngine(),
    ]);

    try {
      const results = await Promise.all(
        engines.map((lua, i) => lua.doString(`return ${i + 1} * 10`))
      );

      if (results[0] !== 10 || results[1] !== 20 || results[2] !== 30) {
        throw new Error('Concurrent engines failed');
      }
    } finally {
      engines.forEach((lua) => lua.global.close());
    }
  });
}

export { testWasmoon };
