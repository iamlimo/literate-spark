

## Routing, Auth Guards, and Content Creation UX Optimization

### Problem
1. **`/` route always shows landing page** — logged-in users must manually navigate to `/feed`. They should be auto-redirected.
2. **Login and Signup pages are accessible to logged-in users** — they should redirect to `/feed` if already authenticated.
3. **Content creation UX is basic** — no word count, no auto-save indicator, no character limits, and the editor feels flat.

### Changes

#### 1. Smart redirect on `/` (`src/pages/Index.tsx`)
- Import `useAuth` and check `user` / `loading` state
- If `loading`, show a brief branded spinner (Oeuvre logo + pulse)
- If `user` exists, `<Navigate to="/feed" replace />`
- If no user, render the existing landing page

#### 2. Redirect logged-in users away from auth pages (`src/pages/Login.tsx`, `src/pages/Signup.tsx`)
- Import `useAuth` at the top of each page
- Before rendering the form, check: if `user` exists and `!loading`, return `<Navigate to="/feed" replace />`
- This prevents logged-in users from seeing login/signup forms

#### 3. Redirect logged-in users past onboarding (`src/pages/OnboardingWelcome.tsx`)
- Same pattern: if user already has a profile with persona set, redirect to `/feed`
- Prevents re-onboarding for returning users who land on `/onboarding` directly

#### 4. Improve ContentEditor UX (`src/pages/ContentEditor.tsx`)
- Add a live word count display in the footer area (updates as user types)
- Add character count for title (max 200 chars)
- Add subtle auto-expanding textarea behavior — textarea grows with content instead of fixed height with scroll
- Improve chapter cards for books: add drag handle visual hint, chapter number badge, and a collapse/expand toggle
- Add a "Unsaved changes" dot indicator in the header when content has been modified
- Add keyboard shortcut hint: "Cmd+Enter to publish" near the Next button

#### 5. Improve ContentPublishSettings UX (`src/pages/ContentPublishSettings.tsx`)
- Add character count on the description field (max 280 chars)
- Show estimated read time based on word count (body length / 200 wpm)
- Add a subtle content preview that shows first 3 lines of body text formatted

### Files modified
- `src/pages/Index.tsx` — auth-aware redirect
- `src/pages/Login.tsx` — redirect if logged in
- `src/pages/Signup.tsx` — redirect if logged in
- `src/pages/OnboardingWelcome.tsx` — redirect if already onboarded
- `src/pages/ContentEditor.tsx` — word count, auto-expand, chapter UX, unsaved indicator
- `src/pages/ContentPublishSettings.tsx` — char count, read time estimate

### Technical details
- Auth checks use the existing `useAuth()` hook — no new context or state management
- Auto-expanding textarea uses a `useEffect` that sets `textarea.style.height = textarea.scrollHeight + "px"` on input change
- Word count: `body.trim().split(/\s+/).filter(Boolean).length`
- Read time: `Math.max(1, Math.ceil(wordCount / 200))` minutes
- No new dependencies or database changes

