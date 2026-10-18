import Colors from './colors';

export const Typography = {
  // Screen & Page Titles
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3
  },
  heading1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
    color: Colors.textPrimary
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.3,
    color: Colors.textPrimary
  },
  heading3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.2,
    color: Colors.textPrimary
  },
  sectionHeader: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: Colors.textPrimary
  },

  // Body & Paragraphs
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: Colors.textPrimary
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: Colors.textPrimary
  },
  secondary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: Colors.textSecondary
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.textSecondary
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: Colors.textSecondary
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.textTertiary
  },

  // Commerce & Numbers
  priceLarge: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  priceCard: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  tabular: {
    fontVariant: ['tabular-nums']
  },

  // Action Buttons
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.card
  }
};

export default Typography;
