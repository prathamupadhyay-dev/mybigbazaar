/**
 * @file apps/api/seeds/seedAdmin.js
 * @description Seeds default administrative and operational persona accounts
 */

import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { Roles, KycStatus } from '../config/constants.js';

export const seedAdmin = async () => {
  console.log('[SEED] Seeding operational role accounts...'.cyan);

  const defaultAccounts = [
    {
      fullName: 'Platform Administrator',
      email: 'admin@bigbazaar.com',
      phoneNumber: '+91 9876543210',
      password: 'Admin@123456',
      role: Roles.ADMIN,
      userTypes: ['buyer', 'seller', 'admin'],
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true
    },
    {
      fullName: 'Safety Moderator',
      email: 'moderator@bigbazaar.com',
      phoneNumber: '+91 9876543211',
      password: 'Mod@123456',
      role: Roles.MODERATOR,
      userTypes: ['buyer'],
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true
    },
    {
      fullName: 'Top Verified Seller',
      email: 'seller@bigbazaar.com',
      phoneNumber: '+91 9876543212',
      password: 'Seller@123456',
      role: Roles.SELLER,
      userTypes: ['seller'],
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true
    },
    {
      fullName: 'Certified Service Partner',
      email: 'provider@bigbazaar.com',
      phoneNumber: '+91 9876543213',
      password: 'Provider@123456',
      role: Roles.PROVIDER,
      userTypes: ['seller', 'provider'],
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: KycStatus.VERIFIED
    },
    {
      fullName: 'Regular Shopper',
      email: 'buyer@bigbazaar.com',
      phoneNumber: '+91 9876543214',
      password: 'Buyer@123456',
      role: Roles.BUYER,
      userTypes: ['buyer'],
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true
    }
  ];

  for (const acc of defaultAccounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create(acc);
      console.log(`[SEED] Created default account: ${acc.email} (${acc.role})`.green);
    } else {
      user.password = acc.password;
      user.role = acc.role;
      user.status = 'active';
      await user.save();
      console.log(`[SEED] Synchronized default account: ${acc.email} (${acc.role})`.yellow);
    }

    // If provider, ensure verified ProviderProfile exists
    if (acc.role === Roles.PROVIDER) {
      await ProviderProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $setOnInsert: {
            userId: user._id,
            businessName: 'Kottayam Express Services & Repair',
            experienceYears: 5,
            bio: 'Certified repair & home maintenance experts with 5+ years of verified service in Kerala.',
            kycStatus: KycStatus.VERIFIED,
            serviceAreas: ['Kottayam', 'Changanassery', 'Pala'],
            rating: 4.9,
            reviewCount: 28,
            isAvailable: true
          }
        },
        { upsert: true }
      );
    }
  }

  console.log('[SEED] Operational accounts ready!'.green);
};

export default seedAdmin;
