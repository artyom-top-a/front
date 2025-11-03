"use client";

import { CookieIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface CookieConsentProps {
    variant?: "default" | "small";
    demo?: boolean;
    onAcceptCallback?: () => void;
    onDeclineCallback?: () => void;
}

export default function CookieConsent({
    variant = "default",
    demo = true,
    onAcceptCallback = () => { },
    onDeclineCallback = () => { }
}: CookieConsentProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hide, setHide] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
    };

    const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const accept = () => {
        setIsOpen(false);
        setCookie("cookieConsent", "true", 365);
        setTimeout(() => setHide(true), 700);
        onAcceptCallback();
    };

    const decline = () => {
        setIsOpen(false);
        setCookie("cookieConsent", "false", 365);
        setTimeout(() => setHide(true), 700);
        onDeclineCallback();
    };

    useEffect(() => {
        try {
            const consent = getCookie("cookieConsent");
            if (consent === "true" || consent === "false") {
                setHide(true);
            } else {
                setIsOpen(true);
            }

            setMounted(true);
        } catch (e) {
            console.error("Error: ", e);
        }
    }, []);

    return (
        <div
            className={cn(
                "fixed z-[200] bottom-0 sm:bottom-4 left-1/2 -translate-x-1/2 w-full max-w-full sm:max-w-4xl duration-700 ease-in-out sm:px-4", // Mobile-friendly max width and padding
                mounted && isOpen 
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0",
                hide && "hidden"
            )}
        >
            <div className="bg-white backdrop-blur-2xl rounded-xl sm:rounded-2xl sm:m-3 border border-stone-100 shadow-lg pb-6 px-5 pt-7 sm:p-4 text-black">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="text-[14px] sm:text-[15px] font-medium text-center sm:text-left mb-2 sm:mb-0">
                    <span className="text-lg sm:text-xl mr-1">🍪</span>  By clicking &quot;Accept&quot;, you agree to the storing of cookies on your device
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
                        <Button
                            onClick={accept}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#6127FF] hover:bg-[#6127FF]/80 text-white w-full sm:w-auto text-sm">
                            Accept
                        </Button>
                        <Button
                            onClick={decline}
                            className="w-full sm:w-auto rounded-md font-semibold border border-stone-100 bg-white hover:bg-gray-50 text-black"
                            variant="secondary">
                            Decline
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
