/**
 * Fengari Tests
 * Testing Lua VM implemented in JavaScript
 */

import { recordTest } from './test-harness';

const fengari = require('fengari-web');
const { lua, lauxlib, lualib } = fengari;

async function testFengari() {
  console.log('\n🧪 Testing Fengari...\n');

  // Test 1: Basic Execution
  await recordTest('Fengari', 'Basic Execution', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const code = 'return 2 + 2';
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 4) throw new Error(`Expected 4, got ${result}`);
  });

  // Test 2: String Manipulation
  await recordTest('Fengari', 'String Manipulation', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const code = 'return string.upper("hello world")';
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = fengari.to_jsstring(lua.lua_tostring(L, -1));

    if (result !== 'HELLO WORLD') throw new Error(`Expected HELLO WORLD, got ${result}`);
  });

  // Test 3: Table Operations
  await recordTest('Fengari', 'Table Operations', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const code = `
      local t = {1, 2, 3, 4, 5}
      local sum = 0
      for i, v in ipairs(t) do
        sum = sum + v
      end
      return sum
    `;
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 15) throw new Error(`Expected 15, got ${result}`);
  });

  // Test 4: Loop Performance (1000 iterations)
  await recordTest('Fengari', 'Loop Performance (1000 iterations)', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const code = `
      local sum = 0
      for i = 1, 1000 do
        sum = sum + i
      end
      return sum
    `;
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 500500) throw new Error(`Expected 500500, got ${result}`);
  });

  // Test 5: Error Handling
  await recordTest('Fengari', 'Error Handling', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const code = 'error("This is a test error")';
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));

    try {
      lua.lua_call(L, 0, 0);
      throw new Error('Should have thrown an error');
    } catch (e) {
      // Expected error
      if (!e.message.includes('test error')) {
        throw new Error('Error message not clear');
      }
    }
  });

  // Test 6: JS Interop - Call JS from Lua
  await recordTest('Fengari', 'JS Interop (Lua calls JS)', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    // Push a JS function to Lua
    lua.lua_pushjsfunction(L, (L: any) => {
      const arg = lua.lua_tonumber(L, 1);
      lua.lua_pushnumber(L, arg * 2);
      return 1;
    });
    lua.lua_setglobal(L, fengari.to_luastring('double'));

    const code = 'return double(21)';
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 42) throw new Error(`Expected 42, got ${result}`);
  });

  // Test 7: Complex Data Structures
  await recordTest('Fengari', 'Complex Data Structures', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

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
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 101.5) throw new Error(`Expected 101.5, got ${result}`);
  });

  // Test 8: Memory Intensive Task
  await recordTest('Fengari', 'Memory Intensive (10000 table entries)', () => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

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
    lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
    lua.lua_call(L, 0, 1);
    const result = lua.lua_tonumber(L, -1);

    if (result !== 10000) throw new Error(`Expected 10000, got ${result}`);
  });
}

export { testFengari };
