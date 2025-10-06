import { useState } from 'react';
import { LuaSandboxDemo } from '../components/LuaSandboxDemo';

function App() {
  const [showDemo, setShowDemo] = useState(false);

  if (showDemo) {
    return <LuaSandboxDemo />;
  }

  return (
    <div className="w-96 h-[600px] bg-white">
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-primary-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Automata Wallet
        </h1>
        
        <p className="text-gray-600 mb-8">
          Phase 0: Foundation & Technical Validation
        </p>
        
        <div className="space-y-4 w-full">
          <div className="card text-left">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Current Status</h3>
            <p className="text-sm text-gray-600">
              ✅ Project structure initialized<br />
              ✅ Wasmoon validation complete<br />
              🔨 Lua sandbox implementation<br />
              ⏳ Core wallet development pending
            </p>
          </div>
          
          <button
            onClick={() => setShowDemo(true)}
            className="w-full px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
          >
            🧪 Test Lua Sandbox
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Alpha Build:</strong> Not for production use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
