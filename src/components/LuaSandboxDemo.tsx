/**
 * Lua Sandbox Demo Component
 * 
 * Interactive demo for testing Lua sandbox functionality.
 * Shows real-time execution, error handling, and performance metrics.
 */

import { useState } from 'react';
import { executeLua } from '../lib/lua-sandbox';
import type { ExecuteResponse } from '../lib/lua-sandbox';

const EXAMPLE_SCRIPTS = [
  {
    name: 'Simple Math',
    code: 'return 2 + 2',
  },
  {
    name: 'String Operations',
    code: 'return string.upper("hello world")',
  },
  {
    name: 'Loops & Tables',
    code: `local sum = 0
for i = 1, 100 do
  sum = sum + i
end
return sum`,
  },
  {
    name: 'Complex Data',
    code: `return {
  name = "Automata Wallet",
  version = "0.1.0",
  balance = 1.5,
  tokens = {"ETH", "USDC", "DAI"}
}`,
  },
  {
    name: 'Error Example',
    code: 'error("This is a test error")',
  },
];

export function LuaSandboxDemo() {
  const [code, setCode] = useState(EXAMPLE_SCRIPTS[0]?.code || 'return 2 + 2');
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setResult(null);

    try {
      const executeResult = await executeLua(code, { timeout: 5000 });
      setResult(executeResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode);
    setResult(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Lua Sandbox Demo</h1>
      <p className="text-gray-600 mb-6">
        Test Lua script execution in isolated Web Worker sandbox
      </p>

      {/* Example Scripts */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Quick Examples:
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SCRIPTS.map((example) => (
            <button
              key={example.name}
              onClick={() => loadExample(example.code)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Lua Code:</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-48 p-3 font-mono text-sm border rounded focus:ring-2 focus:ring-sky-500 focus:outline-none"
          placeholder="Enter Lua code here..."
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isExecuting || !code.trim()}
        className="px-6 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isExecuting ? 'Executing...' : 'Execute'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Results:</h2>

          {/* Execution Time */}
          <div className="mb-3 text-sm text-gray-600">
            Execution time: {result.executionTime.toFixed(2)}ms
          </div>

          {/* Success Result */}
          {result.success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-start">
                <span className="text-green-600 font-semibold mr-2">✓</span>
                <div className="flex-1">
                  <div className="font-semibold text-green-800 mb-1">
                    Success
                  </div>
                  <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                  {result.memoryUsed && (
                    <div className="mt-2 text-sm text-gray-600">
                      Memory used: {(result.memoryUsed / 1024).toFixed(2)} KB
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Error Result */
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-start">
                <span className="text-red-600 font-semibold mr-2">✗</span>
                <div className="flex-1">
                  <div className="font-semibold text-red-800 mb-1">Error</div>
                  <div className="text-sm text-red-700 mb-2">
                    {result.error}
                  </div>
                  {result.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-red-600">
                        Stack Trace
                      </summary>
                      <pre className="text-xs bg-white p-3 rounded border mt-2 overflow-x-auto">
                        {result.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Sandbox Features:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Isolated Web Worker execution</li>
          <li>✓ 5-second timeout enforcement</li>
          <li>✓ Memory limits (monitored)</li>
          <li>✓ Error recovery and clear error messages</li>
          <li>✓ No direct access to DOM or extension APIs</li>
          <li>✓ Lua 5.4 via Wasmoon (WASM-compiled)</li>
        </ul>
      </div>
    </div>
  );
}
