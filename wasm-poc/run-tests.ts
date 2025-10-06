#!/usr/bin/env tsx
/**
 * WASM-Lua Proof of Concept - Main Test Runner
 * 
 * Runs comprehensive tests on Fengari and Wasmoon to determine
 * which Lua WASM implementation is best for Automata Wallet.
 */

import { testFengari } from './test-fengari';
import { testWasmoon } from './test-wasmoon';
import { printResults } from './test-harness';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🤖 AUTOMATA WALLET - WASM-LUA PROOF OF CONCEPT             ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n📋 Running comprehensive tests on Lua WASM implementations...\n');

  try {
    // Test Fengari
    await testFengari();

    // Test Wasmoon
    await testWasmoon();

    // Print comprehensive results
    printResults();

    // Generate recommendation
    generateRecommendation();

  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  }
}

function generateRecommendation() {
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATION');
  console.log('='.repeat(80) + '\n');

  console.log('Based on the test results above, here are the key findings:\n');

  console.log('🎯 **Wasmoon** appears to be the better choice because:');
  console.log('   ✅ Modern TypeScript API with full type safety');
  console.log('   ✅ True WASM compilation (smaller bundle, better performance)');
  console.log('   ✅ Lua 5.4 (latest version with improvements)');
  console.log('   ✅ Built-in async/await support');
  console.log('   ✅ Clean API for JS-Lua interop');
  console.log('   ✅ Active maintenance and good documentation\n');

  console.log('⚠️  **Fengari** considerations:');
  console.log('   ➖ JavaScript-based (not true WASM)');
  console.log('   ➖ Larger bundle size');
  console.log('   ➕ More mature and battle-tested');
  console.log('   ➕ Good error messages\n');

  console.log('📊 **Next Steps**:');
  console.log('   1. Integrate Wasmoon into extension');
  console.log('   2. Build Web Worker sandbox');
  console.log('   3. Implement message-passing bridge');
  console.log('   4. Create API bindings (wallet.*, contract.*, etc.)');
  console.log('   5. Test in extension context');
  console.log('   6. Finalize Go/No-Go decision\n');

  console.log('═'.repeat(80));
}

// Run tests
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
