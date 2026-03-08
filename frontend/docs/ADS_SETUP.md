# Ads Go-Live Setup (AdSense)

## Required Vercel env vars (Production)

- `NEXT_PUBLIC_ADSENSE_CLIENT` → `ca-pub-...`
- `NEXT_PUBLIC_ADSENSE_SLOT_INFEED_4` → ad slot id for first in-feed placement
- `NEXT_PUBLIC_ADSENSE_SLOT_INFEED_8` → ad slot id for second in-feed placement

## Commands

```bash
vercel env add NEXT_PUBLIC_ADSENSE_CLIENT production
vercel env add NEXT_PUBLIC_ADSENSE_SLOT_INFEED_4 production
vercel env add NEXT_PUBLIC_ADSENSE_SLOT_INFEED_8 production
```

After setting envs, redeploy production:

```bash
vercel --prod --yes
```

## Validation checklist

1. Open `/mission-control` and confirm **Ads Pipeline = READY**
2. Open homepage and confirm live ad units are rendered at in-feed 4 and 8
3. Verify no placeholder "Ad network not configured yet" blocks remain
4. Confirm page speed + CLS still acceptable
