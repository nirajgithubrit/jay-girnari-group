import { getRuntimeConfig } from '../app/core/config/runtime-config';

const runtime = getRuntimeConfig();

export const environment = {
  production: true,
  apiUrl: runtime.apiUrl,
  vapidPublicKey: runtime.vapidPublicKey ?? '',
};
