"use client";
import { useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  async function captureImageAndLocation() {
    try {
      // -------- CAMERA --------
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      const video = videoRef.current!;
      video.srcObject = stream;

      await new Promise(resolve => {
        video.onloadedmetadata = () => resolve(true);
      });

      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl);

      stream.getTracks().forEach(t => t.stop());

      // -------- LOCATION --------
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        err => {
          console.error("Location error:", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      );
    } catch (err) {
      console.error("Camera error:", err);
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <button onClick={captureImageAndLocation}>
        Capture Image & Location
      </button>

      {/* Camera must NOT be display:none */}
      <video
        ref={videoRef}
        playsInline
        style={{ width: 1, height: 1, opacity: 0 }}
      />

      {image && (
        <div style={{ marginTop: 20 }}>
          <img src={image} alt="captured" width={200} />
        </div>
      )}

      {location && (
        <div style={{ marginTop: 10 }}>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lon}</p>
        </div>
      )}
    </div>
  );
}
