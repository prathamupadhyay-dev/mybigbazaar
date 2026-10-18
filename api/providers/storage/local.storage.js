/**
 * @file apps/api/providers/storage/local.storage.js
 * @description Local disk file storage provider
 */

import env from '../../config/env.js';

export class LocalStorageProvider {
  /**
   * Resolves public HTTP URL for an uploaded file
   * @param {string} filename 
   * @returns {string} Relative URL for static serving
   */
  getFileUrl(filename) {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    const cleanName = filename.replace(/^\/+uploads\/+/, '').replace(/^\/+/, '');
    return `/uploads/${cleanName}`;
  }

  /**
   * Resolves absolute URL including API base
   */
  getAbsoluteUrl(filename) {
    const rel = this.getFileUrl(filename);
    if (rel.startsWith('http')) return rel;
    return `${env.PUBLIC_BASE_URL}${rel}`;
  }
}

export default new LocalStorageProvider();
