"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  isCookieConsentValue,
  updateGoogleConsent,
} from "./consent";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if the user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (isCookieConsentValue(consent)) {
      updateGoogleConsent(consent);
      return;
    }

    if (!consent) {
      // Defer state update to avoid React Compiler synchronous setState warning
      requestAnimationFrame(() => {
        setShowConsent(true);
      });
      return;
    }

    // Unknown stored value should be treated as no consent.
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    requestAnimationFrame(() => {
      setShowConsent(true);
    });
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "granted");
    updateGoogleConsent("granted");
    window.dispatchEvent(new Event(COOKIE_CONSENT_UPDATED_EVENT));
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "denied");
    updateGoogleConsent("denied");
    window.dispatchEvent(new Event(COOKIE_CONSENT_UPDATED_EVENT));
    setShowConsent(false);
  };

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId || !showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-lg sm:flex-row sm:p-6">
      <div className="flex-1 text-sm text-card-foreground">
        We use essential cookies for core functionality and optional analytics
        cookies to understand site usage. Read our{" "}
        <Link href="/cookies" className="underline underline-offset-4">
          Cookie Policy
        </Link>{" "}
        for details.
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Button variant="outline" size="sm" onClick={declineCookies}>
          Decline All
        </Button>
        <Button size="sm" onClick={acceptCookies}>
          Accept All
        </Button>
      </div>
    </div>
  );
}
