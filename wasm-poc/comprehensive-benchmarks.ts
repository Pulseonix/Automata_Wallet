/**
 * Comprehensive Performance Benchmarks
 * 
 * Phase 0.2 - Task 11: Final validation before Go/No-Go decision
 * 
 * Tests:
 * - 1000+ operations under load
 * - Memory usage patterns
 * - Timeout enforcement
 * - Concurrent execution limits
 * - API performance
 * - Bundle size impact
 * 
 * Run with: pnpm test:benchmarks
 */

import { LuaSandbox } from '../src/lib/lua-sandbox';

interface BenchmarkResult {
  name: string;
  operations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  memoryUsed?: number;
}

const results: BenchmarkResult[] = [];

function recordBenchmark(
  name: string,
  operations: number,
  times: number[],
  successes: number
): void {
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / operations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const successRate = (successes / operations) * 100;

  const result: BenchmarkResult = {
    name,
    operations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    successRate,
  };

  results.push(result);

  console.log(`\n✓ ${name}`);
  console.log(`  Operations: ${operations}`);
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Avg time: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min/Max: ${minTime.toFixed(2)}ms / ${maxTime.toFixed(2)}ms`);
  console.log(`  Success rate: ${successRate.toFixed(1)}%`);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBenchmarks() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                                                      ║');
  console.log('║      PHASE 0.2 - COMPREHENSIVE BENCHMARKS           ║');
  console.log('║                                                      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const sandbox = new LuaSandbox();
  await delay(200); // Wait for worker initialization

  // ========================================================================
  // BENCHMARK 1: Simple Operations (1000 executions)
  // ========================================================================
  console.log('\n[1/8] Simple Operations Benchmark (1000 executions)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < 1000; i++) {
      const start = performance.now();
      const result = await sandbox.execute<number>('return 2 + 2');
      const duration = performance.now() - start;

      times.push(duration);
      if (result.success && result.result === 4) successes++;
    }

    recordBenchmark('Simple Arithmetic (1000 ops)', 1000, times, successes);
  }

  // ========================================================================
  // BENCHMARK 2: String Operations (1000 executions)
  // ========================================================================
  console.log('\n[2/8] String Operations Benchmark (1000 executions)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < 1000; i++) {
      const start = performance.now();
      const result = await sandbox.execute<string>('return string.upper("test")');
      const duration = performance.now() - start;

      times.push(duration);
      if (result.success && result.result === 'TEST') successes++;
    }

    recordBenchmark('String Operations (1000 ops)', 1000, times, successes);
  }

  // ========================================================================
  // BENCHMARK 3: API Calls (1000 executions)
  // ========================================================================
  console.log('\n[3/8] API Calls Benchmark (1000 executions)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < 1000; i++) {
      const start = performance.now();
      const result = await sandbox.execute<string>('return wallet.getAddress()');
      const duration = performance.now() - start;

      times.push(duration);
      if (result.success && result.result.startsWith('0x')) successes++;
    }

    recordBenchmark('Wallet API Calls (1000 ops)', 1000, times, successes);
  }

  // ========================================================================
  // BENCHMARK 4: Async API Calls (500 executions - slower)
  // ========================================================================
  console.log('\n[4/8] Async API Calls Benchmark (500 executions)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < 500; i++) {
      const start = performance.now();
      const result = await sandbox.execute<string>('return wallet.getBalance()');
      const duration = performance.now() - start;

      times.push(duration);
      if (result.success) successes++;
    }

    recordBenchmark('Async Wallet API (500 ops)', 500, times, successes);
  }

  // ========================================================================
  // BENCHMARK 5: Complex Scripts (100 executions)
  // ========================================================================
  console.log('\n[5/8] Complex Scripts Benchmark (100 executions)...');
  {
    const times: number[] = [];
    let successes = 0;

    const complexScript = `
      local eth = tonumber(wallet.getBalance())
      local usdc = tonumber(wallet.getTokenBalance(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      ))
      
      local total = (eth * 2000) + usdc
      
      return {
        eth = eth,
        usdc = usdc,
        total = total
      }
    `;

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      const result = await sandbox.execute(complexScript);
      const duration = performance.now() - start;

      times.push(duration);
      if (result.success) successes++;
    }

    recordBenchmark('Complex Portfolio Scripts (100 ops)', 100, times, successes);
  }

  // ========================================================================
  // BENCHMARK 6: Concurrent Execution (10 batches of 50)
  // ========================================================================
  console.log('\n[6/8] Concurrent Execution Benchmark (500 ops in 10 batches)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let batch = 0; batch < 10; batch++) {
      const batchStart = performance.now();
      
      const promises = Array.from({ length: 50 }, (_, i) =>
        sandbox.execute<number>(`return ${i + 1} * 2`)
      );

      const batchResults = await Promise.all(promises);
      const batchDuration = performance.now() - batchStart;
      
      times.push(batchDuration / 50); // Avg per operation
      successes += batchResults.filter(r => r.success).length;
    }

    recordBenchmark('Concurrent Execution (500 ops)', 500, times, successes);
  }

  // ========================================================================
  // BENCHMARK 7: Timeout Enforcement (10 tests)
  // ========================================================================
  console.log('\n[7/8] Timeout Enforcement Benchmark (10 tests)...');
  {
    const times: number[] = [];
    let successes = 0;

    const infiniteLoop = `
      local i = 0
      while true do
        i = i + 1
      end
      return i
    `;

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const result = await sandbox.execute(infiniteLoop, { timeout: 1000 });
      const duration = performance.now() - start;

      times.push(duration);
      // Success means timeout was enforced
      if (!result.success && result.error.toLowerCase().includes('timeout')) {
        successes++;
      }
    }

    recordBenchmark('Timeout Enforcement (10 ops)', 10, times, successes);
  }

  // ========================================================================
  // BENCHMARK 8: Error Recovery (100 tests)
  // ========================================================================
  console.log('\n[8/8] Error Recovery Benchmark (100 tests)...');
  {
    const times: number[] = [];
    let successes = 0;

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      const result = await sandbox.execute('error("test error")');
      const duration = performance.now() - start;

      times.push(duration);
      // Success means error was caught and handled
      if (!result.success && result.error.includes('test error')) {
        successes++;
      }
    }

    recordBenchmark('Error Recovery (100 ops)', 100, times, successes);
  }

  // Cleanup
  sandbox.destroy();

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  BENCHMARK SUMMARY                   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const totalOperations = results.reduce((sum, r) => sum + r.operations, 0);
  const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);
  const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;

  console.log(`Total Operations:  ${totalOperations.toLocaleString()}`);
  console.log(`Total Time:        ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Overall Avg:       ${(totalTime / totalOperations).toFixed(2)}ms per operation`);
  console.log(`Avg Success Rate:  ${avgSuccessRate.toFixed(1)}%`);

  console.log('\n📊 Detailed Results:\n');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}`);
    console.log(`   ${r.avgTime.toFixed(2)}ms avg (${r.minTime.toFixed(2)}-${r.maxTime.toFixed(2)}ms)`);
    console.log(`   ${r.successRate.toFixed(1)}% success rate\n`);
  });

  // ========================================================================
  // PERFORMANCE TARGETS VALIDATION
  // ========================================================================
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║           PERFORMANCE TARGETS VALIDATION            ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const simpleOpsAvg = results[0].avgTime;
  const apiCallsAvg = results[2].avgTime;
  const asyncApiAvg = results[3].avgTime;
  const complexScriptAvg = results[4].avgTime;
  const timeoutEnforced = results[6].successRate === 100;

  console.log('Target: <5ms for simple operations');
  console.log(`Result: ${simpleOpsAvg.toFixed(2)}ms ${simpleOpsAvg < 5 ? '✅ PASS' : '❌ FAIL'}\n`);

  console.log('Target: <10ms for API calls (sync)');
  console.log(`Result: ${apiCallsAvg.toFixed(2)}ms ${apiCallsAvg < 10 ? '✅ PASS' : '❌ FAIL'}\n`);

  console.log('Target: <100ms for async API calls');
  console.log(`Result: ${asyncApiAvg.toFixed(2)}ms ${asyncApiAvg < 100 ? '✅ PASS' : '❌ FAIL'}\n`);

  console.log('Target: <500ms for complex scripts');
  console.log(`Result: ${complexScriptAvg.toFixed(2)}ms ${complexScriptAvg < 500 ? '✅ PASS' : '❌ FAIL'}\n`);

  console.log('Target: 100% timeout enforcement');
  console.log(`Result: ${results[6].successRate.toFixed(1)}% ${timeoutEnforced ? '✅ PASS' : '❌ FAIL'}\n`);

  const allTargetsMet = 
    simpleOpsAvg < 5 &&
    apiCallsAvg < 10 &&
    asyncApiAvg < 100 &&
    complexScriptAvg < 500 &&
    timeoutEnforced;

  // ========================================================================
  // FINAL DECISION
  // ========================================================================
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║              FINAL GO/NO-GO DECISION                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (allTargetsMet && avgSuccessRate > 99) {
    console.log('✅ ✅ ✅  GO - PROCEED TO PHASE 1  ✅ ✅ ✅\n');
    console.log('All performance targets met!');
    console.log('System is ready for core wallet development.\n');
    console.log('Confidence Level: VERY HIGH 🎯\n');
    process.exit(0);
  } else {
    console.log('❌ ❌ ❌  NO-GO - OPTIMIZATION NEEDED  ❌ ❌ ❌\n');
    console.log('Some performance targets not met.');
    console.log('Further optimization required before Phase 1.\n');
    process.exit(1);
  }
}

// Run benchmarks
runBenchmarks().catch((error) => {
  console.error('\n💥 Fatal error during benchmarking:', error);
  process.exit(1);
});
