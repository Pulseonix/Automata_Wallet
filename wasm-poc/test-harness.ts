/**
 * Lua WASM Proof of Concept - Test Harness
 * 
 * This file tests different Lua WASM implementations to determine
 * which one is best suited for Automata Wallet.
 */

import { performance } from 'perf_hooks';

// Test results interface
interface TestResult {
  engine: string;
  test: string;
  success: boolean;
  duration: number;
  memory?: number;
  error?: string;
  details?: string;
}

// Collection of all test results
const results: TestResult[] = [];

// Helper to record test results
function recordTest(
  engine: string,
  test: string,
  fn: () => Promise<any> | any
): Promise<TestResult> {
  return new Promise(async (resolve) => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      await fn();
      const duration = performance.now() - startTime;
      const memory = process.memoryUsage().heapUsed - startMemory;

      const result: TestResult = {
        engine,
        test,
        success: true,
        duration,
        memory,
      };

      results.push(result);
      console.log(`✅ ${engine} - ${test}: ${duration.toFixed(2)}ms`);
      resolve(result);
    } catch (error) {
      const duration = performance.now() - startTime;
      const result: TestResult = {
        engine,
        test,
        success: false,
        duration,
        error: (error as Error).message,
      };

      results.push(result);
      console.log(`❌ ${engine} - ${test}: ${(error as Error).message}`);
      resolve(result);
    }
  });
}

// Print formatted results
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('WASM-LUA PROOF OF CONCEPT RESULTS');
  console.log('='.repeat(80) + '\n');

  // Group by engine
  const engines = [...new Set(results.map((r) => r.engine))];

  engines.forEach((engine) => {
    console.log(`\n📊 ${engine}`);
    console.log('-'.repeat(80));

    const engineResults = results.filter((r) => r.engine === engine);
    const successCount = engineResults.filter((r) => r.success).length;
    const totalTime = engineResults.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Tests Passed: ${successCount}/${engineResults.length}`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log();

    engineResults.forEach((result) => {
      const icon = result.success ? '✅' : '❌';
      const time = `${result.duration.toFixed(2)}ms`;
      const memory = result.memory ? ` | ${(result.memory / 1024 / 1024).toFixed(2)}MB` : '';
      console.log(`  ${icon} ${result.test}: ${time}${memory}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80) + '\n');

  engines.forEach((engine) => {
    const engineResults = results.filter((r) => r.engine === engine);
    const successRate = (engineResults.filter((r) => r.success).length / engineResults.length) * 100;
    const avgTime = engineResults.reduce((sum, r) => sum + r.duration, 0) / engineResults.length;
    const totalMemory = engineResults.reduce((sum, r) => sum + (r.memory || 0), 0);

    console.log(`${engine}:`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Avg Time: ${avgTime.toFixed(2)}ms`);
    console.log(`  Total Memory: ${(totalMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log();
  });
}

// Export for use in test files
export { recordTest, printResults, TestResult };
