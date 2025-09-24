'use client';

export default function SimpleDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Dashboard Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Content</h2>
          <p className="text-gray-600 mb-4">
            This is a simple dashboard page to test if the Client Component error persists.
          </p>
          
          <button 
            onClick={() => alert('Button clicked!')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
