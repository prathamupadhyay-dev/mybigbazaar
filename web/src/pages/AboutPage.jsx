import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_BASE } from '../config.js';

export default function AboutPage() {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/v1/cms/about`)
      .then((res) => {
        if (!res.ok) throw new Error('CMS not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.data) {
          setCmsData(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F5F2] text-[#1C1917] font-['IBM_Plex_Sans',sans-serif]">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-[#E7E5E4] bg-[#FBFBFA] py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-[#6F6A65] mb-4">
            <Link to="/" className="hover:text-[#1C1917] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1C1917] font-medium">About Us</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEDE9] border border-[#E7E5E4] text-[#0B2545] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C2410C]"></span>
              Indore Born &bull; Built for Real Bharat
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917]">
              {cmsData?.title || 'Empowering Neighborhood Commerce with Trust & Transparency'}
            </h1>
            <p className="text-base md:text-lg text-[#57534E] leading-relaxed">
              {cmsData?.excerpt || 'MyBigBazaar bridges verified local classifieds and guaranteed doorstep home services across Indore and Madhya Pradesh, eliminating predatory middlemen and fake listings.'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Strip */}
      <section className="border-b border-[#E7E5E4] bg-[#F6F5F2] py-8">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#0B2545] tabular-nums">85,000+</div>
              <div className="text-xs text-[#6F6A65] mt-1 font-medium">Registered MP Users</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#C2410C] tabular-nums">1,200+</div>
              <div className="text-xs text-[#6F6A65] mt-1 font-medium">Vetted Service Technicians</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#15803D] tabular-nums">100%</div>
              <div className="text-xs text-[#6F6A65] mt-1 font-medium">Aadhaar / Police Verified</div>
            </div>
            <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#4338CA] tabular-nums">15-Min</div>
              <div className="text-xs text-[#6F6A65] mt-1 font-medium">Average Response SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Mission & Story */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-6 shadow-sm">
              <div className="border-b border-[#E7E5E4] pb-4">
                <span className="text-xs uppercase font-bold text-[#C2410C] tracking-wide">Our Origins</span>
                <h2 className="text-2xl font-bold text-[#1C1917] mt-1">From South Tukoganj to All of Central India</h2>
              </div>
              
              <div className="text-[#57534E] space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  <strong>MyBigBazaar</strong> (operated by <em>MyBigBazaar Marketplace India Private Limited</em>) was conceived and founded in South Tukoganj, Indore with a clear, localized objective: to build India&apos;s premier high-trust hyperlocal bridge connecting peer-to-peer buyers, sellers, and skilled on-demand service technicians.
                </p>
                <p>
                  While legacy global classifieds platforms abandoned local safety and turned into spam magnets filled with advance-fee scams, MyBigBazaar builds strict hyperlocal boundary walls. Every service professional is physically vetted at our local hubs in Indore, Bhopal, and Jabalpur before taking their first booking.
                </p>
                <p>
                  We believe true digital empowerment happens when a resident in Vijay Nagar can safely buy a bicycle from someone in Palasia, and within the same app, schedule a trusted AC mechanic with pre-negotiated rate cards and OTP-protected payment escrow.
                </p>
              </div>

              {/* Dynamic CMS Body injection if available */}
              {cmsData?.content && (
                <div 
                  className="pt-6 border-t border-[#E7E5E4] prose prose-stone max-w-none text-sm text-[#57534E]"
                  dangerouslySetInnerHTML={{ __html: cmsData.content }}
                />
              )}
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#EEEDE9] flex items-center justify-center text-[#0B2545]">
                  <span className="material-symbols-outlined text-[24px]">flag</span>
                </div>
                <h3 className="text-lg font-bold text-[#1C1917]">Our Mission</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Democratize neighborhood commerce by eliminating parasitic middleman fees and empowering blue-collar technicians with dignified, standardized earnings across Tier-2 and Tier-3 Indian cities.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#EEEDE9] flex items-center justify-center text-[#C2410C]">
                  <span className="material-symbols-outlined text-[24px]">visibility</span>
                </div>
                <h3 className="text-lg font-bold text-[#1C1917]">Our Vision</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  To make everyday commerce safe within walking distance, where a neighbor can sell pre-owned goods in the morning and book a verified technician in the evening through one unified interface.
                </p>
              </div>
            </div>
          </div>

          {/* Right Rail: Corporate & Statutory Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Corporate Governance
              </h3>
              <div className="space-y-3 text-xs text-[#57534E]">
                <div>
                  <span className="font-semibold text-[#1C1917] block">Entity Name:</span>
                  MyBigBazaar Marketplace India Private Limited
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917] block">Corporate Identity Number (CIN):</span>
                  U72900MP2025PTC078129
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917] block">Registered Office:</span>
                  402-404, Orbit Mall, AB Road, South Tukoganj, Indore, Madhya Pradesh 452001
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917] block">Statutory Grievance Officer:</span>
                  Mr. Rajeshwar Patel (Indore HQ)
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917] block">Toll-Free Helpline:</span>
                  <a href="tel:18008892227" className="text-[#0B2545] font-semibold underline">1800-889-2227</a>
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917] block">Official Email:</span>
                  <a href="mailto:grievance@mybigbazaar.com" className="text-[#0B2545] font-semibold underline">grievance@mybigbazaar.com</a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0B2545] text-[#FBFBFA] space-y-4 shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] text-xs font-semibold text-[#FBFBFA]">
                <span className="material-symbols-outlined text-sm text-[#15803D]">verified</span>
                ISO 27001 Certified
              </div>
              <h4 className="text-lg font-bold">Join the MP Partner Network</h4>
              <p className="text-xs text-[#EEEDE9] leading-relaxed">
                Are you an electrician, plumber, AC specialist, or store owner in Madhya Pradesh? Join over 1,200 verified partners with zero commission for your first 60 days.
              </p>
              <Link 
                to="/partner" 
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-[#FBFBFA] text-xs font-semibold transition-colors"
              >
                Become a Partner &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
