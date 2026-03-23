

## Mobile-First Responsive Design Optimization

### Problem
All pages are currently designed at a single mobile width with no responsive scaling. On desktop/tablet, content stretches edge-to-edge or looks cramped. There is no safe-area handling for native iOS (notch/home indicator). Touch targets and spacing need optimization for native mobile feel.

### Approach
Apply a responsive shell pattern: mobile-first base styles remain, desktop gets a centered container with max-width and optional sidebar layout for key pages. Add safe-area insets for Capacitor/native. Optimize touch targets, spacing, and typography scaling.

### Changes

#### 1. Global layout wrapper + safe area support (`src/index.css`)
- Add `env(safe-area-inset-*)` padding to body for native iOS notch/home indicator
- Add a `.app-shell` utility class that centers content with `max-w-2xl` on desktop for feed/profile/dashboard pages
- Add desktop-specific adjustments: larger font sizes for headings, more generous spacing

#### 2. Create `AppShell` layout component (`src/components/AppShell.tsx`)
- Wraps page content in a responsive container: full-width on mobile, centered `max-w-2xl` on tablet, two-column with sidebar on large desktop (`lg:max-w-6xl`)
- Handles safe-area padding for top/bottom (Capacitor native)
- Used by Feed, Profile, Dashboard, QuotePublishSettings

#### 3. Update `BottomNav.tsx`
- Add `pb-[env(safe-area-inset-bottom)]` for native iOS home indicator
- On desktop (`md:` and up), hide bottom nav and show a top/side navigation instead, or keep it fixed but centered

#### 4. Update `Feed.tsx`
- Wrap in `AppShell`
- On desktop (`md:`): show a two-column layout with feed on left and a "Trending/Recommended" sidebar on right
- FAB position adjusted for safe area: `bottom-[calc(5rem+env(safe-area-inset-bottom))]`

#### 5. Update `Profile.tsx`
- Wrap in `AppShell`
- On desktop: wider profile card layout, stats in a horizontal row, content grid goes from 2 to 3 columns for quotes

#### 6. Update `Dashboard.tsx`
- Wrap in `AppShell`
- Stats grid: `grid-cols-2` on mobile, `grid-cols-4` on desktop
- Content list gets more horizontal space on desktop

#### 7. Update `QuoteEditor.tsx`
- On desktop: constrain canvas to centered `max-w-lg` with more vertical padding
- Toolbar stays full-width bottom on mobile, constrained and centered on desktop

#### 8. Update `QuotePublishSettings.tsx`
- Wrap in `AppShell`
- On desktop: two-column layout with preview on left, form on right

#### 9. Update `Login.tsx` / `Signup.tsx`
- Already centered with `max-w-md` — add desktop enhancements: split layout with decorative left panel on `lg:` screens showing the library image

#### 10. Update `Index.tsx` (Landing)
- On desktop: side-by-side hero layout (text left, image right) instead of stacked
- Larger headline typography on `md:` screens

#### 11. Update onboarding pages
- Already centered — add `max-w-lg` constraint on desktop for persona cards
- Footer nav: centered with max-width on desktop

### Files created
- `src/components/AppShell.tsx` — responsive layout wrapper

### Files modified
- `src/index.css` — safe-area CSS, desktop typography scale
- `src/components/BottomNav.tsx` — safe area + desktop behavior
- `src/pages/Feed.tsx` — responsive layout
- `src/pages/Profile.tsx` — responsive layout
- `src/pages/Dashboard.tsx` — responsive grid
- `src/pages/QuoteEditor.tsx` — centered canvas on desktop
- `src/pages/QuotePublishSettings.tsx` — two-column on desktop
- `src/pages/Login.tsx` — split layout on desktop
- `src/pages/Signup.tsx` — split layout on desktop
- `src/pages/Index.tsx` — side-by-side hero on desktop
- `src/pages/OnboardingPersona.tsx` — constrained width
- `src/pages/OnboardingInterests.tsx` — constrained width
- `src/pages/OnboardingWelcome.tsx` — constrained width
- `src/pages/ProfileEdit.tsx` — constrained width
- `src/components/quote/QuoteToolbar.tsx` — centered on desktop

### Technical details
- Safe areas use `env(safe-area-inset-top)` etc., supported in Capacitor WebView
- Responsive breakpoints follow Tailwind defaults: `sm:640px`, `md:768px`, `lg:1024px`
- No new dependencies needed
- All changes are additive — mobile layout is preserved as the base

