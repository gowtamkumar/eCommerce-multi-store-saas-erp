"use client";

import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";

export default function TestConnectionPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/home")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>

      {loading && <p>Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {data && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Connection Successful!</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded shadow">
              <h3 className="font-medium text-gray-500">Products Found</h3>
              <p className="text-2xl font-bold">{data.products?.length || 0}</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <h3 className="font-medium text-gray-500">Testimonials Found</h3>
              <p className="text-2xl font-bold">{data.testimonials?.length || 0}</p>
            </div>
          </div>
          <details>
            <summary className="cursor-pointer text-blue-600 hover:underline">View Raw JSON</summary>
            <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 overflow-auto max-h-96 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
