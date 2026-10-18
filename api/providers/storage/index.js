/**
 * @file apps/api/providers/storage/index.js
 * @description Storage provider barrel export
 */

import localStorageProvider from './local.storage.js';

export const storageProvider = localStorageProvider;
export default storageProvider;
