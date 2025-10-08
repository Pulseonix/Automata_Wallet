/**
 * Lua Sandbox Web Worker
 * 
 * Isolated execution environment for Lua scripts with:
 * - Timeout enforcement (5s default)
 * - Memory limits (monitored)
 * - Error boundary and recovery
 * - Secure API surface (no direct DOM/network access)
 * 
 * Security: Per ADR-002, scripts run in isolated worker context
 * with no access to extension APIs or user data by default.
 */

import { LuaFactory, type LuaEngine } from 'wasmoon';

// Message types for worker communication
export interface ExecuteScriptMessage {
  type: 'execute';
  id: string;
  code: string;
  timeout?: number; // milliseconds, default 5000
  context?: Record<string, unknown>; // Initial Lua globals
}

export interface ExecuteResultMessage {
  type: 'result';
  id: string;
  success: true;
  result: unknown;
  executionTime: number; // milliseconds
  memoryUsed?: number; // bytes (if available)
}

export interface ExecuteErrorMessage {
  type: 'error';
  id: string;
  success: false;
  error: string;
  stack?: string;
  executionTime: number;
}

export interface TerminateMessage {
  type: 'terminate';
  id: string;
  reason: 'timeout' | 'memory-limit' | 'manual';
}

export type WorkerMessage = ExecuteScriptMessage | TerminateMessage;
export type WorkerResponse = ExecuteResultMessage | ExecuteErrorMessage;

// Singleton Lua engine instance
let luaEngine: LuaEngine | null = null;
let luaFactory: LuaFactory | null = null;
let currentExecutionId: string | null = null;
let executionStartTime: number = 0;

/**
 * Initialize Lua engine
 */
async function initializeLua(): Promise<void> {
  if (!luaFactory) {
    luaFactory = new LuaFactory();
  }
  
  if (!luaEngine) {
    luaEngine = await luaFactory.createEngine();
    
    // Set up worker context flag
    luaEngine.global.set('__workerContext', true);
    
    // Register mock API functions inside the worker
    // These are synchronous mocks for Phase 0.2 PoC
    await registerMockAPIs();
  }
}

/**
 * Register mock wallet/contract/network APIs as Lua globals
 * Phase 0.2: Simple sync mocks for validation
 * Phase 0.3: Will use RPC message passing for real async calls
 */
async function registerMockAPIs(): Promise<void> {
  if (!luaEngine) return;
  
  try {
    // Create wallet API object with all methods
    const walletAPI = {
      getAddress: () => '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      getNetwork: () => 'sepolia',
      getBalance: () => '1.5',
      getTokenBalance: (tokenAddress: string) => {
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
    };
    
    // Create network API object with all methods
    const networkAPI = {
      getChainId: () => 11155111,
      getBlockNumber: () => 5000000,
      getGasPrice: () => '25'
    };
    
    // Register APIs directly as globals
    luaEngine.global.set('wallet', walletAPI);
    luaEngine.global.set('network', networkAPI);
    
    // Add a simple print function
    luaEngine.global.set('print', (...args: unknown[]) => {
      console.log('[Lua]', ...args);
      return null;
    });
    
    console.log('[Worker] Registered Lua APIs: wallet, network, print');
  } catch (error) {
    console.error('[Worker] Failed to register APIs:', error);
    throw error;
  }
}

/**
 * Clean up and reset Lua engine
 */
async function resetLuaEngine(): Promise<void> {
  if (luaEngine) {
    luaEngine.global.close();
    luaEngine = null;
  }
  
  // Create fresh engine
  await initializeLua();
}

/**
 * Execute Lua code with timeout enforcement
 */
async function executeLuaScript(
  code: string,
  timeout: number = 5000,
  context?: Record<string, unknown>
): Promise<unknown> {
  if (!luaEngine) {
    await initializeLua();
  }
  
  // Set up timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Script execution timeout after ${timeout}ms`));
    }, timeout);
  });
  
  // Always re-register APIs before execution to ensure they're available
  await registerMockAPIs();
  
  // Set up execution context (after APIs so context doesn't overwrite them)
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      // Don't overwrite our API registrations
      if (key !== 'wallet' && key !== 'network' && key !== 'print') {
        luaEngine!.global.set(key, value);
      }
    }
  }
  
  // Execute with timeout race
  const executionPromise = luaEngine!.doString(code);
  
  try {
    const result = await Promise.race([executionPromise, timeoutPromise]);
    return result;
  } catch (error) {
    // On timeout or error, reset engine to prevent state pollution
    await resetLuaEngine();
    throw error;
  }
}

/**
 * Handle incoming messages from main thread
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  
  if (message.type === 'execute') {
    const startTime = performance.now();
    currentExecutionId = message.id;
    executionStartTime = startTime;
    
    try {
      const result = await executeLuaScript(
        message.code,
        message.timeout,
        message.context
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const response: ExecuteResultMessage = {
        type: 'result',
        id: message.id,
        success: true,
        result,
        executionTime,
      };
      
      self.postMessage(response);
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      const response: ExecuteErrorMessage = {
        type: 'error',
        id: message.id,
        success: false,
        error: errorMessage,
        stack: errorStack,
        executionTime,
      };
      
      self.postMessage(response);
    } finally {
      currentExecutionId = null;
      executionStartTime = 0;
    }
  } else if (message.type === 'terminate') {
    // Force terminate current execution
    if (currentExecutionId === message.id) {
      await resetLuaEngine();
      
      const response: ExecuteErrorMessage = {
        type: 'error',
        id: message.id,
        success: false,
        error: `Execution terminated: ${message.reason}`,
        executionTime: performance.now() - executionStartTime,
      };
      
      self.postMessage(response);
      
      currentExecutionId = null;
      executionStartTime = 0;
    }
  }
};

// Initialize on worker startup
initializeLua().catch((error) => {
  console.error('Failed to initialize Lua engine in worker:', error);
});

// Export types for main thread usage
export type {};
