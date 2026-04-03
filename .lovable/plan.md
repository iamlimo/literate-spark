

## Multi-Content Creation System + Navigation + Build Fix

### Overview
Expand the creation flow beyond quotes to support Articles, Stories, Books (multi-chapter), and Poems. Add a content type picker on `/create`, update navigation labels, and fix the existing build error.

### Changes

#### 1. Fix build error in `src/hooks/useFeed.ts`
- Remove duplicate `caption` property on lines 9 and 13 of the `FeedItem` interface (keep one)
- Remove duplicate `caption` mapping on line 148/164 in the feed builder

#### 2. Update BottomNav labels (`src/components/BottomNav.tsx`)
- Change "Novel" → "Home" (keep BookOpen icon or switch to Home icon)
- Keep "Create", "Market", "Clubs", "Library" as-is

#### 3. Create content type picker page (`src/pages/CreatePicker.tsx`)
- New page at `/create` showing a grid of content types the user can create:
  - **Quote** — "A short-form visual fragment" → navigates to `/create/quote`
  - **Article** — "Share your thoughts and ideas" → navigates to `/create/article`
  - **Story** — "A short story or narrative" → navigates to `/create/story`
  - **Book** — "A multi-chapter work" → navigates to `/create/book`
  - **Poem** — "Express through verse" → navigates to `/create/poem`
- Each option is a card with icon, title, and description
- Clean, minimal editorial design matching existing aesthetic
- Keep the FAB on feed pointing to `/create`

#### 4. Create unified long-form editor (`src/pages/ContentEditor.tsx`)
- A single editor page that handles articles, stories, poems, and books
- Receives content type from route param or state
- Fields: title, body (textarea/rich text area), cover image URL (optional), tags
- For **books**: additional "chapter" concept — user can add multiple chapters (title + body each), stored as JSON in the `body` field or as separate content entries (MVP: store chapters as a JSON array in body)
- For **poems**: similar to article but with poem-specific styling hints
- Top bar: back button, content type label, "Publish" button
- Publish navigates to a unified publish settings page

#### 5. Create unified publish settings (`src/pages/ContentPublishSettings.tsx`)
- Similar to QuotePublishSettings but for all non-quote types
- Shows: title preview, caption/description input, tags, visibility toggle
- On publish: inserts into `contents` table with the correct `content_type`
- Success screen with same post-publish actions

#### 6. Update routes (`src/App.tsx`)
- `/create` → `CreatePicker`
- `/create/quote` → existing `QuoteEditor`
- `/create/quote/publish` → existing `QuotePublishSettings`
- `/create/:type` → `ContentEditor` (for article, story, book, poem)
- `/create/:type/publish` → `ContentPublishSettings`

#### 7. Update Feed rendering (`src/pages/Feed.tsx`)
- Add "article", "poem" to recognized content types in `FeedItemRenderer`
- Articles and books render via `StoryPreviewCard`
- Poems render via `QuoteCard` (typography-first) or a dedicated poem variant

#### 8. Update `QuotePublishSettings.tsx`
- Fix navigation: back button goes to `/create/quote` instead of `/create`

### Files created
- `src/pages/CreatePicker.tsx` — content type selection grid
- `src/pages/ContentEditor.tsx` — unified long-form editor
- `src/pages/ContentPublishSettings.tsx` — unified publish settings

### Files modified
- `src/hooks/useFeed.ts` — fix duplicate caption property
- `src/components/BottomNav.tsx` — "Novel" → "Home"
- `src/App.tsx` — add new routes
- `src/pages/Feed.tsx` — handle new content types in renderer
- `src/pages/QuotePublishSettings.tsx` — fix back navigation

### No database changes needed
The `content_type` enum already includes article, short_story, novel (for books), poem, and all future types (comic, research_paper, thesis, journal). No migration required.

