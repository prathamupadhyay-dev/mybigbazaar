import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Banner from '../models/Banner.js';
import StaticPage from '../models/StaticPage.js';
import CMSPage from '../models/CMSPage.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { storageProvider } from '../providers/storage/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../public/uploads');

const VALID_PLACEMENTS = new Set(['home_hero', 'onboarding', 'services', 'promotions', 'home', 'marketplace']);

function normalizePlacement(raw) {
  if (!raw) return 'home_hero';
  const s = String(raw).trim().toLowerCase();
  if (VALID_PLACEMENTS.has(s)) return s;
  return 'home_hero';
}

function parseActiveBoolean(statusVal, isActiveVal, fallback = true) {
  if (statusVal !== undefined && statusVal !== null && statusVal !== '') {
    const s = String(statusVal).trim().toLowerCase();
    if (s === 'inactive' || s === 'false' || s === '0') return false;
    if (s === 'active' || s === 'true' || s === '1') return true;
  }
  if (isActiveVal !== undefined && isActiveVal !== null && isActiveVal !== '') {
    if (typeof isActiveVal === 'boolean') return isActiveVal;
    const s = String(isActiveVal).trim().toLowerCase();
    if (s === 'false' || s === '0' || s === 'inactive') return false;
    if (s === 'true' || s === '1' || s === 'active') return true;
  }
  return fallback;
}

// Resequence active banners sequentially starting from 1 and remove inactive banners from slot sequence
const resequenceActiveBanners = async (placement) => {
  const placementFilter = (placement === 'home_hero' || placement === 'home' || !placement)
    ? { placement: { $in: ['home_hero', 'home', 'hero_banner_slider'] } }
    : { placement };

  const activeBanners = await Banner.find({ ...placementFilter, isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  for (let i = 0; i < activeBanners.length; i++) {
    const desired = i + 1;
    if (activeBanners[i].sortOrder !== desired) {
      activeBanners[i].sortOrder = desired;
      await activeBanners[i].save();
    }
  }
};

// ==========================================
// 1. GET BANNERS
// ==========================================
export const getBanners = asyncHandler(async (req, res) => {
  const { placement, all } = req.query;
  const targetPlacement = normalizePlacement(placement);
  const includeAll = all === 'true' || all === '1' || req.originalUrl?.includes('get-all');

  await resequenceActiveBanners(targetPlacement);

  const placementFilter = (targetPlacement === 'home_hero' || targetPlacement === 'home')
    ? { placement: { $in: ['home_hero', 'home', 'hero_banner_slider'] } }
    : { placement: targetPlacement };

  if (includeAll) {
    const activeBanners = await Banner.find({ ...placementFilter, isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    const inactiveBanners = await Banner.find({ ...placementFilter, isActive: false }).sort({ updatedAt: -1, createdAt: -1 });

    const formattedActive = activeBanners.map((b, idx) => {
      const slotNum = idx + 1;
      const impressions = b.impressions || 0;
      const clicks = b.clicks || 0;
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0%';
      return {
        _id: b._id,
        id: b._id.toString(),
        title: b.title,
        subtitle: b.subtitle || '',
        imageUrl: b.imageUrl,
        image: b.imageUrl,
        targetScreen: b.targetScreen || 'ProductList',
        linkUrl: b.linkUrl || '',
        deepLink: b.linkUrl || '',
        ctaText: b.ctaText || 'Shop Now',
        tag: b.tag || 'Special Offer',
        placement: b.placement,
        sortOrder: slotNum,
        order: slotNum,
        position: slotNum,
        slot: slotNum,
        isActive: true,
        status: 'Active',
        impressions,
        clicks,
        ctr,
        validUntil: b.validUntil || '2026-12-31',
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      };
    });

    const formattedInactive = inactiveBanners.map((b) => {
      const impressions = b.impressions || 0;
      const clicks = b.clicks || 0;
      const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0%';
      const savedPos = b.sortOrder ?? 0;
      return {
        _id: b._id,
        id: b._id.toString(),
        title: b.title,
        subtitle: b.subtitle || '',
        imageUrl: b.imageUrl,
        image: b.imageUrl,
        targetScreen: b.targetScreen || 'ProductList',
        linkUrl: b.linkUrl || '',
        deepLink: b.linkUrl || '',
        ctaText: b.ctaText || 'Shop Now',
        tag: b.tag || 'Special Offer',
        placement: b.placement,
        sortOrder: savedPos,
        order: savedPos,
        position: savedPos,
        slot: null,
        isActive: false,
        status: 'Inactive',
        impressions,
        clicks,
        ctr,
        validUntil: b.validUntil || '2026-12-31',
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      };
    });

    const combined = [...formattedActive, ...formattedInactive];

    return res.status(200).json({
      status: true,
      success: true,
      count: combined.length,
      data: combined,
      banners: combined,
      activeCount: formattedActive.length,
      inactiveCount: formattedInactive.length
    });
  }

  const banners = await Banner.find({ ...placementFilter, isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  const formatted = banners.map((b, idx) => {
    const slotNum = idx + 1;
    const impressions = b.impressions || 0;
    const clicks = b.clicks || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0%';
    return {
      _id: b._id,
      id: b._id.toString(),
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      image: b.imageUrl,
      targetScreen: b.targetScreen || 'ProductList',
      linkUrl: b.linkUrl || '',
      deepLink: b.linkUrl || '',
      ctaText: b.ctaText || 'Shop Now',
      tag: b.tag || 'Special Offer',
      placement: b.placement,
      sortOrder: slotNum,
      order: slotNum,
      position: slotNum,
      slot: slotNum,
      isActive: true,
      status: 'Active',
      impressions,
      clicks,
      ctr,
      validUntil: b.validUntil || '2026-12-31',
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    };
  });

  res.status(200).json({
    status: true,
    success: true,
    count: formatted.length,
    data: formatted,
    banners: formatted
  });
});

export const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    targetScreen,
    linkUrl,
    deepLink,
    ctaText,
    tag,
    placement,
    sortOrder,
    order,
    position,
    validUntil,
    isActive,
    status,
    slotAction // 'swap' | 'shift' | 'replace'
  } = req.body;

  const bannerTitle = (title && title.trim()) || `Hero Banner ${Date.now()}`;

  let imageUrl = req.body.imageUrl || (typeof req.body.image === 'string' ? req.body.image : '') || '';
  if (req.file) {
    imageUrl = storageProvider.getFileUrl(req.file.filename);
  } else if (Array.isArray(req.files) && req.files.length > 0) {
    imageUrl = storageProvider.getFileUrl(req.files[0].filename);
  }

  if (!imageUrl) {
    throw ApiError.badRequest('Banner image is required');
  }

  const activeFlag = parseActiveBoolean(status, isActive, true);
  const targetPlacement = normalizePlacement(placement);
  const placementFilter = (targetPlacement === 'home_hero' || targetPlacement === 'home')
    ? { placement: { $in: ['home_hero', 'home', 'hero_banner_slider'] } }
    : { placement: targetPlacement };

  let assignedSlot = 999;

  if (activeFlag) {
    if (targetPlacement === 'promotions') {
      await Banner.updateMany(
        { placement: 'promotions' },
        { $set: { isActive: false, sortOrder: 999 } }
      );
    }

    const requestedSlot = Math.max(1, parseInt(sortOrder ?? order ?? position, 10) || 1);
    assignedSlot = requestedSlot;

    if (slotAction === 'shift') {
      await Banner.updateMany(
        { ...placementFilter, isActive: true, sortOrder: { $gte: requestedSlot } },
        { $inc: { sortOrder: 1 } }
      );
    } else if (slotAction === 'replace') {
      await Banner.updateMany(
        { ...placementFilter, isActive: true, sortOrder: requestedSlot },
        { $set: { isActive: false, sortOrder: 999 } }
      );
    } else {
      const existingAtSlot = await Banner.findOne({ ...placementFilter, isActive: true, sortOrder: requestedSlot });
      if (existingAtSlot) {
        const activeCount = await Banner.countDocuments({ ...placementFilter, isActive: true });
        existingAtSlot.sortOrder = activeCount + 1;
        await existingAtSlot.save();
      }
    }
  }

  const resolvedLink = linkUrl || deepLink || '';

  const banner = await Banner.create({
    title: bannerTitle,
    subtitle: subtitle ? subtitle.trim() : '',
    imageUrl,
    targetScreen: targetScreen || 'ProductList',
    linkUrl: resolvedLink,
    ctaText: ctaText || 'Shop Now',
    tag: tag || 'Special Offer',
    placement: targetPlacement,
    sortOrder: assignedSlot,
    validUntil: validUntil || '2026-12-31',
    isActive: activeFlag,
    impressions: 0,
    clicks: 0
  });

  await resequenceActiveBanners(targetPlacement);

  const updatedBanner = await Banner.findById(banner._id);
  const responseObj = {
    ...updatedBanner.toObject(),
    id: updatedBanner._id.toString(),
    image: updatedBanner.imageUrl,
    deepLink: updatedBanner.linkUrl || '',
    position: activeFlag ? updatedBanner.sortOrder : null,
    slot: activeFlag ? updatedBanner.sortOrder : null,
    status: activeFlag ? 'Active' : 'Inactive',
    ctr: '0%'
  };

  res.status(201).json({
    status: true,
    success: true,
    message: activeFlag
      ? `Banner published to Slot #${updatedBanner.sortOrder}`
      : 'Banner saved as Inactive (Off-Carousel)',
    data: responseObj,
    banner: responseObj
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }

  const {
    title,
    subtitle,
    targetScreen,
    linkUrl,
    deepLink,
    ctaText,
    tag,
    placement,
    sortOrder,
    order,
    position,
    validUntil,
    isActive,
    status,
    imageUrl: bodyImageUrl,
    slotAction
  } = req.body;

  if (title) banner.title = title.trim();
  if (subtitle !== undefined) banner.subtitle = subtitle.trim();
  if (targetScreen !== undefined) banner.targetScreen = targetScreen;
  if (linkUrl !== undefined || deepLink !== undefined) banner.linkUrl = linkUrl ?? deepLink;
  if (ctaText !== undefined) banner.ctaText = ctaText;
  if (tag !== undefined) banner.tag = tag;
  if (placement) banner.placement = normalizePlacement(placement);
  if (validUntil !== undefined) banner.validUntil = validUntil;

  const nextActive = parseActiveBoolean(status, isActive, banner.isActive);

  const targetPlacement = banner.placement || 'home_hero';
  const placementFilter = (targetPlacement === 'home_hero' || targetPlacement === 'home')
    ? { placement: { $in: ['home_hero', 'home', 'hero_banner_slider'] } }
    : { placement: targetPlacement };

  const requestedSlotRaw = sortOrder ?? order ?? position;

  if (banner.isActive && !nextActive) {
    banner.isActive = false;
    banner.sortOrder = requestedSlotRaw !== undefined ? Math.max(1, parseInt(requestedSlotRaw, 10) || 1) : 999;
  } else if (!banner.isActive && nextActive) {
    if (targetPlacement === 'promotions') {
      await Banner.updateMany(
        { placement: 'promotions', _id: { $ne: banner._id } },
        { $set: { isActive: false, sortOrder: 999 } }
      );
    }
    banner.isActive = true;
    const requestedSlot = parseInt(requestedSlotRaw, 10);
    if (requestedSlot && requestedSlot > 0) {
      banner.sortOrder = requestedSlot;
    } else {
      const activeCount = await Banner.countDocuments({ ...placementFilter, _id: { $ne: banner._id }, isActive: true });
      banner.sortOrder = activeCount + 1;
    }
  } else if (banner.isActive && nextActive) {
    if (requestedSlotRaw !== undefined) {
      const newSlot = Math.max(1, parseInt(requestedSlotRaw, 10) || 1);
      const oldSlot = banner.sortOrder || 1;
      if (newSlot !== oldSlot) {
        if (slotAction === 'shift') {
          await Banner.updateMany(
            { _id: { $ne: banner._id }, ...placementFilter, isActive: true, sortOrder: { $gte: newSlot } },
            { $inc: { sortOrder: 1 } }
          );
        } else if (slotAction === 'replace') {
          await Banner.updateMany(
            { _id: { $ne: banner._id }, ...placementFilter, isActive: true, sortOrder: newSlot },
            { $set: { isActive: false, sortOrder: 999 } }
          );
        } else {
          await Banner.updateMany(
            { _id: { $ne: banner._id }, ...placementFilter, isActive: true, sortOrder: newSlot },
            { $set: { sortOrder: oldSlot } }
          );
        }
        banner.sortOrder = newSlot;
      }
    }
  }

  if (req.file) {
    banner.imageUrl = storageProvider.getFileUrl(req.file.filename);
  } else if (Array.isArray(req.files) && req.files.length > 0) {
    banner.imageUrl = storageProvider.getFileUrl(req.files[0].filename);
  } else if (bodyImageUrl) {
    banner.imageUrl = bodyImageUrl;
  }

  await banner.save();
  await resequenceActiveBanners(targetPlacement);

  const freshBanner = await Banner.findById(banner._id);
  const impressions = freshBanner.impressions || 0;
  const clicks = freshBanner.clicks || 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0%';
  const responseObj = {
    ...freshBanner.toObject(),
    id: freshBanner._id.toString(),
    image: freshBanner.imageUrl,
    deepLink: freshBanner.linkUrl || '',
    position: freshBanner.sortOrder ?? 0,
    slot: freshBanner.sortOrder ?? 0,
    status: freshBanner.isActive ? 'Active' : 'Inactive',
    ctr
  };

  res.status(200).json({
    status: true,
    success: true,
    message: 'Banner updated successfully',
    data: responseObj,
    banner: responseObj
  });
});

export const reorderBanners = asyncHandler(async (req, res) => {
  const bannerIds = req.body.bannerIds || req.body.orderedIds;
  if (!Array.isArray(bannerIds)) {
    throw ApiError.badRequest('bannerIds must be an array of IDs in desired slot order');
  }

  const updates = bannerIds.map((id, index) => {
    return Banner.findByIdAndUpdate(id, { sortOrder: index + 1, isActive: true });
  });

  await Promise.all(updates);
  await resequenceActiveBanners('home_hero');

  res.status(200).json({
    status: true,
    success: true,
    message: 'Active banner carousel slots reordered successfully'
  });
});

export const toggleBannerStatus = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }

  const nextActive = parseActiveBoolean(req.body.status, req.body.isActive, !banner.isActive);

  const targetPlacement = banner.placement || 'home_hero';
  const placementFilter = (targetPlacement === 'home_hero' || targetPlacement === 'home')
    ? { placement: { $in: ['home_hero', 'home', 'hero_banner_slider'] } }
    : { placement: targetPlacement };

  if (!nextActive) {
    banner.isActive = false;
    banner.sortOrder = 999;
    await banner.save();
    await resequenceActiveBanners(targetPlacement);
  } else {
    if (targetPlacement === 'promotions' || req.body.singleActive) {
      await Banner.updateMany(
        { placement: targetPlacement, _id: { $ne: banner._id } },
        { $set: { isActive: false, sortOrder: 999 } }
      );
    }
    banner.isActive = true;
    const currentActiveCount = await Banner.countDocuments({ ...placementFilter, _id: { $ne: banner._id }, isActive: true });
    banner.sortOrder = currentActiveCount + 1;
    await banner.save();
    await resequenceActiveBanners(targetPlacement);
  }

  const freshBanner = await Banner.findById(banner._id);

  res.status(200).json({
    status: true,
    success: true,
    message: freshBanner.isActive
      ? `Banner activated and placed in Slot #${freshBanner.sortOrder}`
      : 'Banner deactivated and removed from active carousel slots',
    data: {
      id: freshBanner._id.toString(),
      isActive: freshBanner.isActive,
      status: freshBanner.isActive ? 'Active' : 'Inactive',
      slot: freshBanner.isActive ? freshBanner.sortOrder : null
    }
  });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }
  const placement = banner.placement;
  await banner.deleteOne();

  await resequenceActiveBanners(placement);

  res.status(200).json({
    status: true,
    success: true,
    message: 'Banner deleted and active carousel slots re-sequenced'
  });
});

// ==========================================
// 2. BANNER TELEMETRY & ANALYTICS
// ==========================================
export const trackBannerEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  const field = type === 'click' ? 'clicks' : 'impressions';

  const updated = await Banner.findByIdAndUpdate(
    id,
    { $inc: { [field]: 1 } },
    { new: true }
  );

  if (!updated) {
    return res.status(200).json({ status: true, success: true, message: 'Banner event logged' });
  }

  res.status(200).json({
    status: true,
    success: true,
    impressions: updated.impressions,
    clicks: updated.clicks
  });
});

export const getBannerAnalytics = asyncHandler(async (req, res) => {
  const banners = await Banner.find();

  let totalImpressions = 0;
  let totalClicks = 0;
  let activeBanners = 0;

  const placementStats = {
    home_hero: { impressions: 0, clicks: 0, count: 0 },
    onboarding: { impressions: 0, clicks: 0, count: 0 },
    services: { impressions: 0, clicks: 0, count: 0 },
    promotions: { impressions: 0, clicks: 0, count: 0 }
  };

  banners.forEach((b) => {
    const imp = b.impressions || 0;
    const clk = b.clicks || 0;
    totalImpressions += imp;
    totalClicks += clk;
    if (b.isActive) activeBanners++;

    const p = b.placement === 'home' ? 'home_hero' : (b.placement || 'home_hero');
    if (!placementStats[p]) {
      placementStats[p] = { impressions: 0, clicks: 0, count: 0 };
    }
    placementStats[p].impressions += imp;
    placementStats[p].clicks += clk;
    placementStats[p].count += 1;
  });

  const overallCtr = totalImpressions > 0
    ? ((totalClicks / totalImpressions) * 100).toFixed(1) + '%'
    : '0%';

  res.status(200).json({
    status: true,
    success: true,
    data: {
      totalBanners: banners.length,
      activeBanners,
      totalImpressions,
      totalClicks,
      overallCtr,
      placementStats
    }
  });
});

// ==========================================
// 2. STATIC & DYNAMIC CMS PAGES
// ==========================================
export const getAllCMSPages = asyncHandler(async (req, res) => {
  const pages = await CMSPage.find().sort({ updatedAt: -1 });
  res.status(200).json({
    status: true,
    success: true,
    count: pages.length,
    data: pages
  });
});

const POLICY_ALIASES = {
  'terms-and-conditions': ['terms-and-conditions', 'terms-of-service', 'terms'],
  'terms-of-service': ['terms-and-conditions', 'terms-of-service', 'terms'],
  'terms': ['terms-and-conditions', 'terms-of-service', 'terms'],
  'privacy-policy': ['privacy-policy', 'privacy'],
  'privacy': ['privacy-policy', 'privacy'],
  'refund-policy': ['refund-policy', 'refunds', 'refund-and-cancellation-policy'],
  'refunds': ['refund-policy', 'refunds', 'refund-and-cancellation-policy'],
  'trust-safety': ['trust-safety', 'safety'],
  'safety': ['trust-safety', 'safety'],
  'buyer-protection': ['buyer-protection', 'buyerProtection']
};

export const getStaticPage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const aliases = POLICY_ALIASES[slug] || [slug];
  let page = await CMSPage.findOne({ slug: { $in: aliases } });

  if (!page) {
    page = await StaticPage.findOne({ slug: { $in: aliases } });
  }

  if (!page && slug === 'elite-buyer') {
    return res.status(200).json({
      status: true,
      success: true,
      data: {
        slug: 'elite-buyer',
        title: 'Elite Buyer Membership',
        content: 'Call owners directly & close deals 2x faster with verified owner listings and direct phone access.',
        youtubeUrl: '',
        supportEmail: 'support@bigbazaar.com',
        supportPhone: '1800-258-3333',
        published: true,
        config: {
          badgeText: 'Buy ⚡ Fast',
          headline: 'Call owners directly & close deals 2x faster',
          highlightWord: 'owners',
          card1Title: 'Call Owners Directly',
          card1Subtitle: 'Direct phone connection to genuine sellers',
          card2Title: 'Daily New Matches',
          card2Subtitle: 'Instant alerts for matched owner ads',
          ctaText: 'Get Started'
        }
      }
    });
  }

  if (!page) {
    return res.status(200).json({
      status: true,
      success: true,
      data: {
        slug,
        title: slug.replace(/-/g, ' ').toUpperCase(),
        content: `Default content for ${slug}. This page will be updated by the platform administrator.`,
        youtubeUrl: '',
        supportEmail: 'support@bigbazaar.com',
        supportPhone: '1800-258-3333',
        config: {}
      }
    });
  }

  res.status(200).json({
    status: true,
    success: true,
    data: page
  });
});

export const updateStaticPage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const aliases = POLICY_ALIASES[slug] || [slug];
  const {
    title,
    content,
    youtubeUrl,
    supportEmail,
    supportPhone,
    config,
    published,
    metaTitle,
    metaDescription
  } = req.body;

  let page = await CMSPage.findOne({ slug });
  if (!page) {
    page = await CMSPage.findOne({ slug: { $in: aliases } });
  }

  if (page) {
    if (page.slug !== slug) {
      const existingTarget = await CMSPage.findOne({ slug });
      if (existingTarget) {
        page = existingTarget;
      } else {
        page.slug = slug;
      }
    }
    if (title !== undefined) page.title = title.trim();
    if (content !== undefined) page.content = content;
    if (youtubeUrl !== undefined) page.youtubeUrl = youtubeUrl.trim();
    if (supportEmail !== undefined) page.supportEmail = supportEmail.trim();
    if (supportPhone !== undefined) page.supportPhone = supportPhone.trim();
    if (config !== undefined) page.config = { ...page.config, ...config };
    if (published !== undefined) page.published = published;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (req.user?._id) page.updatedBy = req.user._id;
    await page.save();
  } else {
    page = await CMSPage.create({
      slug,
      title: title || slug.toUpperCase(),
      content: content || '',
      youtubeUrl: youtubeUrl || '',
      supportEmail: supportEmail || 'support@bigbazaar.com',
      supportPhone: supportPhone || '1800-258-3333',
      config: config || {},
      published: published !== undefined ? published : true,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      updatedBy: req.user?._id || null
    });
  }

  for (const alias of aliases) {
    if (alias !== slug) {
      await CMSPage.findOneAndUpdate(
        { slug: alias },
        {
          title: page.title,
          content: page.content,
          published: page.published,
          updatedBy: req.user?._id || null
        },
        { upsert: true }
      ).catch(() => {});
    }
  }

  try {
    for (const sSlug of aliases) {
      const sPage = await StaticPage.findOne({ slug: sSlug });
      if (sPage) {
        if (title) sPage.title = title.trim();
        if (content) sPage.content = content;
        await sPage.save();
      }
    }
  } catch (err) {}

  res.status(200).json({
    status: true,
    success: true,
    message: 'Page updated successfully',
    data: page
  });
});

// ==========================================
// 3. MEDIA GALLERY (ASSET LIBRARY)
// ==========================================
export const getGalleryImages = asyncHandler(async (req, res) => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const files = await fs.promises.readdir(uploadsDir);
  const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp']);

  const galleryItems = [];
  for (const filename of files) {
    if (filename === '.gitkeep') continue;
    const ext = path.extname(filename).toLowerCase();
    if (!imageExtensions.has(ext)) continue;

    try {
      const filePath = path.join(uploadsDir, filename);
      const stat = await fs.promises.stat(filePath);

      const sizeKB = (stat.size / 1024).toFixed(1);
      const sizeFormatted = stat.size > 1024 * 1024
        ? `${(stat.size / (1024 * 1024)).toFixed(2)} MB`
        : `${sizeKB} KB`;

      galleryItems.push({
        id: filename,
        filename,
        url: `/uploads/${filename}`,
        size: stat.size,
        sizeFormatted,
        extension: ext.replace('.', '').toUpperCase(),
        createdAt: stat.birthtime || stat.mtime,
        updatedAt: stat.mtime
      });
    } catch (e) {}
  }

  galleryItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json({
    status: true,
    success: true,
    count: galleryItems.length,
    data: galleryItems
  });
});

export const uploadGalleryImages = asyncHandler(async (req, res) => {
  const reqFiles = req.files || (req.file ? [req.file] : []);

  if (!reqFiles || reqFiles.length === 0) {
    throw ApiError.badRequest('No image files were provided for upload');
  }

  const uploadedFiles = [];
  for (const file of reqFiles) {
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeKB} KB`;

    uploadedFiles.push({
      id: file.filename,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      sizeFormatted,
      mimetype: file.mimetype,
      createdAt: new Date()
    });
  }

  res.status(201).json({
    status: true,
    success: true,
    message: `${uploadedFiles.length} image(s) uploaded to gallery successfully`,
    data: uploadedFiles
  });
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadsDir, safeFilename);

  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }

  res.status(200).json({
    status: true,
    success: true,
    message: `Image ${safeFilename} deleted from gallery`
  });
});

// ==========================================
// 4. BANNER SETTINGS & SLIDER CONFIGURATION
// ==========================================
export const getBannerSettings = asyncHandler(async (req, res) => {
  const doc = await CMSPage.findOne({ slug: 'banner-settings' });
  let settings = {
    autoplayIntervalSeconds: 4.5,
    autoPlayEnabled: true,
    transitionStyle: 'smooth',
    maxActiveBanners: 10
  };

  if (doc && doc.content) {
    try {
      const parsed = JSON.parse(doc.content);
      settings = { ...settings, ...parsed };
    } catch (e) {}
  }

  res.status(200).json({
    status: true,
    success: true,
    data: settings
  });
});

export const updateBannerSettings = asyncHandler(async (req, res) => {
  const { autoplayIntervalSeconds, autoPlayEnabled, transitionStyle } = req.body;

  let doc = await CMSPage.findOne({ slug: 'banner-settings' });
  let current = {
    autoplayIntervalSeconds: 4.5,
    autoPlayEnabled: true,
    transitionStyle: 'smooth',
    maxActiveBanners: 10
  };

  if (doc && doc.content) {
    try { current = { ...current, ...JSON.parse(doc.content) }; } catch (e) {}
  }

  if (autoplayIntervalSeconds !== undefined) {
    current.autoplayIntervalSeconds = Math.max(1, Math.min(15, parseFloat(autoplayIntervalSeconds) || 4.5));
  }
  if (autoPlayEnabled !== undefined) {
    current.autoPlayEnabled = Boolean(autoPlayEnabled);
  }
  if (transitionStyle !== undefined) {
    current.transitionStyle = String(transitionStyle);
  }

  if (doc) {
    doc.content = JSON.stringify(current);
    if (req.user?._id) doc.updatedBy = req.user._id;
    await doc.save();
  } else {
    doc = await CMSPage.create({
      slug: 'banner-settings',
      title: 'Hero Banner Slider Settings',
      content: JSON.stringify(current),
      updatedBy: req.user?._id || null
    });
  }

  res.status(200).json({
    status: true,
    success: true,
    message: 'Banner slider settings updated',
    data: current
  });
});

export default {
  getBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  toggleBannerStatus,
  deleteBanner,
  trackBannerEvent,
  getBannerAnalytics,
  getStaticPage,
  updateStaticPage,
  getGalleryImages,
  uploadGalleryImages,
  deleteGalleryImage,
  getBannerSettings,
  updateBannerSettings
};
