
## Three-Feature Implementation Plan

### 1. Admin Club Creation (Full Setup)

**Admin Panel addition** (`src/pages/Admin.tsx`):
- Add a "Create Club" button in the Settings or a new "Clubs" tab
- Form fields: name, description, cover image URL, public/private toggle
- Admin creates clubs via Supabase insert (RLS already allows admin operations)

**Database migration**:
- Add admin RLS policy on `clubs` table so admins can insert/update/delete any club
- Add admin RLS policy on `club_members` so admins can manage membership

### 2. Full Personal Library (`/library`)

**New page** (`src/pages/Library.tsx`):
- **Tabs**: Saved, Reading History, Purchases, My Works
- **Saved tab**: Query `saves` table joined with `contents` + `profiles` — show cards grouped by content type
- **Reading History**: Track via a new `reading_history` table (content_id, user_id, last_read_at, progress)
- **Purchases tab**: Query `purchases` joined with `bookstore_listings` + `contents`
- **My Works tab**: User's own content filtered by status (published, drafts, pending)
- Each item shows title, author, type badge, date, and quick actions (remove, continue reading)

**Database migration**:
- Create `reading_history` table with `user_id`, `content_id`, `progress` (integer 0-100), `last_read_at`
- RLS: users can only view/insert/update/delete their own reading history

### 3. Optimized Content Creation Flow

#### a) Draft Auto-Save
- Save drafts to `contents` table with `status: 'draft'` every 5 seconds when changes detected
- Load existing draft on editor mount
- Show "Draft saved" indicator with timestamp

#### b) Rich Text Editing
- Use a simple markdown-style toolbar (bold, italic, headings, lists, blockquote)
- Store as markdown in the `body` field
- Render with basic markdown parsing in feed/preview

#### c) Cover Image Upload
- Create `content-covers` storage bucket
- Add image upload button in publish settings
- Upload to storage, save URL to `cover_image_url` field

#### d) Smoother Transitions
- Add page transition animations using framer-motion
- Progress stepper showing current step (Write → Settings → Publish)
- Animated feedback on publish success

### Files Created
- `src/pages/Library.tsx` — full library page with tabs
- `src/components/editor/RichTextToolbar.tsx` — formatting toolbar
- `src/components/editor/DraftIndicator.tsx` — auto-save status

### Files Modified
- `src/pages/Admin.tsx` — add Clubs management tab
- `src/pages/ContentEditor.tsx` — draft auto-save, rich text toolbar, transitions
- `src/pages/ContentPublishSettings.tsx` — cover image upload, step indicator
- `src/components/BottomNav.tsx` — wire Library route
- `src/App.tsx` — add `/library` route

### Database Migrations
1. Admin RLS policies for clubs/club_members
2. `reading_history` table with RLS
3. `content-covers` storage bucket with upload policies
