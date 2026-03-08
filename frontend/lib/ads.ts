export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

export const ADSENSE_ENABLED = ADSENSE_CLIENT.startsWith('ca-pub-');

export const ADSENSE_SLOT_BY_ID: Record<string, string> = {
  'infeed-4': process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED_4 || '',
  'infeed-8': process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED_8 || '',
};

export const getAdSlotForPlacement = (placementId: string) => ADSENSE_SLOT_BY_ID[placementId] || '';
