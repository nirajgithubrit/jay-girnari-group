export interface JggRuntimeConfig {
  apiUrl: string;
  vapidPublicKey?: string;
}

const DEFAULT_PRODUCTION_API = 'https://jay-girnari-group.onrender.com/api';
const DEFAULT_VAPID_PUBLIC_KEY =
  'BOCS9JpA3fDzTCcgvc-RcQZ828Hn-cnao32wAP_GG13hucbtwlDnhydy6V9bMdrpLG3kGwkinao0zIcraMP5Bm4';

declare global {
  interface Window {
    __JGG_CONFIG__?: JggRuntimeConfig;
  }
}

/** API URL from runtime-config.js (Netlify build) or production defaults. */
export function getRuntimeConfig(): JggRuntimeConfig {
  const cfg = typeof window !== 'undefined' ? window.__JGG_CONFIG__ : undefined;
  const apiUrl = (cfg?.apiUrl || DEFAULT_PRODUCTION_API).replace(/\/$/, '');
  return {
    apiUrl,
    vapidPublicKey: cfg?.vapidPublicKey || DEFAULT_VAPID_PUBLIC_KEY,
  };
}
