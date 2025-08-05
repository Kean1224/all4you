'use client';

export default function EnvDebugPage() {
  const envVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Current Environment Variables:</h2>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="font-semibold text-yellow-800 mb-2">Expected Values:</h2>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto">
{`{
  "NEXT_PUBLIC_API_URL": "https://api.all4youauctions.co.za",
  "NEXT_PUBLIC_BACKEND_URL": "https://api.all4youauctions.co.za",
  "NEXT_PUBLIC_BASE_URL": "https://all4youauctions.co.za",
  "NODE_ENV": "production"
}`}
            </pre>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800 mb-2">Quick Test:</h2>
            <button 
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'NOT_SET';
                alert(`API URL being used: ${apiUrl}`);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Check API URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
