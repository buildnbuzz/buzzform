export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "buzzform-cookie-consent-updated";

export type CookieConsentValue = "granted" | "denied";

export function isGrantedConsent(value: string | null): value is "granted" {
  return value === "granted";
}

export function isCookieConsentValue(
  value: string | null,
): value is CookieConsentValue {
  return value === "granted" || value === "denied";
}

type ConsentUpdatePayload = {
  ad_storage: CookieConsentValue;
  analytics_storage: CookieConsentValue;
  ad_user_data: CookieConsentValue;
  ad_personalization: CookieConsentValue;
};

export function toConsentUpdatePayload(
  consent: CookieConsentValue,
): ConsentUpdatePayload {
  return {
    ad_storage: consent,
    analytics_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
  };
}

export function updateGoogleConsent(consent: CookieConsentValue): void {
  if (typeof window === "undefined") {
    return;
  }

  const runtimeWindow = window as Window & { dataLayer?: unknown[] };
  runtimeWindow.dataLayer = runtimeWindow.dataLayer || [];

  const gtag: (...args: unknown[]) => void = function () {
    // eslint-disable-next-line prefer-rest-params
    runtimeWindow.dataLayer?.push(arguments);
  };

  gtag("consent", "update", toConsentUpdatePayload(consent));
}
