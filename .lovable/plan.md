

## Styled Quote Cards, Profile Interactions, Session Persistence, and Reflection UX

### Problem
1. **QuoteCard in feed** renders plain text — ignores the `style` JSONB (background, font, frame, alignment) the user applied when creating the quote
2. **Profile quotes tab** renders QuoteCanvas but has no interaction (like/save/comment)
3. **Session lost on refresh** — the AuthContext doesn't persist sessions properly across page reloads (race condition between `getSession` and `onAuthStateChange`)
4. **No "Reflection" feature** — saved/bookmarked quotes have no dedicated viewing experience

### Changes

#### 1. Add `style` to FeedItem and fetch it (`src/hooks/useFeed.ts`)
- Add `style: Record<string, unknown> | null` to the `FeedItem` interface
- Map `c.style` in the feed builder so it reaches QuoteCard

#### 2. Rewrite QuoteCard to render styled cards (`src/components/feed/QuoteCard.tsx`)
- Accept a `style` prop (optional, for backward compat)
- When `style` exists with background/font/frame data, render a compact version of QuoteCanvas inline (background gradient, custom font, frame, alignment) instead of the plain text card
- When no style, fall back to current plain typography card
- Keep the author row and InteractionBar below the styled card

#### 3. Add interactions to Profile quotes tab (`src/pages/Profile.tsx`)
- Fetch likes/saves/comments counts for the user's content
- Fetch current user's like/save state for each quote
- Render each quote with InteractionBar (like, save, comment)
- Add a comment sheet (reuse existing CommentSheet) triggered from InteractionBar
- Quotes displayed as styled cards (using the same compact QuoteCanvas rendering from the updated QuoteCard)

#### 4. Fix session persistence on refresh (`src/contexts/AuthContext.tsx`)
- Reorder: set up `onAuthStateChange` listener first, then call `getSession` — ensuring the listener catches the INITIAL_SESSION event
- Remove duplicate `setLoading(false)` call that can cause a flash of unauthenticated state

#### 5. Add "Reflections" section to Feed (`src/pages/Feed.tsx`)
- Below the feed content, add a "Reflections" section that shows the user's saved quotes
- Fetch saved content IDs from `saves` table, then fetch matching quotes from `contents`
- Display as a horizontally scrollable row of compact styled quote cards
- Each card is tappable — opens a fullscreen overlay with the styled quote, author info, and interaction bar
- Smooth entrance animation (fade-up + scale) when scrolling into view
- Header: "Your Reflections" with a count badge and "See all" link

### Files modified
- `src/hooks/useFeed.ts` — add `style` to FeedItem
- `src/components/feed/QuoteCard.tsx` — render styled background/font/frame when style data exists
- `src/pages/Profile.tsx` — add InteractionBar + CommentSheet to quotes tab
- `src/contexts/AuthContext.tsx` — fix session persistence on refresh
- `src/pages/Feed.tsx` — add Reflections horizontal scroll section with saved quotes

### Technical details
- QuoteCard compact rendering: aspect-ratio card with background gradient, ~200px height, text auto-sized, no editable textarea
- Reflections carousel uses `overflow-x-auto snap-x snap-mandatory` with `snap-start` children for smooth native-feel horizontal scrolling
- Fullscreen quote overlay uses a fixed-position div with backdrop blur and fade-in animation
- No new components or edge functions created — all built within existing files
- Session fix: the Supabase JS client emits `INITIAL_SESSION` through `onAuthStateChange`, so setting up the listener before `getSession` ensures no missed events

