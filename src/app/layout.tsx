import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";
import { ReactQueryProvider } from "@/react-query/provider";
import { ThemeProvider } from "@/components/theme";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../auth";

const montserrat = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap', // Improve performance with font swapping
});

export const metadata: Metadata = {
  // title: {
  //   default: "GStudy - Flashcards & Summaries 10x Quicker. Study Like a G!",
  //   template: "%s | GStudy",
  // },
  title: "GStudy - Flashcards & Summaries 10x Quicker. Study Like a G!.",
  description: "GStudy helps students generate flashcards, summaries, and AI-powered notes to boost productivity and streamline learning.",
  metadataBase: new URL("https://gstudy.pro"),
  keywords: [
    "study app",
    "flashcard generator",
    "AI notes",
    "study productivity tool",
    "online learning",
    "study assistant",
    "note-taking app"
  ],
  openGraph: {
    type: "website",
    url: "https://gstudy.pro",
    // title: "GStudy - Smarter Learning Platform",
    title: "GStudy - Flashcards & Summaries 10x Quicker. Study Like a G!",
    description: "Boost your productivity with AI-generated notes, flashcards, and summaries tailored for effective studying.",
    images: [
      {
        url: "/og-image.png", // Ensure you have an OG image in public folder
        width: 1200,
        height: 630,
        alt: "GStudy - Smarter Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // title: "GStudy - Smarter Learning Platform",
    title: "GStudy - Flashcards & Summaries 10x Quicker. Study Like a G!",
    description: "Boost your productivity with AI-generated notes, flashcards, and summaries tailored for effective studying.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="author" content="Artyom Antonenko" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="GStudy - Smarter Learning Platform" />
          <meta property="og:description" content="Boost your productivity with AI-generated notes, flashcards, and summaries tailored for effective studying." />
          <meta property="og:image" content="/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="GStudy - Smarter Learning Platform" />
          <meta name="twitter:description" content="Boost your productivity with AI-generated notes, flashcards, and summaries tailored for effective studying." />
          <meta name="twitter:image" content="/og-image.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
        </head>
        <body className={`${montserrat.className} bg-white dark:bg-black`}>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <ReactQueryProvider>
              {children}
              <Toaster />
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  )
}
