/**
 * @file seedMarketplaceChats.js
 * @description Seeds 10 realistic Buyer <-> Seller Ad Chat Conversations & Offer Negotiations
 * linked to the live Marketplace Listings in MongoDB:
 * - 6 BUYING threads where Mobile User (Aarav Sharma, +919876543210) is chatting with Sellers about their posted ads
 * - 4 SELLING threads where Buyers (Priya Nair, Rohan Verma, Sneha Patel, Vikram Singh) are chatting with Aarav Sharma about HIS posted ads
 * Includes text inquiries, pending price offers, seller counter-offers, accepted deals, and an Admin Trust & Safety notice.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

dotenv.config();

async function runSeedChats() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  // Clear existing conversations & messages for a clean, deduplicated state
  await Message.deleteMany({});
  await Conversation.deleteMany({});

  // Find users
  const adminUser =
    (await User.findOne({ email: 'admin@mybigbazaar.com' })) ||
    (await User.findOne({ role: 'admin' }));
  const aaravUser =
    (await User.findOne({ phoneNumber: '+919876543210' })) ||
    (await User.findOne({ fullName: /Aarav Sharma/i }));

  const buyers = await User.find({
    email: { $in: ['priya.nair@gmail.com', 'rohan.verma@gmail.com', 'vikram.singh@gmail.com'] }
  });

  const priya = buyers.find((u) => /Priya/i.test(u.fullName)) || buyers[0] || adminUser;
  const rohan = buyers.find((u) => /Rohan/i.test(u.fullName)) || buyers[1] || adminUser;
  const sneha = buyers.find((u) => /Vikram/i.test(u.fullName)) || buyers[2] || adminUser;
  const vikram = buyers[0] || adminUser;

  // Fetch Admin listings (where seller != Aarav) and Aarav's mobile listings
  const adminListings = await Listing.find({ sellerId: { $ne: aaravUser?._id } }).limit(55);
  const aaravListings = await Listing.find({ sellerId: aaravUser?._id }).limit(15);

  const pickAdminListing = (keyword, fallbackIdx) =>
    adminListings.find((l) => new RegExp(keyword, 'i').test(l.title || '')) ||
    adminListings[fallbackIdx % Math.max(1, adminListings.length)];

  const pickAaravListing = (keyword, fallbackIdx) =>
    aaravListings.find((l) => new RegExp(keyword, 'i').test(l.title || '')) ||
    aaravListings[fallbackIdx % Math.max(1, aaravListings.length)] ||
    pickAdminListing(keyword, fallbackIdx);

  const threadsSpec = [
    // =====================================================
    // A. 6 BUYING THREADS (Aarav Sharma is BUYER inquiring on Posted Ads)
    // =====================================================
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'Rajesh Motors Elite',
      sellerPhone: '+91 98260 11223',
      listing: pickAdminListing('Swift|Nexon|City|Thar', 0),
      important: true,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hi! Is this car still available in Indore? Are service records available at the authorized showroom?',
          minutesAgo: 180
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Hello Aarav! Yes, it is available. Complete authorized showroom service history and zero-dep insurance are active.',
          minutesAgo: 165
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.91,
          offerStatus: 'countered',
          counterRatio: 0.95,
          minutesAgo: 140
        },
        {
          role: 'seller',
          type: 'text',
          text: 'I have shared a counter offer. We can meet at Vijay Nagar Square today at 5 PM for a test drive!',
          minutesAgo: 120
        }
      ]
    },
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'iStore Certified Reseller',
      sellerPhone: '+91 98260 44556',
      listing: pickAdminListing('Samsung|OnePlus|Xiaomi|Pixel', 5),
      important: true,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hello, does the phone come with original box, charging cable, and GST invoice?',
          minutesAgo: 240
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Yes, 100% scratchless condition with original box, unused cable, and official bill.',
          minutesAgo: 225
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.93,
          offerStatus: 'accepted',
          minutesAgo: 200
        },
        {
          role: 'system',
          type: 'system',
          text: 'Deal confirmed! Seller accepted your offer. You can now proceed to checkout.',
          minutesAgo: 195
        }
      ]
    },
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'Skyline Realty Group',
      sellerPhone: '+91 98260 77889',
      listing: pickAdminListing('BHK|Villa|Apartment|Office', 3),
      important: false,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hi, is this property RERA approved and ready to move? Can we schedule a site visit this weekend?',
          minutesAgo: 320
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Yes Sir, it is RERA registered with covered car parking and clubhouse access. Saturday 11 AM works great for a visit.',
          minutesAgo: 300
        },
        {
          role: 'buyer',
          type: 'text',
          text: 'Great, please share the exact landmark near Vijay Nagar.',
          minutesAgo: 280
        }
      ]
    },
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'TechVault Studio',
      sellerPhone: '+91 98260 99001',
      listing: pickAdminListing('MacBook|Sony|LG|Canon', 10),
      important: false,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'What is the battery cycle count and warranty status on this unit?',
          minutesAgo: 410
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Battery health is 98% with only 24 cycles. Official brand warranty is valid for 8 more months.',
          minutesAgo: 390
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.90,
          offerStatus: 'pending',
          minutesAgo: 360
        }
      ]
    },
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'Royal Paws Kennel',
      sellerPhone: '+91 98260 33445',
      listing: pickAdminListing('Retriever|Husky|Persian|Beagle', 18),
      important: false,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Are KCI registration papers and vaccination record cards ready?',
          minutesAgo: 520
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Yes, both first and second vaccinations are completed by a certified vet and KCI microchip papers are ready.',
          minutesAgo: 495
        }
      ]
    },
    {
      mode: 'BUYING',
      buyer: aaravUser,
      buyerName: 'Aarav Sharma',
      buyerPhone: '+91 98765 43210',
      seller: adminUser,
      sellerName: 'MotoHub Superbikes',
      sellerPhone: '+91 98260 66778',
      listing: pickAdminListing('Duke| Splendor|Activa|Hunter|MT-15', 8),
      important: false,
      status: 'flagged',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Can I inspect the bike today evening? Are both keys available?',
          minutesAgo: 610
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Yes, both original keys and smart card RC are ready for instant transfer.',
          minutesAgo: 590
        },
        {
          role: 'admin',
          type: 'admin_notice',
          text: 'BigBazaar Safe-Deal Reminder: Always verify RC smart card and chassis number in person before making payment.',
          minutesAgo: 560
        }
      ]
    },

    // =====================================================
    // B. 4 SELLING THREADS (Other Buyers messaging Aarav Sharma on HIS Posted Ads)
    // =====================================================
    {
      mode: 'SELLING',
      buyer: priya,
      buyerName: priya?.fullName || 'Priya Nair',
      buyerPhone: priya?.phoneNumber || '+91 98111 22334',
      seller: aaravUser,
      sellerName: 'Aarav Sharma',
      sellerPhone: '+91 98765 43210',
      listing: pickAaravListing('Creta', 0),
      important: true,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hi Aarav! I saw your 2022 Hyundai Creta SX (O) Diesel AT ad. Is it first-owner and accident-free?',
          minutesAgo: 95
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Hi Priya! Yes, single hand driven in Indore, 28,500 km on odometer with full Hyundai service history.',
          minutesAgo: 80
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.94,
          offerStatus: 'pending',
          minutesAgo: 45
        },
        {
          role: 'buyer',
          type: 'text',
          text: 'I have sent an offer above. Can pay full amount via RTGS/UPI today if we close the deal!',
          minutesAgo: 40
        }
      ]
    },
    {
      mode: 'SELLING',
      buyer: rohan,
      buyerName: rohan?.fullName || 'Rohan Verma',
      buyerPhone: rohan?.phoneNumber || '+91 98222 33445',
      seller: aaravUser,
      sellerName: 'Aarav Sharma',
      sellerPhone: '+91 98765 43210',
      listing: pickAaravListing('iPhone 15 Pro Max', 1),
      important: true,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hey Aarav, is your iPhone 15 Pro Max Natural Titanium still available? Is AppleCare+ active?',
          minutesAgo: 150
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Hey Rohan! Yes, 96% battery health, Indian unit with original box and bill.',
          minutesAgo: 135
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.92,
          offerStatus: 'countered',
          counterRatio: 0.96,
          minutesAgo: 110
        }
      ]
    },
    {
      mode: 'SELLING',
      buyer: sneha,
      buyerName: sneha?.fullName || 'Sneha Patel',
      buyerPhone: sneha?.phoneNumber || '+91 98333 44556',
      seller: aaravUser,
      sellerName: 'Aarav Sharma',
      sellerPhone: '+91 98765 43210',
      listing: pickAaravListing('Royal Enfield|Classic 350', 2),
      important: false,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hello Aarav, interested in your Royal Enfield Classic 350 Halcyon Black. Are alloy wheels and touring seat included?',
          minutesAgo: 210
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Yes Sneha, genuine Royal Enfield touring seat and crash guard are installed.',
          minutesAgo: 190
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.95,
          offerStatus: 'accepted',
          minutesAgo: 170
        },
        {
          role: 'system',
          type: 'system',
          text: 'Deal confirmed! Offer accepted for Royal Enfield Classic 350.',
          minutesAgo: 168
        }
      ]
    },
    {
      mode: 'SELLING',
      buyer: vikram,
      buyerName: vikram?.fullName || 'Vikram Singh',
      buyerPhone: vikram?.phoneNumber || '+91 98444 55667',
      seller: aaravUser,
      sellerName: 'Aarav Sharma',
      sellerPhone: '+91 98765 43210',
      listing: pickAaravListing('Sofa|Lounger', 5),
      important: false,
      status: 'active',
      messages: [
        {
          role: 'buyer',
          type: 'text',
          text: 'Hi Aarav, what are the exact dimensions of the 6-Seater L-Shaped Velvet Sofa? Any stains or tears?',
          minutesAgo: 310
        },
        {
          role: 'seller',
          type: 'text',
          text: 'Hi Vikram! It is 9ft x 6.5ft, dry-cleaned last week, zero stains or tears.',
          minutesAgo: 290
        },
        {
          role: 'buyer',
          type: 'offer',
          offerRatio: 0.88,
          offerStatus: 'pending',
          minutesAgo: 260
        }
      ]
    }
  ];

  let totalConvs = 0;
  let totalMsgs = 0;

  for (const spec of threadsSpec) {
    const listing = spec.listing;
    const askingPrice = Number(listing?.price || listing?.productPrice || 45000);
    const listingTitle = listing?.title || listing?.productName || 'Classified Listing';
    const listingImage =
      (Array.isArray(listing?.images) && listing.images[0]) ||
      listing?.imageUrl ||
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80';
    const listingCategory = listing?.category || listing?.categoryName || 'Cars';
    const listingLocation =
      typeof listing?.location === 'string'
        ? listing.location
        : listing?.location?.city
        ? `${listing.location.area ? listing.location.area + ', ' : ''}${listing.location.city}`
        : 'Vijay Nagar, Indore';

    const conv = await Conversation.create({
      participants: [spec.buyer._id, spec.seller._id],
      buyerId: spec.buyer._id,
      buyerName: spec.buyerName,
      buyerPhone: spec.buyerPhone,
      sellerId: spec.seller._id,
      sellerName: spec.sellerName,
      sellerPhone: spec.sellerPhone,
      listingId: listing?._id || null,
      listingTitle,
      listingPrice: askingPrice,
      listingImage,
      listingCategory,
      listingLocation,
      important: Boolean(spec.important),
      status: spec.status || 'active',
      lastMessage: {
        text: '',
        senderId: spec.buyer._id,
        senderName: spec.buyerName,
        messageType: 'text',
        createdAt: new Date()
      }
    });

    let lastMsgDoc = null;

    for (const m of spec.messages) {
      const msgTime = new Date(Date.now() - (m.minutesAgo || 10) * 60 * 1000);
      const senderId =
        m.role === 'buyer'
          ? spec.buyer._id
          : m.role === 'seller'
          ? spec.seller._id
          : adminUser?._id || spec.seller._id;
      const senderName =
        m.role === 'buyer'
          ? spec.buyerName
          : m.role === 'seller'
          ? spec.sellerName
          : m.role === 'admin'
          ? 'BigBazaar Trust & Safety Admin'
          : 'System';

      let offerDetails = null;
      let text = m.text || '';

      if (m.type === 'offer') {
        const offerAmt = Math.round((askingPrice * (m.offerRatio || 0.9)) / 100) * 100;
        const counterAmt = m.counterRatio
          ? Math.round((askingPrice * m.counterRatio) / 100) * 100
          : null;
        offerDetails = {
          amount: offerAmt,
          askingPrice,
          status: m.offerStatus || 'pending',
          counterAmount: counterAmt
        };
        text = `Made an offer of ₹${offerAmt.toLocaleString('en-IN')}`;
      }

      const createdMsg = await Message.create({
        conversationId: conv._id,
        senderId,
        senderName,
        senderRole: m.role,
        text,
        messageType: m.type,
        offerDetails,
        isRead: m.minutesAgo > 60,
        createdAt: msgTime,
        updatedAt: msgTime
      });

      lastMsgDoc = createdMsg;
      totalMsgs += 1;
    }

    if (lastMsgDoc) {
      conv.lastMessage = {
        text: lastMsgDoc.text,
        senderId: lastMsgDoc.senderId,
        senderName: lastMsgDoc.senderName,
        messageType: lastMsgDoc.messageType,
        offerAmount: lastMsgDoc.offerDetails?.amount || null,
        offerStatus: lastMsgDoc.offerDetails?.status || null,
        createdAt: lastMsgDoc.createdAt
      };
      conv.updatedAt = lastMsgDoc.createdAt;
      await conv.save();
    }

    totalConvs += 1;
  }

  console.log(`✓ Seeded ${totalConvs} Buyer <-> Seller Ad Conversations (6 BUYING + 4 SELLING) with ${totalMsgs} messages & offer negotiations.`);
  await mongoose.disconnect();
  process.exit(0);
}

runSeedChats().catch((err) => {
  console.error('Seed chats error:', err);
  process.exit(1);
});
