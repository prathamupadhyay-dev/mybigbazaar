/**
 * @file apps/web/src/utils/cmsUtils.js
 * @description Helpers for dynamic CMS policy loading and rendering on the web.
 */

import React from 'react';
import { API_BASE } from '../config.js';

/**
 * Loads a CMS document by slug from backend API or local synchronized cache
 */
export async function loadCmsDocument(slug, fallbackKey) {
  // 1. Check local synchronized storage cache
  let cachedDoc = null;
  try {
    const directKey = localStorage.getItem(`mbb_cms_${slug}`);
    if (directKey) {
      cachedDoc = JSON.parse(directKey);
    } else {
      const adminPages = localStorage.getItem('admin_static_pages');
      if (adminPages) {
        const parsed = JSON.parse(adminPages);
        if (fallbackKey && parsed[fallbackKey]) {
          cachedDoc = parsed[fallbackKey];
        }
      }
    }
  } catch (e) {
    // Ignore parse error
  }

  // 2. Fetch live data from backend CMS endpoint
  try {
    const endpoints = [
      `${API_BASE}/api/v1/cms/pages/${slug}`,
      `${API_BASE}/api/v1/cms/${slug}`,
      `${API_BASE}/cms/${slug}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && json.data.content && !json.data.content.startsWith('Default content for')) {
            return json.data;
          }
        }
      } catch (err) {
        // Try next endpoint
      }
    }
  } catch (err) {
    // API unreachable
  }

  return cachedDoc;
}

/**
 * Renders markdown/plain text content safely into formatted React elements
 */
export function renderCmsMarkdown(content) {
  if (!content) return null;

  // Split into paragraphs / lines
  const lines = content.split('\n');
  const elements = [];
  let currentParagraph = [];

  const flushParagraph = (key) => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${key}`} className="text-xs md:text-sm text-[#57534E] leading-relaxed mb-4">
          {currentParagraph.join(' ')}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(idx);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph(idx);
      elements.push(
        <h1 key={`h1-${idx}`} className="text-2xl font-bold text-[#1C1917] mt-6 mb-3">
          {trimmed.replace(/^#\s+/, '')}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      flushParagraph(idx);
      elements.push(
        <h2 key={`h2-${idx}`} className="text-xl font-bold text-[#1C1917] mt-5 mb-2">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushParagraph(idx);
      elements.push(
        <h3 key={`h3-${idx}`} className="text-base font-bold text-[#1C1917] mt-4 mb-2">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph(idx);
      elements.push(
        <li key={`li-${idx}`} className="text-xs md:text-sm text-[#57534E] ml-4 list-disc mb-1">
          {trimmed.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else {
      currentParagraph.push(trimmed);
    }
  });

  flushParagraph('final');
  return elements;
}
