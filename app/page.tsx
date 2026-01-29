"use client";

export default function Home() {
  async function testPermissions() {
    alert("Button clicked");

    // LOCATION (simplest permission)
    navigator.geolocation.getCurrentPosition(
      pos => {
        alert(
          `Location OK: ${pos.coords.latitude}, ${pos.coords.longitude}`
        );
      },
      err => {
        alert("Location error: " + err.message);
      }
    );
  }

  return (
    <div style={{ padding: 50 }}>
      <button onClick={testPermissions}>
        Test Location Permission
      </button>
    </div>
  );
}
