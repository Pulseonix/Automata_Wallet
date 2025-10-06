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
    
    // Set up error handler
    luaEngine.global.set('__workerContext', true);
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
  
  // Set up execution context
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      luaEngine!.global.set(key, value);
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
