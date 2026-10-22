const { Resend } = require('resend');

const isProduction = process.env.NODE_ENV === 'production';

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else if (isProduction) {
  throw new Error('RESEND_API_KEY environment variable must be set in production');
} else {
  console.warn(
    'WARNING: RESEND_API_KEY is not set. Emails will be logged to the console instead of sent. ' +
    'Sign up at https://resend.com, create an API key, and set RESEND_API_KEY to send real email.'
  );
}

const FROM = process.env.EMAIL_FROM || 'Archery Tracker Kenya <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn('--- DEV MODE EMAIL (not actually sent — set RESEND_API_KEY to send real email) ---');
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.warn('--------------------------------------------------------------------------------');
    return { devMode: true };
  }

  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error('Resend send error:', error);
    throw new Error('Failed to send email');
  }
  return data;
}

module.exports = {
  sendEmail,
};
