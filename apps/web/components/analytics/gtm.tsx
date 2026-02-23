"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import { COOKIE_CONSENT_STORAGE_KEY } from "./consent";

export function GTM() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) {
    return null;
  }

  const bootstrapConsentScript = `
    (function() {
      var consentKey = ${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)};
      var consent = null;
      try {
        consent = window.localStorage.getItem(consentKey);
      } catch (error) {}

      var hasStoredChoice = consent === "granted" || consent === "denied";
      var consentState = consent === "granted" ? "granted" : "denied";
      var waitForUpdate = hasStoredChoice ? 0 : 500;

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}

      gtag("consent", "default", {
        "analytics_storage": consentState,
        "ad_storage": consentState,
        "ad_user_data": consentState,
        "ad_personalization": consentState,
        "wait_for_update": waitForUpdate
      });
    })();
  `;

  return (
    <>
      <Script id="gtm-consent-default" strategy="afterInteractive">
        {bootstrapConsentScript}
      </Script>
      <GoogleTagManager gtmId={gtmId} />
    </>
  );
}
