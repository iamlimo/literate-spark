

## Social Features: Follow/Unfollow, User Search, Profile Viewing, Comments

### Overview
Add four interconnected features: follow/unfollow on profiles, user search/discovery, clickable author names in the feed, and an inline comment system on feed posts.

### Changes

#### 1. Follow/Unfollow button on Profile page (`src/pages/Profile.tsx`)
- Add state for `isFollowing` and follower/following counts
- Fetch follow status on load: query `follows` table for current user → target user
- Add Follow/Unfollow button next to the profile info (only shown when viewing another user's profile)
- Toggle inserts/deletes from `follows` table with optimistic UI update
- Display follower and following counts in the stats row

#### 2. User search in Feed header (`src/pages/Feed.tsx`)
- Add a Search icon button in the Feed header that opens a search dialog
- Use the existing `Dialog` + `Command` components (already in the project) to build a search modal
- Search queries the `profiles` table with `ilike` on `display_name` and `username`
- Results show avatar, display name, username — clicking navigates to `/profile/:userId`
- Debounced input (300ms) to avoid excessive queries

#### 3. Clickable author names in feed cards
- Update `QuoteCard`, `ThoughtCard`, `StoryPreviewCard` to accept `authorId` prop
- Wrap author name in a link/button that navigates to `/profile/:authorId`
- Update `FeedItemRenderer` in `Feed.tsx` to pass `item.author_id` to each card

#### 4. Inline comment system on feed posts
- Add a comment sheet/drawer that opens when the comment button is tapped in `InteractionBar`
- Uses existing `Sheet` component (side="bottom")
- Fetches comments for the content from `comments` table joined with `profiles` for author info
- Input field at bottom to post new comments
- Comments display: avatar, name, timestamp, body
- Pass `onComment` callback through from Feed → card components → InteractionBar
- Manage comment state in Feed.tsx with a `selectedContentId` + sheet open state

### Files modified
- `src/pages/Profile.tsx` — follow/unfollow button, follower/following counts
- `src/pages/Feed.tsx` — search dialog, comment sheet, pass authorId + onComment to cards
- `src/components/feed/QuoteCard.tsx` — add authorId prop, clickable author name
- `src/components/feed/ThoughtCard.tsx` — add authorId prop, clickable author name
- `src/components/feed/StoryPreviewCard.tsx` — add authorId prop, clickable author name
- `src/components/feed/InteractionBar.tsx` — wire onComment prop (already exists but unused)
- `src/hooks/useFeed.ts` — expose author_id in FeedItem (already there)

### No new files, components, or edge functions
All features use existing UI components (`Dialog`, `Command`, `Sheet`, `Avatar`, `Input`) and existing database tables (`follows`, `comments`, `profiles`).

### No database changes needed
The `follows`, `comments`, and `profiles` tables already exist with appropriate RLS policies.

