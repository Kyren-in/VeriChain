import dotenv from 'dotenv';
dotenv.config();

export async function sendEmail({ to, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@verichain.org';

  if (!apiKey || apiKey === 'your-brevo-api-key') {
    console.log(`[Brevo Email Simulation] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: 'VeriChain Identity Platform', email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Brevo API Error:', err);
    return { success: false, error: err.message };
  }
}
