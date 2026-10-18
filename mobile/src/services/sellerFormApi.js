/**
 * @file apps/mobile/src/services/sellerFormApi.js
 * @description Dynamic seller form schema fetcher strictly from Backend Database
 */

import { getEffectiveBaseUrl } from './categoryApi';

/**
 * Fetch dynamic seller form schema for given category strictly from backend DB.
 * Returns null if backend or database is disconnected.
 */
export async function getSellerFormApi(category) {
  if (!category) return null;

  try {
    const baseUrl = getEffectiveBaseUrl();
    const query = new URLSearchParams({
      category: category.trim()
    }).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${baseUrl}/api/v1/seller-forms/find?${query}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json && json.success && json.data && Array.isArray(json.data.fields)) {
        return json.data;
      }
    }
  } catch (err) {
    // Backend or database offline -> return null (empty)
  }

  return null;
}
