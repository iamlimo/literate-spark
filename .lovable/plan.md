

## Capacitor Native Mobile App Setup

This plan adds Capacitor to the project so it can be built and run as a native iOS and Android app.

### What will be done

1. **Install Capacitor dependencies**: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`
2. **Initialize Capacitor** with `npx cap init` using:
   - App ID: `app.lovable.16c59af90ef4420eacc75bc748f27dca`
   - App Name: `literate-spark`
3. **Configure `capacitor.config.ts`** with live-reload server pointing to the sandbox preview URL for development
4. **Add mobile-optimized meta tags** to `index.html` (status bar, safe areas)

### After setup — steps you'll need to do locally

1. Export to GitHub via Settings → GitHub, then clone the repo
2. Run `npm install`
3. Add platforms: `npx cap add ios` and/or `npx cap add android`
4. Run `npx cap update ios` / `npx cap update android`
5. Run `npm run build && npx cap sync`
6. Run `npx cap run ios` (requires Mac + Xcode) or `npx cap run android` (requires Android Studio)

After any future code changes, pull from GitHub and run `npx cap sync` to update the native projects.

### Files changed
- **package.json**: Add Capacitor dependencies
- **capacitor.config.ts**: New — Capacitor configuration with live-reload
- **index.html**: Add mobile meta tags (status bar style, Apple mobile web app capable)

### Technical details
- The live-reload server URL (`https://16c59af9-0ef4-420e-acc7-5bc748f27dca.lovableproject.com?forceHideBadge=true`) lets you see changes instantly on a physical device during development
- For production builds, remove the `server` block from `capacitor.config.ts` so the app uses the bundled assets

