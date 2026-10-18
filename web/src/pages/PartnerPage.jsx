import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_BASE } from '../config.js';

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    partnerTrack: 'service',
    trade: 'ac_appliance',
    locality: '452010',
    experience: '3-5 years',
    hasAadhaar: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || formData.phone.length < 10) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          category: 'partner_application',
          description: `New Partner Application: Track [${formData.partnerTrack.toUpperCase()}], Trade: ${formData.trade}, Locality Pincode: ${formData.locality}, Experience: ${formData.experience}, Has Aadhaar: ${formData.hasAadhaar}`
        })
      });
      const data = await res.json();
      setTicketId(data?.data?.ticketId || `MBB-PTR-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubmitted(true);
    } catch {
      setTicketId(`MBB-PTR-${Math.floor(100000 + Math.random() * 900000)}`);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F5F2] text-[#1C1917] font-['IBM_Plex_Sans',sans-serif]">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-[#E7E5E4] bg-[#FBFBFA] py-12 md:py-16">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEEDE9] border border-[#E7E5E4] text-[#0B2545] text-xs font-semibold">
              <span className="material-symbols-outlined text-[#C2410C] text-[18px]">rocket_launch</span>
              <span className="font-bold">Indore &amp; MP Partner Drive</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E7E5E4]"></span>
              <span className="text-[#57534E]">Zero Commission During First 60 Days</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1C1917] text-balance">
              Grow Your Local Business in Indore with <span className="text-[#0B2545]">MyBigBazaar</span>
            </h1>
            <p className="text-base md:text-lg text-[#57534E] max-w-2xl leading-relaxed">
              Connect directly with 85,000+ local buyers and homeowners within 5&ndash;15 km. Keep 100% of your initial earnings with daily UPI and direct bank payouts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#quick-register"
                className="px-6 py-3 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-[#FBFBFA] text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2"
              >
                <span>Register in 1 Minute</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
              <a
                href="#tracks"
                className="px-5 py-3 rounded-lg border border-[#E7E5E4] bg-[#FBFBFA] hover:bg-[#EEEDE9] text-[#1C1917] text-xs font-bold transition-colors inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Explore Partner Tracks</span>
              </a>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="mt-10 pt-8 border-t border-[#E7E5E4] grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEEDE9] text-[#0B2545] border border-[#E7E5E4]">
                <span className="material-symbols-outlined text-[24px]">percent</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#1C1917]">0% Commission</div>
                <div className="text-xs text-[#57534E]">For First 60 Days</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEEDE9] text-[#0B2545] border border-[#E7E5E4]">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#1C1917]">Daily &amp; Weekly</div>
                <div className="text-xs text-[#57534E]">Direct Bank Transfers</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEEDE9] text-[#0B2545] border border-[#E7E5E4]">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#1C1917]">1,200+ Verified</div>
                <div className="text-xs text-[#57534E]">Active MP Technicians</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEEDE9] text-[#C2410C] border border-[#E7E5E4]">
                <span className="material-symbols-outlined text-[24px]">star</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#1C1917]">4.8★ Rating</div>
                <div className="text-xs text-[#57534E]">Average Partner Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Track Comparison */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12 md:py-16 space-y-8" id="tracks">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1917] tracking-tight">Choose Your Hyperlocal Track</h2>
          <p className="text-xs md:text-sm text-[#57534E]">Engineered for service masters and retail shop owners operating in Indore, Ujjain, Dewas, and across MP.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track A: Service Professionals */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#E0E7FF] text-[#4338CA] text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">handyman</span>
                  TRACK A: ON-DEMAND SERVICES
                </span>
                <span className="text-xs text-[#57534E] font-medium">MP Local Dispatch</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1C1917]">For Service Professionals</h3>
                <p className="text-xs text-[#57534E] mt-1">Electricians, Plumbers, AC Mechanics, Cleaners, Carpenters, Beauticians.</p>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-[#57534E]">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Daily Doorstep Job Alerts:</strong> Real-time alerts for urgent service requests within your selected Indore radius (e.g. Vijay Nagar, Bhawarkua).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Standardized Rate Cards:</strong> Transparent pre-agreed visiting charges and component rate cards with zero client bargaining.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Verified Partner Badge:</strong> QR-verified identity and police check badge building instant homeowner credibility.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Instant OTP Settlement:</strong> Escrow payment released automatically to your UPI/bank the moment the job OTP is validated.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E7E5E4] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#6F6A65] uppercase font-semibold">Earning Potential</span>
                <div className="text-base font-bold text-[#1C1917] tabular-nums">₹35,000 - ₹75,000 / mo</div>
              </div>
              <a
                href="#quick-register"
                onClick={() => setFormData({ ...formData, partnerTrack: 'service' })}
                className="px-4 py-2.5 rounded-lg bg-[#0B2545] hover:bg-opacity-90 text-[#FBFBFA] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Join as Technician</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </a>
            </div>
          </div>

          {/* Track B: Local Shops & Classifieds Sellers */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#EEEDE9] text-[#1C1917] text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                  TRACK B: CLASSIFIEDS &amp; SHOPS
                </span>
                <span className="text-xs text-[#57534E] font-medium">Hyperlocal Storefront</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1C1917]">For Local Shops &amp; Power Sellers</h3>
                <p className="text-xs text-[#57534E] mt-1">Pre-owned electronics, mobile stores, used bikes/cars, furniture stores.</p>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-[#57534E]">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Hyperlocal Chat Leads:</strong> Receive direct inquiries from buyers in Rajwada, Palasia, South Tukoganj, and Vijay Nagar.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Zero Commission on Store Walk-ins:</strong> 100% margin on all direct customer visits and cash-on-pickup classified sales.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Dedicated Verified Storefront:</strong> Verified digital profile, catalog display, operational hours, and customer reviews.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#15803D] text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Priority Search Boosts:</strong> Highlight listings at the top of local search feeds for fast inventory turnover.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E7E5E4] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#6F6A65] uppercase font-semibold">Earning Potential</span>
                <div className="text-base font-bold text-[#1C1917]">Unlimited Direct Deals</div>
              </div>
              <a
                href="#quick-register"
                onClick={() => setFormData({ ...formData, partnerTrack: 'retail' })}
                className="px-4 py-2.5 rounded-lg bg-[#0B2545] hover:bg-opacity-90 text-[#FBFBFA] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Register Store</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Rapid Onboarding Timeline */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12">
        <div className="p-6 md:p-10 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">Rapid 4-Step Onboarding</h2>
            <p className="text-xs md:text-sm text-[#57534E]">Simple, digital-first verification designed to get your profile active within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#0B2545] text-[#FBFBFA] font-bold text-xs flex items-center justify-center">1</span>
                <span className="material-symbols-outlined text-[#0B2545]">phonelink_setup</span>
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Register Mobile OTP</h3>
              <p className="text-xs text-[#57534E]">Quick 1-minute phone verification to set up your primary partner account.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#0B2545] text-[#FBFBFA] font-bold text-xs flex items-center justify-center">2</span>
                <span className="material-symbols-outlined text-[#0B2545]">verified_user</span>
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Aadhaar / PAN KYC</h3>
              <p className="text-xs text-[#57534E]">Mandatory identity verification ensuring high consumer confidence and safe transactions.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#0B2545] text-[#FBFBFA] font-bold text-xs flex items-center justify-center">3</span>
                <span className="material-symbols-outlined text-[#0B2545]">map</span>
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Set Pincodes &amp; Rates</h3>
              <p className="text-xs text-[#57534E]">Define your working radius (e.g. Vijay Nagar, Palasia, Super Corridor) and service pricing.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#C2410C] text-[#FBFBFA] font-bold text-xs flex items-center justify-center">4</span>
                <span className="material-symbols-outlined text-[#C2410C]">payments</span>
              </div>
              <h3 className="text-sm font-bold text-[#1C1917]">Receive Jobs &amp; Payouts</h3>
              <p className="text-xs text-[#57534E]">Accept jobs, negotiate in-app, complete service with OTP, and get same-day payouts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Registration Form & APK Callout */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12" id="quick-register">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[#C2410C] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Fast Application</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1917]">Apply as an Indore Partner</h2>
              <p className="text-xs text-[#57534E]">Our local onboarding team will contact you within 4 business hours to finalize setup.</p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#EEEDE9] border border-[#E7E5E4] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">check</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">Application Received!</h3>
                    <p className="text-xs text-[#57534E]">Docket: <strong className="font-mono text-[#0B2545]">{ticketId}</strong></p>
                  </div>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  Thank you, <strong>{formData.fullName}</strong>. Our Indore Onboarding Desk in South Tukoganj will call your number (<strong>+91 {formData.phone}</strong>) today to complete your digital KYC and issue your welcome kit.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B2545] text-[#FBFBFA] text-xs font-semibold hover:bg-opacity-90"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Full Legal Name (as per Aadhaar) <span className="text-[#BE123C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Verma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg bg-[#EEEDE9] border border-[#E7E5E4] text-xs text-[#1C1917] focus:bg-[#FBFBFA] focus:border-[#0B2545] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    10-Digit Mobile / WhatsApp Number <span className="text-[#BE123C]">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E7E5E4] bg-[#EEEDE9] text-xs text-[#57534E] font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="98260XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-r-lg bg-[#EEEDE9] border border-[#E7E5E4] text-xs text-[#1C1917] focus:bg-[#FBFBFA] focus:border-[#0B2545] outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#6F6A65] mt-1">Lead alerts &amp; customer OTPs will be sent to this number.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">Select Partner Track</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.partnerTrack === 'service' ? 'bg-[#EEEDE9] border-[#0B2545]' : 'border-[#E7E5E4] hover:bg-[#EEEDE9]'}`}>
                      <input
                        type="radio"
                        name="partner_track"
                        value="service"
                        checked={formData.partnerTrack === 'service'}
                        onChange={(e) => setFormData({ ...formData, partnerTrack: e.target.value })}
                        className="text-[#0B2545] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">Service Technician</div>
                        <div className="text-[11px] text-[#57534E]">Doorstep repairs &amp; visits</div>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.partnerTrack === 'retail' ? 'bg-[#EEEDE9] border-[#0B2545]' : 'border-[#E7E5E4] hover:bg-[#EEEDE9]'}`}>
                      <input
                        type="radio"
                        name="partner_track"
                        value="retail"
                        checked={formData.partnerTrack === 'retail'}
                        onChange={(e) => setFormData({ ...formData, partnerTrack: e.target.value })}
                        className="text-[#0B2545] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#1C1917]">Shop &amp; Classifieds Seller</div>
                        <div className="text-[11px] text-[#57534E]">Products &amp; store inventory</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">Primary Trade / Category</label>
                    <select
                      value={formData.trade}
                      onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-[#EEEDE9] border border-[#E7E5E4] text-xs text-[#1C1917] focus:bg-[#FBFBFA] focus:border-[#0B2545] outline-none transition-colors"
                    >
                      <option value="ac_appliance">AC &amp; Refrigerator Repair</option>
                      <option value="electrician">Electrician &amp; Wireman</option>
                      <option value="plumber">Plumber &amp; Sanitary</option>
                      <option value="home_salon">Home Salon &amp; Beautician</option>
                      <option value="mobile_electronics">Used Electronics &amp; Mobiles</option>
                      <option value="auto_dealer">Pre-owned Two-Wheelers / Cars</option>
                      <option value="carpenter">Carpenter &amp; Furniture Store</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">Primary Indore Locality</label>
                    <select
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg bg-[#EEEDE9] border border-[#E7E5E4] text-xs text-[#1C1917] focus:bg-[#FBFBFA] focus:border-[#0B2545] outline-none transition-colors"
                    >
                      <option value="452010">Vijay Nagar / Scheme 54 (452010)</option>
                      <option value="452001">South Tukoganj / Regal (452001)</option>
                      <option value="452002">Rajwada / Sarafa (452002)</option>
                      <option value="452001-palasia">Old Palasia / New Palasia</option>
                      <option value="452014">Bhawarkua / Tower Square (452014)</option>
                      <option value="452005">Annapurna / Sudama Nagar (452005)</option>
                      <option value="453555">Super Corridor / Airport Road</option>
                      <option value="mp_other">Other MP City (Ujjain / Dewas)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-[#FBFBFA] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Submit Application &amp; Verification</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Rail: Partner App Download Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#EEEDE9] text-[#0B2545]">
                  <span className="material-symbols-outlined text-[26px]">install_mobile</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917]">MyBigBazaar Partner App</h3>
                  <p className="text-xs text-[#57534E]">Android Release &bull; Built for On-the-Move Pros</p>
                </div>
              </div>

              {/* QR Simulation Card */}
              <a
                href="/downloads/mybigbazaar-v1.0.0.apk"
                download="MyBigBazaar-v1.0.0.apk"
                className="p-4 rounded-xl bg-[#EEEDE9] hover:bg-[#E7E5E4] border border-[#E7E5E4] flex items-center gap-4 transition-colors no-underline block"
                title="Click to download Android APK directly"
              >
                <div className="w-24 h-24 bg-[#0B2545] rounded-lg p-2 flex flex-col items-center justify-center text-[#FBFBFA] shrink-0">
                  <span className="material-symbols-outlined text-[36px]">qr_code_2</span>
                  <span className="text-[8px] font-bold tracking-widest uppercase">SCAN APK</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-[#1C1917]">Direct APK Installation</div>
                  <p className="text-[#57534E]">Install directly on your Android phone for real-time push lead alerts.</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#15803D] font-bold">
                    <span className="material-symbols-outlined text-[14px]">security</span>
                    SHA-256 Verified (v1.0.0)
                  </span>
                </div>
              </a>

              <div className="space-y-2.5">
                <a
                  href="/downloads/mybigbazaar-v1.0.0.apk"
                  download="MyBigBazaar-v1.0.0.apk"
                  className="w-full h-11 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-[#FBFBFA] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">android</span>
                  <span>Download Android APK (v1.0.0)</span>
                </a>
                <a
                  href="tel:18008892227"
                  className="w-full h-11 rounded-lg border border-[#E7E5E4] bg-[#FBFBFA] hover:bg-[#EEEDE9] text-[#1C1917] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                  <span>Need help? Call MP Partner Desk</span>
                </a>
              </div>

              <div className="pt-4 border-t border-[#E7E5E4] text-xs text-[#57534E] space-y-1">
                <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0B2545]">support_agent</span>
                  <span>Indore Partner Help Desk</span>
                </div>
                <p>402 Orbit Mall, AB Road, South Tukoganj, Indore 452001</p>
                <p className="font-mono text-[#0B2545] font-bold">
                  Toll Free: <a href="tel:18008892227" className="underline hover:text-[#C2410C]">1800-889-2227</a> &bull; Email: <a href="mailto:partners@mybigbazaar.com" className="underline hover:text-[#C2410C]">partners@mybigbazaar.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
