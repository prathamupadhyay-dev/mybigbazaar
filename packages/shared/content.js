/**
 * @file packages/shared/content.js
 * @description Single canonical source of truth for marketing copy, FAQs,
 * trust & safety advisories, legal policies, and store metadata across
 * MyBigBazaar's public web and admin console.
 */

// ==========================================
// 1. BRAND & METADATA CONFIGURATION
// ==========================================
export const BRAND_CONFIG = Object.freeze({
  appName: 'MyBigBazaar',
  shortName: 'BigBazaar',
  tagline: "India's Unified Hyperlocal Marketplace",
  subTagline: 'Buy, Sell Used Goods & Book Doorstep Home Experts',
  supportEmail: 'support@bigbazaar.com',
  supportPhone: '+91 8000-244-229',
  supportHours: 'Mon - Sun: 8:00 AM - 10:00 PM IST',
  headquarters: 'Indiranagar, Bengaluru, Karnataka 560038, India',
  cin: 'U72900KA2026PTC184920',
  copyright: `© ${new Date().getFullYear()} MyBigBazaar Technologies Pvt. Ltd. All rights reserved.`,
  socialLinks: {
    twitter: 'https://twitter.com/mybigbazaar',
    facebook: 'https://facebook.com/mybigbazaar',
    instagram: 'https://instagram.com/mybigbazaar',
    linkedin: 'https://linkedin.com/company/mybigbazaar'
  }
});

// ==========================================
// 2. STORE DOWNLOAD CONFIGURATION
// ==========================================
export const STORE_DOWNLOAD_CONFIG = Object.freeze({
  android: {
    available: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mybigbazaar.app',
    apkDownloadUrl: '/downloads/mybigbazaar-v1.0.0.apk',
    version: '1.2.0',
    minAndroidVersion: '8.0 (Oreo) or higher',
    badgeText: 'GET IT ON Google Play'
  },
  ios: {
    available: true,
    storeUrl: 'https://apps.apple.com/in/app/mybigbazaar/id6478912345',
    version: '1.2.0',
    minIosVersion: 'iOS 15.0 or higher',
    badgeText: 'Download on the App Store'
  },
  qrCodeUrl: 'https://cdn.mybigbazaar.in/assets/app-download-qr.svg',
  promoCode: 'FIRST20',
  promoDiscount: '20% OFF up to ₹200 on first order/booking'
});

// ==========================================
// 3. LANDING HERO & METRICS
// ==========================================
export const LANDING_HERO = Object.freeze({
  badge: "India's #1 Dual-Channel Community App",
  title: 'Buy, Sell Used Goods & Book Doorstep Home Experts',
  highlightText: 'Home Experts',
  subtitle:
    'One single app for everything local. Post free classifieds for cars, gadgets, and furniture—or instantly book Aadhaar-verified plumbers, electricians, tutors, and cleaners in minutes.',
  socialProof: {
    rating: '4.8/5',
    reviewCount: '50,000+',
    statement: 'Loved by 50,000+ neighbors across Indian cities'
  },
  statsRibbon: [
    { label: 'Verified Neighbors', value: '50,000+' },
    { label: 'Active Listings', value: '18,500+' },
    { label: 'Service Professionals', value: '3,200+' },
    { label: 'Cities Covered', value: '12 Major Metros' },
    { label: 'Safe Escrow Processed', value: '₹4.5 Cr+' }
  ]
});

// ==========================================
// 4. DUAL VERTICALS ARCHITECTURE
// ==========================================
export const DUAL_VERTICALS = Object.freeze({
  marketplace: {
    id: 'marketplace',
    badge: 'Classifieds Commerce',
    title: 'Pre-Loved Goods, Neighborly Deals',
    description:
      'Buy and sell electronics, two-wheelers, home furniture, books, and fashion right within your gated community or pin code. Chat directly, negotiate live offers, and deal with verified locals.',
    features: [
      'In-app bargaining with formal offer / counter-offer workflows',
      'Bank escrow protection: money held until item handoff inspection',
      'Real-time photo verification and AI fraud detection',
      'Zero seller commissions on standard classified listings'
    ],
    topCategories: ['Smartphones & Laptops', 'Bikes & Scooters', 'Living Room Furniture', 'Books & Study Materials', 'Sports Gear']
  },
  services: {
    id: 'services',
    badge: 'Doorstep Services',
    title: 'Verified Home Experts at Your Door in 30 Mins',
    description:
      'From emergency plumbing and fuse tripping to split AC jet cleaning and certified home tutoring. Transparent rate cards, background-checked specialists, and a 30-day rework warranty on all jobs.',
    features: [
      'Aadhaar-verified & background-checked service partners',
      'Pre-agreed transparent pricing with zero surprise charges',
      'Digital start OTP verification before technician enters your home',
      '30-day worry-free service rework guarantee'
    ],
    topCategories: ['Plumbers & Pipe Repairs', 'Certified Electricians', 'Split AC Jet Servicing', '1-on-1 Home Tutors', 'Deep Home Cleaning']
  }
});

// ==========================================
// 5. HOW IT WORKS WORKFLOWS
// ==========================================
export const HOW_IT_WORKS = Object.freeze({
  buyerSteps: [
    {
      step: 1,
      title: 'Discover Local Listings',
      desc: 'Browse pre-loved gadgets, vehicles, and furniture within 5 km of your location.'
    },
    {
      step: 2,
      title: 'Bargain & Agree on Price',
      desc: 'Use in-app chat to make an offer. Agree on the final price without exposing your phone number.'
    },
    {
      step: 3,
      title: 'Safe Pickup & Escrow Release',
      desc: 'Inspect the item in daylight. Confirm satisfaction in the app to release escrow funds to the seller.'
    }
  ],
  serviceSteps: [
    {
      step: 1,
      title: 'Select Service & Slot',
      desc: 'Pick from 40+ standardized home services with fixed, transparent rate cards.'
    },
    {
      step: 2,
      title: 'Verified Specialist Dispatched',
      desc: 'An Aadhaar-verified technician arrives at your doorstep with branded tools and safety credentials.'
    },
    {
      step: 3,
      title: 'Verify OTP & Enjoy 30-Day Warranty',
      desc: 'Share your 4-digit start OTP. Pay digitally after service completion backed by our 30-day guarantee.'
    }
  ]
});

// ==========================================
// 6. TRUST & SAFETY PILLARS
// ==========================================
export const TRUST_PILLARS = Object.freeze([
  {
    icon: '🪪',
    title: 'Aadhaar & KYC Checked',
    badge: '100% Verified Community',
    desc: 'Every seller profile and on-demand technician undergoes strict phone and government ID verification to eliminate anonymous bad actors.'
  },
  {
    icon: '🔒',
    title: 'Escrow Milestone Payments',
    badge: 'Zero Payment Risk',
    desc: 'Your funds remain securely protected in RBI-authorized banking escrow until you physically inspect the item or confirm complete service delivery.'
  },
  {
    icon: '💬',
    title: 'Private Number Masking',
    badge: 'Spam-Free Privacy',
    desc: 'Negotiate, chat, and share locations inside MyBigBazaar. Your private mobile number is never exposed to strangers or commercial telemarketers.'
  },
  {
    icon: '🛠️',
    title: '30-Day Service Guarantee',
    badge: 'Assured Re-service',
    desc: 'All home repairs and maintenance jobs carry our 30-day worry-free warranty. If an issue recurs, a technician returns to fix it with zero inspection fees.'
  }
]);

// ==========================================
// 7. COMPREHENSIVE FAQS REPOSITORY
// ==========================================
export const FAQS_CATALOG = Object.freeze([
  {
    id: 'faq-01',
    category: 'General',
    question: 'What is MyBigBazaar and how does it work?',
    answer:
      'MyBigBazaar is India’s unified hyperlocal super-app combining peer-to-peer classifieds (Buy & Sell) with on-demand doorstep home services. Everything is organized around your neighbourhood or pin code, allowing you to deal directly with verified locals.'
  },
  {
    id: 'faq-02',
    category: 'General',
    question: 'Is the MyBigBazaar mobile app free to download?',
    answer:
      'Yes, the MyBigBazaar app is 100% free to download on both Android (Google Play & direct APK) and iOS (Apple App Store). There are no membership fees for standard buyers or browsers.'
  },
  {
    id: 'faq-03',
    category: 'Buying & Selling',
    question: 'How does in-app bargaining and the Make Offer feature work?',
    answer:
      'When viewing any classified listing, you can tap "Make Offer" to propose a realistic price. The seller can Accept, Decline, or Counter your offer inside the chat. Once accepted, the deal price is locked and you can proceed to secure escrow checkout.'
  },
  {
    id: 'faq-04',
    category: 'Buying & Selling',
    question: 'How do I post a classified ad to sell my pre-owned items?',
    answer:
      'In the mobile app, tap the central "+ Sell" button, select your item category (Electronics, Vehicles, Furniture, etc.), upload up to 5 clear photos, write a short description, and set your asking price. Standard individual listings are completely free.'
  },
  {
    id: 'faq-05',
    category: 'Buying & Selling',
    question: 'Can I inspect the item before money is released to the seller?',
    answer:
      'Yes, absolutely! When paying through BigBazaar Safe-Deal Escrow, your payment is held securely in escrow. Only after you physically meet the seller, inspect the product, and tap "Confirm Receipt" in your app are the funds released.'
  },
  {
    id: 'faq-06',
    category: 'Doorstep Services',
    question: 'How are home service technicians verified?',
    answer:
      'Every service professional on MyBigBazaar undergoes government ID (Aadhaar/PAN) verification, criminal background review, and skill assessment before being certified to accept jobs in your neighbourhood.'
  },
  {
    id: 'faq-07',
    category: 'Doorstep Services',
    question: 'What happens if a booked technician does not show up?',
    answer:
      'If a specialist fails to arrive within the scheduled 30-minute arrival window, our dispatch engine immediately assigns the next nearest certified technician or provides you with an instant 100% refund plus a ₹100 service courtesy credit.'
  },
  {
    id: 'faq-08',
    category: 'Doorstep Services',
    question: 'How does the 30-day service warranty work?',
    answer:
      'All repairs, electrical fixes, plumbing installations, and AC servicing booked through MyBigBazaar include an automatic 30-day warranty. If the exact same issue resurfaces within 30 days, we dispatch a technician to re-inspect and fix it free of charge.'
  },
  {
    id: 'faq-09',
    category: 'Safety & Escrow',
    question: 'How does BigBazaar Safe-Deal Escrow protect my money?',
    answer:
      'Safe-Deal Escrow prevents payment fraud by holding buyer funds in an RBI-regulated escrow account. The seller or technician cannot access the funds until the buyer confirms in the app that the product was received as described or the service was successfully completed.'
  },
  {
    id: 'faq-10',
    category: 'Safety & Escrow',
    question: 'Why should I never pay via QR codes sent in chat?',
    answer:
      'Scanning a QR code or entering your UPI PIN always DEBITS money from your bank account—it never deposits money into it. Scammers frequently send fraudulent QR codes claiming "scan this to receive payment". All payments should be handled strictly through the app’s checkout flow.'
  },
  {
    id: 'faq-11',
    category: 'Safety & Escrow',
    question: 'Is my phone number visible to other users?',
    answer:
      'No. MyBigBazaar uses in-app number masking. When communicating with sellers, buyers, or service technicians, all chat and calls are routed through the app so your private mobile number is never disclosed.'
  },
  {
    id: 'faq-12',
    category: 'Partner Network',
    question: 'How can local electricians, plumbers, and tutors partner with MyBigBazaar?',
    answer:
      'Local skilled professionals can apply through our Partner page (/partner) or directly inside the app. Once Aadhaar credentials and trade experience are verified by our city operations team, you can start receiving high-paying daily neighbourhood jobs with zero commission on your first 50 leads.'
  }
]);

// ==========================================
// 8. LEGAL POLICIES & DOCUMENTS
// ==========================================
export const LEGAL_DOCUMENTS = Object.freeze({
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    version: '2.4.0',
    lastUpdated: 'September 15, 2026',
    summary:
      'These Terms of Service govern your use of the MyBigBazaar mobile application, website, and associated escrow and service booking facilities.',
    sections: [
      {
        heading: '1. User Eligibility and Account Integrity',
        content:
          'By creating an account on MyBigBazaar, you represent that you are at least 18 years of age and legally competent to enter into binding contracts under the Indian Contract Act, 1872. You must provide accurate, current, and complete mobile phone verification. Accounts found engaging in identity misrepresentation, duplicate account creation to manipulate ratings, or commercial spamming will be permanently suspended without notice.'
      },
      {
        heading: '2. Marketplace Listing Rules & Prohibited Items',
        content:
          'Sellers must own legal title to all goods listed on the marketplace. You agree not to list or transact in prohibited categories, including: counterfeit merchandise, prescription drugs and controlled substances, firearms and offensive weapons, stolen goods, hazardous materials, and adult content. MyBigBazaar reserves the right to remove any listing and report suspicious illegal activities to law enforcement authorities.'
      },
      {
        heading: '3. Safe-Deal Escrow & Payment Processing',
        content:
          'Payments made for marketplace physical goods and doorstep services may be routed through authorized nodal banking escrow facilities. The buyer authorizes MyBigBazaar to hold payment until the buyer confirms physical item inspection or satisfactory completion of the service appointment. Once confirmed or upon expiry of the 48-hour inspection window without a reported dispute, funds are released to the seller or service provider.'
      },
      {
        heading: '4. Service Booking, Cancellations & Rescheduling',
        content:
          'Customers may cancel or reschedule a scheduled home service appointment free of charge up to 2 hours before the technician’s allocated arrival window. Cancellations made within 2 hours of arrival may be subject to a nominal ₹99 dispatch surcharge to compensate the assigned technician for transit expenditure.'
      },
      {
        heading: '5. Limitation of Liability',
        content:
          'MyBigBazaar acts as a hyperlocal technology platform connecting independent buyers, sellers, and verified service contractors. To the maximum extent permitted by Indian law, MyBigBazaar’s aggregate liability for any claims arising under these terms shall not exceed the transaction amount or platform fee received for the specific transaction in dispute.'
      }
    ]
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    version: '2.1.2',
    lastUpdated: 'August 20, 2026',
    summary:
      'This Privacy Policy outlines how MyBigBazaar collects, stores, protects, and handles your personal information in compliance with the Digital Personal Data Protection (DPDP) Act.',
    sections: [
      {
        heading: '1. Information We Collect',
        content:
          'We collect information necessary to provide safe hyperlocal services: (a) Identity data: Full name, mobile number, and email address; (b) Geolocation data: Approximate and precise GPS coordinates used strictly to match you with nearby items and technicians within 5–10 km; (c) Transaction data: Order details, chat history, and invoice records. We do not store raw credit/debit card numbers or netbanking passwords.'
      },
      {
        heading: '2. Use of Mobile Phone Numbers & Number Masking',
        content:
          'Your mobile number is used strictly for account security and authentication (OTP). We utilize in-app virtual number masking so that neither buyers nor sellers nor service providers ever view your actual personal telephone number during communications.'
      },
      {
        heading: '3. Data Security & Storage in India',
        content:
          'All user data is stored within certified data centers located inside the Republic of India, using 256-bit AES encryption at rest and TLS 1.3 encryption in transit. We maintain strict role-based access control (RBAC) ensuring only authorized trust & moderation staff can view flagged records.'
      },
      {
        heading: '4. Third-Party Sharing Restrictions',
        content:
          'We never sell, rent, or trade your personal data or browsing behavior to third-party advertising brokers or loan telemarketers. We share information only with: (a) Payment aggregator partners licensed by the Reserve Bank of India; and (b) Judicial or law enforcement bodies when mandated by court order or formal statutory investigation.'
      },
      {
        heading: '5. Data Protection Officer (DPO) Contact',
        content:
          'In accordance with Indian information technology regulations, if you have any questions, grievance redressal requests, or wish to exercise your right to account erasure, please contact our Data Protection Officer at: dpo@mybigbazaar.com.'
      }
    ]
  },
  refunds: {
    id: 'refunds',
    title: 'Refund & Cancellation Policy',
    version: '1.9.0',
    lastUpdated: 'September 01, 2026',
    summary:
      'Clear, transparent terms regarding escrow refunds, appointment cancellations, and service rework procedures.',
    sections: [
      {
        heading: '1. Classifieds Escrow Protection Refunds',
        content:
          'When purchasing an item using BigBazaar Safe-Deal Escrow, your funds remain in escrow until you inspect the item in person. If the item is defective, counterfeit, or significantly different from the seller’s ad description, you may reject the item in the app. Upon rejection, 100% of your escrow deposit is immediately initiated for refund to your original payment source (UPI/Card) within 24–48 banking hours.'
      },
      {
        heading: '2. Doorstep Service Appointment Cancellations',
        content:
          'Customers may cancel any scheduled service job through the app with zero cancellation fee up to 2 hours prior to the booked time slot. If cancelled less than 2 hours before the slot when the technician has already started transit, a ₹99 technician dispatch compensation fee will be deducted.'
      },
      {
        heading: '3. 30-Day Service Re-Work Guarantee',
        content:
          'If the service performed (such as electrical repair, plumbing pipe joint, or AC cooling) fails to meet agreed standards or experiences recurrence within 30 calendar days, MyBigBazaar will dispatch a senior technician to re-service the problem at zero additional cost. If the issue remains unresolved after re-service, you are entitled to a full 100% refund of the service fee.'
      },
      {
        heading: '4. Refund Processing Timelines',
        content:
          'UPI and digital wallet refunds are credited instantly or within 2 hours. Credit card, debit card, and netbanking refunds are processed through banking channels and typically reflect in your bank statement within 3 to 5 business days.'
      }
    ]
  },
  safety: {
    id: 'safety',
    title: 'Trust, Safety & Escrow Guidelines',
    version: '2.0.0',
    lastUpdated: 'September 10, 2026',
    summary:
      'Essential safety best practices for conducting safe peer-to-peer neighborhood transactions and home service appointments.',
    sections: [
      {
        heading: '1. Safe Meeting Places for In-Person Pickups',
        content:
          'Always arrange to meet sellers or buyers in busy, well-lit public places during daylight hours. Ideal locations include metro station concourses, cafe lobbies, residential society clubhouses, or shopping mall parking lots. Never agree to meet in isolated or secluded locations.'
      },
      {
        heading: '2. Beware of Advance Courier & QR Code Payment Scams',
        content:
          'Never transfer money in advance via UPI for shipping, courier charges, or "token booking fees" to unverified strangers. Be particularly alert to "Scan QR to Receive Money" fraud: scanning a QR code or entering your UPI MPIN will always withdraw money from your account, never deposit it.'
      },
      {
        heading: '3. Verifying In-Home Service Technicians',
        content:
          'Before allowing any service technician into your home: (a) Check their name and photo in the active booking screen of your MyBigBazaar app; (b) Ask to see their company ID card; and (c) Share the 4-digit start OTP only after they arrive and confirm their identity.'
      },
      {
        heading: '4. Reporting Suspicious Accounts & Dispute Escalation',
        content:
          'If you encounter an abusive user, suspected stolen goods, or off-platform payment demands, tap "Report" directly on the user profile, ad listing, or chat screen. Our 24/7 Trust & Moderation team reviews critical safety flags within 15 minutes.'
      }
    ]
  }
});

export default {
  BRAND_CONFIG,
  STORE_DOWNLOAD_CONFIG,
  LANDING_HERO,
  DUAL_VERTICALS,
  HOW_IT_WORKS,
  TRUST_PILLARS,
  FAQS_CATALOG,
  LEGAL_DOCUMENTS
};
