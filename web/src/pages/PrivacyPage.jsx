import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { LEGAL_DOCUMENTS, BRAND_CONFIG } from '../../../../packages/shared/content.js';
import { loadCmsDocument, renderCmsMarkdown } from '../utils/cmsUtils.jsx';

export default function PrivacyPage() {
  const [cmsDoc, setCmsDoc] = useState(null);
  const doc = LEGAL_DOCUMENTS.privacy;

  useEffect(() => {
    let isMounted = true;
    loadCmsDocument('privacy-policy', 'privacy').then((data) => {
      if (isMounted && data) {
        setCmsDoc(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F5F2] text-[#1C1917] font-['IBM_Plex_Sans',sans-serif]">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-[#E7E5E4] bg-[#FBFBFA] py-12">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-[#6F6A65] mb-4">
            <Link to="/" className="hover:text-[#1C1917] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#6F6A65]">Legal</span>
            <span>/</span>
            <span className="text-[#1C1917] font-medium">Privacy Policy</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEDE9] border border-[#E7E5E4] text-[#15803D] text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              DPDPA 2023 &amp; IT Rules 2021 Compliant
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1C1917]">
              {cmsDoc?.title || doc.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#6F6A65]">
              <span>Version: <strong className="text-[#1C1917]">{cmsDoc?.version || doc.version}</strong></span>
              <span>&bull;</span>
              <span>Last Revised: <strong className="text-[#1C1917]">{cmsDoc?.lastUpdated || doc.lastUpdated}</strong></span>
              <span>&bull;</span>
              <span>Jurisdiction: <strong className="text-[#1C1917]">Republic of India</strong></span>
            </div>
            <p className="text-sm md:text-base text-[#57534E] leading-relaxed">
              {cmsDoc?.excerpt || doc.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Sidebar Nav */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-4 shadow-sm">
              <h4 className="text-xs uppercase font-bold text-[#6F6A65] tracking-wider">Document Sections</h4>
              <nav className="space-y-2">
                {doc.sections.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx + 1}`}
                    className="block text-xs font-medium text-[#57534E] hover:text-[#0B2545] p-2 rounded-lg hover:bg-[#EEEDE9] transition-colors"
                  >
                    {sec.heading}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#E7E5E4] space-y-2 text-xs">
                <strong className="text-[#1C1917] block">Statutory Grievance Officer:</strong>
                <p className="text-[#57534E]">Mr. Rajeshwar Patel (Indore HQ)</p>
                <div className="space-y-1">
                  <a href="mailto:grievance@mybigbazaar.com" className="text-[#0B2545] font-semibold underline block">
                    grievance@mybigbazaar.com
                  </a>
                  <a href="tel:18008892227" className="text-[#0B2545] font-semibold underline block">
                    Toll-Free: 1800-889-2227
                  </a>
                </div>
              </div>
            </div>

            {/* Google Play / User Data Right Card */}
            <div className="p-6 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#BE123C]">
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Account &amp; Data Deletion Right</span>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                You have the unconditional right to request permanent deletion of your phone number, profile, chats, and KYC records at any time.
              </p>
              <Link
                to="/delete-account"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BE123C] hover:underline"
              >
                <span>Submit Deletion Request</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </aside>

          {/* Article Content */}
          <article className="lg:col-span-8 space-y-8">
            {cmsDoc?.content ? (
              <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm">
                {renderCmsMarkdown(cmsDoc.content)}
              </div>
            ) : (
              <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm space-y-8">
                {/* Account Deletion Callout Box */}
                <div className="p-5 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-2">
                  <div className="flex items-center gap-2 text-[#0B2545] font-bold text-xs">
                    <span className="material-symbols-outlined text-sm">security</span>
                    <span>Account Deletion &amp; Data Erasure (Google Play Requirement)</span>
                  </div>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    Users can trigger self-deletion via <em>App &rarr; Account &rarr; Settings &rarr; Delete Account</em> or submit a direct statutory request online at our <Link to="/delete-account" className="font-semibold text-[#0B2545] underline">Account Deletion Page</Link>. Processing completes within 72 hours.
                  </p>
                </div>

                {doc.sections.map((sec, idx) => (
                  <div key={idx} id={`section-${idx + 1}`} className="space-y-2">
                    <h2 className="text-lg font-bold text-[#1C1917]">{sec.heading}</h2>
                    <p className="text-xs md:text-sm text-[#57534E] leading-relaxed">{sec.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#57534E]">
                Need more information regarding our data practices?
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/terms"
                  className="px-4 py-2 rounded-lg border border-[#E7E5E4] bg-[#FBFBFA] hover:bg-[#EEEDE9] text-[#1C1917] text-xs font-semibold transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/support"
                  className="px-4 py-2 rounded-lg bg-[#0B2545] text-[#FBFBFA] text-xs font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
