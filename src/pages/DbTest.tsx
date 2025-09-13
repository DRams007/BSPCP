import React, { useEffect, useState } from 'react';
const DbTest: React.FC = () => {
  const [message, setMessage] = useState('Testing database connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/db-test');
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('API call error:', err);
        setError(`Failed to connect to API: ${(err as Error).message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Database Connection Test</h1>
      {error ? (
        <p className="text-red-600 text-lg">{error}</p>
      ) : (
        <p className="text-green-600 text-lg">{message}</p>
      )}
    </div>
  );
};

export default DbTest;
