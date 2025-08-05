'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [apiStatus, setApiStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  const [debugInfo, setDebugInfo] = useState({
    envUrl: process.env.NEXT_PUBLIC_API_URL,
    actualUrl: '',
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: {}
  });

  useEffect(() => {
    // Get all NEXT_PUBLIC env vars for debugging
    const envVars: any = {};
    if (typeof window !== 'undefined') {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          envVars[key] = process.env[key];
        }
      });
    }
    setDebugInfo(prev => ({ ...prev, allEnvVars: envVars }));
  }, []);

  const testAPI = async () => {
    setLoading(true);
    const testUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullUrl = `${testUrl}/api/ping`;
    
    setDebugInfo(prev => ({ ...prev, actualUrl: fullUrl }));
    
    try {
      console.log('Testing URL:', fullUrl);
      
      // Test with timeout to detect hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.text();
        setApiStatus(`✅ API Working: ${data}`);
      } else {
        setApiStatus(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('API Test Error:', error);
      if (error.name === 'AbortError') {
        setApiStatus(`❌ Timeout Error: Request took longer than 10 seconds (backend may be sleeping)`);
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        setApiStatus(`❌ Network Error: Cannot reach backend - Check if backend is running`);
      } else {
        setApiStatus(`❌ Network Error: ${error.message}`);
      }
    }
    setLoading(false);
  };

  const testMultipleBackends = async () => {
    setLoading(true);
    const backendUrls = [
      'https://api.all4youauctions.co.za',
      'https://all4you-backend.onrender.com',
      'http://localhost:5000'
    ];
    
    const results: {[key: string]: string} = {};
    
    for (const url of backendUrls) {
      try {
        console.log(`Testing: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${url}/api/ping`, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.text();
          results[url] = `✅ ${response.status} - ${data}`;
        } else {
          results[url] = `❌ ${response.status} - ${response.statusText}`;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          results[url] = '⏱️ Timeout (8s) - Backend may be sleeping';
        } else {
          results[url] = `❌ ${error.message}`;
        }
      }
    }
    
    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Environment:</strong> {debugInfo.nodeEnv || 'undefined'}</div>
              <div><strong>Configured API URL:</strong> {debugInfo.envUrl || 'undefined'}</div>
              <div><strong>Actual Test URL:</strong> {debugInfo.actualUrl || 'Not tested yet'}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">All Environment Variables:</h3>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify(debugInfo.allEnvVars, null, 2)}
            </pre>
          </div>

          <div>
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'UNDEFINED - Using fallback'}
          </div>
          <div>
            <strong>Status:</strong> {apiStatus}
          </div>
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 mb-2"
          >
            {loading ? 'Testing...' : 'Test Current API'}
          </button>
          
          <button
            onClick={testMultipleBackends}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing All...' : 'Test All Backend URLs'}
          </button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg mt-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Multi-Backend Test Results:</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(testResults).map(([url, result]) => (
                  <div key={url} className="break-all">
                    <strong>{url}:</strong> {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}