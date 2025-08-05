'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [apiStatus, setApiStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);
  const [frontendUrl, setFrontendUrl] = useState('Loading...');

  useEffect(() => {
    // Set client-side only values
    if (typeof window !== 'undefined') {
      setFrontendUrl(window.location.origin);
    }
  }, []);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ping`);
      if (response.ok) {
        const data = await response.text();
        setApiStatus(`✅ API Working: ${data}`);
      } else {
        setApiStatus(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus(`❌ Network Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Frontend URL:</strong> {frontendUrl}
          </div>
          <div>
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
          </div>
          <div>
            <strong>Status:</strong> {apiStatus}
          </div>
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}
