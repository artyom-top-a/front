import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface AccountVerificationEmailProps {
  userName?: string;
  verificationLink: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http:localhost:3000";

export const AccountVerificationEmail = ({
  userName,
  verificationLink,
}: AccountVerificationEmailProps) => {
  const previewText = `Verify your email for GStudy`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          <Img
                src={`https://res.cloudinary.com/dehmpfffb/image/upload/v1736704613/logo_o5ebid.png`}
                width="48"
                height="48"
                alt="GStudy Icon"
                className="my-0 mx-auto"
              />
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[28px] mx-0">
              Welcome, <strong>{userName}</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for signing up for <strong>GStudy</strong>! Please verify your email to complete your account setup.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#6127FF] rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
                href={verificationLink}
              >
                Verify your email
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:
              <Link
                href={verificationLink}
                className="text-blue-600 no-underline"
              >
                {verificationLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you did not create this account, you can safely ignore this email. For any concerns, feel free to contact our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AccountVerificationEmail;

AccountVerificationEmail.PreviewProps = {
  userName: "John Doe",
  verificationLink: "https://example.com/verify-email",
} as AccountVerificationEmailProps;

