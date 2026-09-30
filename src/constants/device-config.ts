import Constants from 'expo-constants';

/**
 * Identifies which content this specific TV should pull (e.g. one per
 * sucursal/sala). Configure per-build via app.json `extra.deviceGroup` or
 * the EXPO_PUBLIC_DEVICE_GROUP env var; falls back to "default" for local dev.
 */
export const DEVICE_GROUP: string =
  Constants.expoConfig?.extra?.deviceGroup ?? process.env.EXPO_PUBLIC_DEVICE_GROUP ?? 'default';
