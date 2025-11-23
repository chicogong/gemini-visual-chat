import React from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';

const App: React.FC = () => {
  // Normally this would be handled by a secure context or prompt, 
  // but per instructions we use process.env.API_KEY directly.
  const apiKey = process.env.API_KEY || '';

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-ag-bg text-red-500 flex items-center justify-center font-mono">
        <div className="text-center p-8 border border-red-900 bg-red-900/10 rounded max-w-md">
          <h2 className="text-xl font-bold mb-4">System Error</h2>
          <p>API Configuration Missing. Please verify 'process.env.API_KEY' is set in the environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ag-bg text-ag-text font-sans flex-col-reverse md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        <ChatInterface apiKey={apiKey} />
      </main>
    </div>
  );
};

export default App;