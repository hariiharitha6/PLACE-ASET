import { Resend } from 'resend';

let resend: Resend | null = null;

export function initEmail(): void {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  Resend API key not configured. Email sending disabled.');
    return;
  }
  resend = new Resend(apiKey);
  console.log('✅ Email service initialized');
}

export function getEmailClient(): Resend | null {
  return resend;
}
