/**
 * Lua Sandbox Manager
 * 
 * Manages Web Worker lifecycle and provides safe API for executing Lua scripts.
 * Handles timeout enforcement, error recovery, and worker pool management.
 * 
 * Usage:
 * ```typescript
 * const sandbox = new LuaSandbox();
 * const result = await sandbox.execute('return 2 + 2', { timeout: 5000 });
 * ```
 */

import type {
  ExecuteScriptMessage,
  TerminateMessage,
  WorkerResponse,
} from '../workers/lua-sandbox.worker';
import { createMockLuaAPIContext, prepareAPIForLua } from './lua-api-mock';
import type { LuaAPIContext } from './lua-api-types';

export interface ExecuteOptions {
  timeout?: number; // milliseconds, default 5000
  context?: Record<string, unknown>; // Initial Lua globals
  includeAPIs?: boolean; // Include wallet/contract/network APIs (default: true)
}

export interface ExecuteResult<T = unknown> {
  success: true;
  result: T;
  executionTime: number;
  memoryUsed?: number;
}

export interface ExecuteError {
  success: false;
  error: string;
  stack?: string;
  executionTime: number;
}

export type ExecuteResponse<T = unknown> = ExecuteResult<T> | ExecuteError;

/**
 * Lua Sandbox Manager
 * 
 * Provides safe, isolated Lua script execution via Web Worker.
 */
export class LuaSandbox {
  private worker: Worker | null = null;
  private pendingExecutions = new Map<
    string,
    {
      resolve: (value: ExecuteResponse) => void;
      reject: (error: Error) => void;
      timeoutId?: ReturnType<typeof setTimeout>;
    }
  >();
  private executionCounter = 0;
  private isInitialized = false;

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize Web Worker
   */
  private initializeWorker(): void {
    try {
      // Vite will bundle this as a separate worker chunk
      this.worker = new Worker(
        new URL('../workers/lua-sandbox.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Lua sandbox worker error:', error);
        
        // Reject all pending executions
        for (const [id, pending] of this.pendingExecutions.entries()) {
          pending.reject(new Error('Worker crashed'));
          if (pending.timeoutId) {
            clearTimeout(pending.timeoutId);
          }
          this.pendingExecutions.delete(id);
        }
        
        // Attempt to restart worker
        this.restartWorker();
      };

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Lua sandbox worker:', error);
      throw new Error('Lua sandbox initialization failed');
    }
  }

  /**
   * Restart worker after crash
   */
  private restartWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isInitialized = false;
    this.initializeWorker();
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(message: WorkerResponse): void {
    const pending = this.pendingExecutions.get(message.id);
    
    if (!pending) {
      console.warn('Received response for unknown execution ID:', message.id);
      return;
    }

    // Clear timeout
    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    // Remove from pending
    this.pendingExecutions.delete(message.id);

    // Resolve with result or error
    if (message.success) {
      pending.resolve({
        success: true,
        result: message.result,
        executionTime: message.executionTime,
        memoryUsed: message.memoryUsed,
      });
    } else {
      pending.resolve({
        success: false,
        error: message.error,
        stack: message.stack,
        executionTime: message.executionTime,
      });
    }
  }

  /**
   * Execute Lua code in sandbox
   */
  async execute<T = unknown>(
    code: string,
    options: ExecuteOptions = {}
  ): Promise<ExecuteResponse<T>> {
    if (!this.isInitialized || !this.worker) {
      throw new Error('Lua sandbox not initialized');
    }

    const id = `exec-${++this.executionCounter}-${Date.now()}`;
    const timeout = options.timeout ?? 5000;
    const includeAPIs = options.includeAPIs ?? true;

    // Merge context with APIs if requested
    let context = options.context || {};
    if (includeAPIs) {
      const apiContext = createMockLuaAPIContext();
      const luaAPIs = prepareAPIForLua(apiContext);
      context = { ...luaAPIs, ...context };
    }

    return new Promise((resolve, reject) => {
      // Set up timeout handler (backup to worker timeout)
      const timeoutId = setTimeout(() => {
        this.pendingExecutions.delete(id);
        
        // Send terminate message to worker
        const terminateMessage: TerminateMessage = {
          type: 'terminate',
          id,
          reason: 'timeout',
        };
        this.worker?.postMessage(terminateMessage);
        
        resolve({
          success: false,
          error: `Execution timeout after ${timeout}ms`,
          executionTime: timeout,
        });
      }, timeout + 100); // Add buffer to worker timeout

      // Store pending execution
      this.pendingExecutions.set(id, {
        resolve: resolve as (value: ExecuteResponse) => void,
        reject,
        timeoutId,
      });

      // Send execute message to worker
      const message: ExecuteScriptMessage = {
        type: 'execute',
        id,
        code,
        timeout,
        context,
      };

      this.worker!.postMessage(message);
    });
  }

  /**
   * Terminate a specific execution by ID
   */
  terminate(executionId: string, reason: 'timeout' | 'memory-limit' | 'manual' = 'manual'): void {
    const pending = this.pendingExecutions.get(executionId);
    
    if (pending) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      
      this.pendingExecutions.delete(executionId);
      
      const terminateMessage: TerminateMessage = {
        type: 'terminate',
        id: executionId,
        reason,
      };
      
      this.worker?.postMessage(terminateMessage);
    }
  }

  /**
   * Clean up and terminate worker
   */
  destroy(): void {
    if (this.worker) {
      // Clear all pending executions
      for (const [id, pending] of this.pendingExecutions.entries()) {
        if (pending.timeoutId) {
          clearTimeout(pending.timeoutId);
        }
        pending.reject(new Error('Sandbox destroyed'));
        this.pendingExecutions.delete(id);
      }
      
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if sandbox is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }

  /**
   * Get number of pending executions
   */
  getPendingCount(): number {
    return this.pendingExecutions.size;
  }
}

// Singleton instance for convenience
let defaultSandbox: LuaSandbox | null = null;

/**
 * Get default sandbox instance
 */
export function getDefaultSandbox(): LuaSandbox {
  if (!defaultSandbox) {
    defaultSandbox = new LuaSandbox();
  }
  return defaultSandbox;
}

/**
 * Execute Lua code in default sandbox (convenience function)
 */
export async function executeLua<T = unknown>(
  code: string,
  options?: ExecuteOptions
): Promise<ExecuteResponse<T>> {
  return getDefaultSandbox().execute<T>(code, options);
}
