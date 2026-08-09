"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  timestamp: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Cairn — Pipeline Check</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!error && !health && <p>Checking backend health…</p>}
      {health && (
        <div>
          <p>Status: {health.status}</p>
          <p>Timestamp: {health.timestamp}</p>
        </div>
      )}
    </main>
  );
}
