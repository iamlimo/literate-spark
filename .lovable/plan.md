

## Quote Creation Feature — Implementation Plan

### Overview
Transform the static QuoteEditor into a fully interactive quote creation experience with real-time styling, publish flow, and database persistence. Add a floating "Create Quote" button on the Feed page.

### Architecture

```text
Feed (FAB button) → QuoteEditor (Screen 1) → QuotePublish (Screen 2) → Feed
                         ↓
              useQuoteEditor (hook for state)
              QuoteCanvas (preview component)
              QuoteToolbar (bottom toolbar panels)
```

### Step 1: Database — Add style column to contents table

Migration to add a `style` JSONB column to `contents` for storing quote styling:
```sql
ALTER TABLE contents ADD COLUMN style jsonb DEFAULT '{}'::jsonb;
```

This stores `{ background, font, alignment, frame }` for quotes.

### Step 2: Create `useQuoteEditor` hook

Central state management hook holding:
- `text` (max 280 chars), `authorName`
- `style`: background (solid colors/gradients), font (from curated list), alignment, frame style
- `activeToolbar` panel (canvas/style/fonts/frame)
- Auto-save to localStorage on changes
- Composition number from user's quote count

### Step 3: Rewrite `QuoteEditor.tsx` (Screen 1)

Full-screen immersive editor:
- **Top bar**: Close (X), "Digital Atelier" + composition number, Publish button
- **Canvas**: Tappable centered textarea with auto-resize, quote mark decoration, author section with user's avatar/name from AuthContext
- **Bottom toolbar** with 4 panels:
  - **Canvas**: 8-10 background presets (solid colors + gradients, warm editorial palette)
  - **Style**: Alignment toggle (left/center/right), bold/italic toggles
  - **Fonts**: 6 curated fonts (Playfair Display, DM Sans, Lora, Merriweather, Cormorant Garamond, Space Mono)
  - **Frame**: Border style options (none, thin, ornate)
- Smooth panel transitions with animation
- Character counter (280 max)

### Step 4: Create `QuotePublishSettings.tsx` (Screen 2)

Triggered by Publish button. Contains:
- Styled quote preview card (read-only render of the canvas)
- Caption textarea ("Capture your thoughts on this fragment...")
- Tags input with chip UI and suggestions (#philosophy, #stoicism, etc.)
- Club selector dropdown (fetches user's clubs from database)
- Visibility toggle (public/private)
- Publish button that inserts into `contents` table with `content_type: 'quote'`

### Step 5: Create `QuoteCanvas` reusable component

Shared between editor and preview. Renders the styled quote card with:
- Background color/gradient
- Font family, alignment, frame
- Quote text, decorative marks, author info

### Step 6: Add floating action button to Feed

A `+` or quill icon FAB in the bottom-right corner (above BottomNav) that navigates to `/create`. Animated entrance with scale transition.

### Step 7: Post-publish success flow

After successful publish, show a brief success dialog with suggestions:
- "Expand into an Article"
- "Add to a Collection"
- "Share externally"

Then navigate back to Feed.

### Step 8: Route for publish settings

Add `/create/publish` route in App.tsx, protected.

### Files Changed/Created
- **New**: `src/hooks/useQuoteEditor.ts`, `src/components/quote/QuoteCanvas.tsx`, `src/components/quote/QuoteToolbar.tsx`, `src/pages/QuotePublishSettings.tsx`
- **Modified**: `src/pages/QuoteEditor.tsx` (full rewrite), `src/pages/Feed.tsx` (add FAB), `src/App.tsx` (add route)
- **Migration**: Add `style` JSONB column to `contents`

