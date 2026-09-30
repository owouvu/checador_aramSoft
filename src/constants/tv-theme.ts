/**
 * Fixed dark theme for the signage/TV screen — it runs unattended in a
 * room, not adapting to a user's system preference like a phone would.
 */
export const TvColors = {
  background: '#0B0D12',
  surface: '#161923',
  surfaceAlt: '#1F2330',
  border: '#2A2F3D',
  text: '#F5F6FA',
  textSecondary: '#9AA0B4',
  accent: '#4F7CFF',
  success: '#33C481',
  warning: '#F2B84B',
  danger: '#F0555E',
} as const;

export const TvSpacing = {
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 48,
} as const;
