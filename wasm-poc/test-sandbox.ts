/**
 * Sandbox PoC Validation Script
 * 
 * Tests the complete sandbox implementation:
 * - Worker initialization
 * - Script execution
 * - Timeout enforcement
 * - Error handling
 * - Performance metrics
 * 
 * Run with: pnpm test:sandbox
 */

import { LuaSandbox } from '../src/lib/lua-sandbox';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, duration: number, error?: string) {
  results.push({ name, passed, duration, error });
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name} (${duration.toFixed(2)}ms)`);
  if (error) {
    console.log(`  Error: ${error}`);
  }
}

async function runTests() {
  console.log('\n🧪 Lua Sandbox PoC Validation\n');
  console.log('Testing Web Worker integration with Wasmoon...\n');

  const sandbox = new LuaSandbox();
  
  // Wait for worker to initialize
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test 1: Basic initialization
  try {
    const start = performance.now();
    const isReady = sandbox.isReady();
    const duration = performance.now() - start;
    recordTest('Sandbox initialization', isReady, duration);
  } catch (error) {
    recordTest('Sandbox initialization', false, 0, String(error));
  }

  // Test 2: Simple arithmetic
  try {
    const start = performance.now();
    const result = await sandbox.execute<number>('return 2 + 2');
    const duration = performance.now() - start;
    const passed = result.success && result.result === 4;
    recordTest('Basic arithmetic (2+2)', passed, duration);
  } catch (error) {
    recordTest('Basic arithmetic (2+2)', false, 0, String(error));
  }

  // Test 3: String operations
  try {
    const start = performance.now();
    const result = await sandbox.execute<string>('return string.upper("hello")');
    const duration = performance.now() - start;
    const passed = result.success && result.result === 'HELLO';
    recordTest('String manipulation', passed, duration);
  } catch (error) {
    recordTest('String manipulation', false, 0, String(error));
  }

  // Test 4: Loops (performance test)
  try {
    const start = performance.now();
    const code = `
      local sum = 0
      for i = 1, 10000 do
        sum = sum + i
      end
      return sum
    `;
    const result = await sandbox.execute<number>(code);
    const duration = performance.now() - start;
    const passed = result.success && result.result === 50005000;
    recordTest('Loop performance (10k iterations)', passed, duration);
  } catch (error) {
    recordTest('Loop performance (10k iterations)', false, 0, String(error));
  }

  // Test 5: Context passing
  try {
    const start = performance.now();
    const result = await sandbox.execute<string>(
      'return name .. " is " .. status',
      {
        context: {
          name: 'Automata',
          status: 'active',
        },
      }
    );
    const duration = performance.now() - start;
    const passed = result.success && result.result === 'Automata is active';
    recordTest('Context variable passing', passed, duration);
  } catch (error) {
    recordTest('Context variable passing', false, 0, String(error));
  }

  // Test 6: Error handling
  try {
    const start = performance.now();
    const result = await sandbox.execute('error("Test error")');
    const duration = performance.now() - start;
    const passed = !result.success && result.error.includes('Test error');
    recordTest('Error handling', passed, duration);
  } catch (error) {
    recordTest('Error handling', false, 0, String(error));
  }

  // Test 7: Complex data structures
  try {
    const start = performance.now();
    const code = `
      return {
        wallet = "0x1234",
        balance = 1.5,
        tokens = {"ETH", "USDC"},
        meta = { version = "0.1.0" }
      }
    `;
    const result = await sandbox.execute<Record<string, unknown>>(code);
    const duration = performance.now() - start;
    const passed = result.success && 
      result.result.wallet === '0x1234' &&
      result.result.balance === 1.5;
    recordTest('Complex data structures', passed, duration);
  } catch (error) {
    recordTest('Complex data structures', false, 0, String(error));
  }

  // Test 8: Concurrent execution
  try {
    const start = performance.now();
    const promises = [
      sandbox.execute<number>('return 1 * 2'),
      sandbox.execute<number>('return 2 * 2'),
      sandbox.execute<number>('return 3 * 2'),
      sandbox.execute<number>('return 4 * 2'),
      sandbox.execute<number>('return 5 * 2'),
    ];
    const results = await Promise.all(promises);
    const duration = performance.now() - start;
    const passed = results.every((r: any, i: number) => r.success && r.result === (i + 1) * 2);
    recordTest('Concurrent execution (5 scripts)', passed, duration);
  } catch (error) {
    recordTest('Concurrent execution (5 scripts)', false, 0, String(error));
  }

  // Test 9: Timeout enforcement (this will take ~1 second)
  try {
    const start = performance.now();
    const code = `
      local i = 0
      while true do
        i = i + 1
      end
      return i
    `;
    const result = await sandbox.execute(code, { timeout: 1000 });
    const duration = performance.now() - start;
    const passed = !result.success && result.error.toLowerCase().includes('timeout');
    recordTest('Timeout enforcement (1s limit)', passed, duration);
  } catch (error) {
    recordTest('Timeout enforcement (1s limit)', false, 0, String(error));
  }

  // Test 10: Execution metrics
  try {
    const start = performance.now();
    const result = await sandbox.execute('return 42');
    const duration = performance.now() - start;
    const passed = result.success && 
      result.executionTime > 0 &&
      result.executionTime < 1000;
    recordTest('Execution time tracking', passed, duration);
  } catch (error) {
    recordTest('Execution time tracking', false, 0, String(error));
  }

  // Cleanup
  sandbox.destroy();

  // Print summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  console.log(`⏱️  Average execution time: ${avgDuration.toFixed(2)}ms`);
  
  if (passed === total) {
    console.log('\n✅ All tests passed! Sandbox is ready for production.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('\n💥 Fatal error during testing:', error);
  process.exit(1);
});
