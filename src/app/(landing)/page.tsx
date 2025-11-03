// import About from "@/components/landing/about";
import BlogSection from "@/components/landing/blog";
import CTA from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import PricingSection from "@/components/landing/pricing-seciton";
import { SaasDemo } from "@/components/landing/saas-demo";
import Testimonials from "@/components/landing/testimonials";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import Hero from "@/components/landing/hero";
import CookieConsent from "@/components/global/cookie-consent";
import dynamic from "next/dynamic";
import { Metadata } from "next";



const Hero = dynamic(() => import("@/components/landing/hero"));
const About = dynamic(() => import("@/components/landing/about"));


export const metadata: Metadata = {
    title: "GStudy - Upgrade Your Studies",
    description: "Turn YouTube videos, PDFs, web links, and text into smart flashcards and summaries. Perfect for students.",
    keywords: [
      "study tools",
      "AI flashcards",
      "PDF summarizer",
      "YouTube notes",
      "student productivity",
      "online learning",
      "GStudy app"
    ],
    openGraph: {
      title: "GStudy - Upgrade Your Studies",
      description: "Generate summaries and flashcards from your study material using AI.",
      url: "https://gstudy.app",
      siteName: "GStudy",
      images: [
        {
          url: "https://gstudy.app/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "GStudy Preview",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
  

// This page is server-rendered by default because it's in the app/ directory
export default function LandingPage() {

    const announcement = "GStudy is now public!";

    return (
        <div className=" text-black bg-white dark:text-white dark:bg-black">
            {/* Navbar */}
            <Navbar removeTransparency={false} />

            {/* Main Content */}
            <main className="w-full max-w-7xl flex flex-col justify-center items-center text-center mx-auto px-5">
                
                <Hero />

                {/* Demo Section */}
                <SaasDemo />

                <About />

                {/* Features Section */}
                <Features />

                {/* Testimonials Section */}
                <Testimonials />

                {/* Pricing Section */}
                <PricingSection />

                {/* Blog Section */}
                <BlogSection />

                {/* FAQ Section */}
                <FAQ />

                {/* Call to Action Section */}
                <CTA />
            </main>

            {/* Footer */}
            <Footer />

            {/* <CookieConsent /> */}
        </div>
    );
}
