import { render } from "@react-email/render";
import { Resend } from "resend";
import AccountVerificationEmail from "../../emails";
import PasswordRecoveryEmail from "../../emails/password-recovery";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Helper to get the sender email
const getSenderEmail = (): string => {
  const domain = process.env.NEXT_PUBLIC_APP_URL;
  if (domain) {
    // Extract the hostname from the URL (e.g., g-study.com)
    const hostname = new URL(domain).hostname;
    return `no-reply@${hostname}`;
  }
  // Default sender email if no domain is provided
  return "Acme <onboarding@resend.dev>";
};

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  const sender = getSenderEmail();

  await resend.emails.send({
    // from: "Acme <onboarding@resend.dev>",
    from: sender,
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`
  });
};

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  token: string,
) => {
  const sender = getSenderEmail();

  const resetLink = `${domain}/new-password?token=${token}`

  const emailHtml = await render(
    PasswordRecoveryEmail({userName: name, recoveryLink: resetLink })
  );

  await resend.emails.send({
    // from: "Acme <onboarding@resend.dev>",
    from: sender,
    to: email,
    subject: "Reset your password",
    html: emailHtml,
  });
};

export const sendVerificationEmail = async (
  name: string,
  email: string, 
  token: string
) => {
  const sender = getSenderEmail();

  const confirmLink = `${domain}/new-verification?token=${token}`;

  const emailHtml = await render(
    AccountVerificationEmail({userName: name, verificationLink: confirmLink })
  );


  await resend.emails.send({
    // from: "Acme <onboarding@resend.dev>",
    from: sender,
    to: email,
    subject: "Confirm your email",
    html: emailHtml,
  })
};