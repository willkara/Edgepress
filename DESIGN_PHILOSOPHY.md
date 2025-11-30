# EdgePress Design Philosophy

This document outlines the core design principles, patterns, and philosophy that guide EdgePress's user interface and experience decisions.

---

## Core Principles

### 1. **Performance as a Feature**

Performance is not an afterthought—it's a core feature that shapes every design decision.

- **Perceived Performance**: Use skeleton loaders, optimistic UI updates, and smooth transitions to make the application feel instantaneous
- **Progressive Enhancement**: Start with a fast, functional baseline and layer enhancements on top
- **Edge-First Architecture**: Leverage Cloudflare's edge network for sub-100ms response times globally
- **Lazy Loading**: Load resources only when needed, including images, heavy components, and third-party scripts
- **Minimal JavaScript**: Prefer CSS animations and native browser features over JavaScript-heavy solutions

**Example**: Skeleton loaders show immediately during navigation, providing instant visual feedback while content loads in the background.

---

### 2. **Accessibility First**

Accessibility is not a checkbox—it's a fundamental requirement that makes the product better for everyone.

#### WCAG 2.1 AA Compliance
- Semantic HTML with proper heading hierarchy
- ARIA labels and landmarks for screen readers
- Keyboard navigation support for all interactive elements
- Focus indicators with 2px outline offset
- Color contrast ratios meeting 4.5:1 minimum

#### Motion Sensitivity
- Respect `prefers-reduced-motion` media query
- Disable animations for users who request it
- Provide alternatives to motion-based feedback

#### Keyboard Navigation
- Tab order follows visual flow
- Skip to content link for keyboard users
- Table of contents navigable via keyboard
- Escape key to close modals and drawers

**Example**: The enhanced Table of Contents includes proper ARIA labels, keyboard navigation, and focus indicators, making it fully accessible to all users.

---

### 3. **Mobile-First Responsive Design**

Design for mobile first, then progressively enhance for larger screens.

#### Breakpoint Strategy
```css
/* Mobile: 0-767px (default) */
/* Tablet: 768px-1023px */
/* Desktop: 1024px+ */
```

#### Touch-Optimized
- Minimum touch target size: 44x44px
- Pull-to-refresh gesture on mobile
- Bottom navigation bar for easy thumb access
- Swipe-friendly cards and lists
- Proper spacing to prevent mis-taps

#### Responsive Components
- Bottom navigation on mobile, sidebar on desktop
- Collapsible Table of Contents on mobile
- Fluid typography scaling with viewport
- Flexible grid layouts with CSS Grid and Flexbox

**Example**: Pull-to-refresh works exclusively on touch devices, providing a native-app-like experience on mobile while staying out of the way on desktop.

---

### 4. **Progressive Disclosure**

Show the right information at the right time. Don't overwhelm users.

#### Layered Information Architecture
- **Primary**: Essential content and navigation
- **Secondary**: Related posts, tags, metadata
- **Tertiary**: Newsletter signup, reactions

#### Collapsible UI Elements
- Table of Contents can be collapsed to save screen space
- Preview links hidden until generated
- Advanced options tucked away in admin panels

#### Contextual Features
- Continue reading banner only shows for in-progress articles (10-90%)
- Time remaining appears after 5% scroll progress
- Preview mode banner only on preview pages

**Example**: The Continue Reading banner intelligently appears only when meaningful (10-90% progress), avoiding noise for new readers or those who've finished.

---

### 5. **Feedback and Affordance**

Every action should have clear, immediate feedback. Users should never wonder "did that work?"

#### Visual Feedback Patterns
- **Hover states**: Subtle color changes on interactive elements
- **Active states**: Pressed button appearance
- **Loading states**: Skeleton loaders, spinners, progress bars
- **Success states**: Checkmarks, color changes, confirmation messages
- **Error states**: Red highlights, error messages, validation feedback

#### Micro-interactions
- Button hover effects (translateY, brightness)
- Smooth scroll to headings
- Copy button shows "Copied!" confirmation
- Pull indicator grows as you pull down
- Reading progress bar fills smoothly

#### Affordance Indicators
- Underlined links in body text
- Pointer cursor on clickable elements
- Hover states reveal interactivity
- Icons paired with text labels

**Example**: The copy preview link button changes from "Copy Link" to "✓ Copied!" providing immediate confirmation of success.

---

## User Experience Patterns

### Reading Experience

EdgePress prioritizes long-form content consumption with features designed for readers:

#### Enhanced Reading Progress
- **Visual progress bar**: Fixed at top, shows scroll position
- **Time estimate**: Shows minutes remaining based on 225 WPM
- **Position persistence**: Saves scroll position to resume later
- **Continue reading banner**: Prompts readers to pick up where they left off

#### Table of Contents
- **Sticky positioning**: Stays visible while scrolling
- **Active indicator**: Highlights current section
- **Progress bar**: Shows position through article
- **Smooth scroll**: Animated scroll to headings
- **Collapsible**: Can be hidden to focus on content

#### Content Discovery
- **Related posts**: Algorithm-based suggestions
- **Popular posts**: View count-based recommendations
- **Category/tag browsing**: Organized content taxonomy
- **Breadcrumbs**: Contextual navigation

---

### Content Management

The admin experience focuses on speed and simplicity for authors:

#### Post Editor
- **WYSIWYG editor**: Rich text editing with markdown support
- **Live preview**: Toggle between edit and preview modes
- **Auto-save**: Draft saved automatically (when implemented)
- **Preview links**: Share drafts before publishing

#### Draft Preview System
- **Secure tokens**: Cryptographically secure 64-character tokens
- **Expiry dates**: 7-day expiration prevents stale links
- **Regeneration**: Create new tokens as needed
- **Copy to clipboard**: One-click sharing

#### Media Management
- **Cloudflare Images**: Automatic optimization and variants
- **Blurhash LQIP**: Low-quality image placeholders
- **Lazy loading**: Images load as they enter viewport

---

## Visual Design System

### Color Philosophy

EdgePress uses a sophisticated dark theme optimized for reading:

#### Semantic Color Scale
```
--bg-page:      Dark background for main content
--bg-elevated:  Slightly lighter for cards/panels
--bg-soft:      Hover states and subtle highlights

--text-main:    Primary text (high contrast)
--text-muted:   Secondary text (reduced contrast)
--text-subtle:  Tertiary text (minimal contrast)

--accent:       Primary brand color (cyan/blue gradient)
--accent-soft:  Subtle accent backgrounds
--accent-strong: Emphasized accent states

--border-subtle: Soft borders (low contrast)
```

#### Gradient Accents
- Linear gradients for primary actions (buttons, links)
- Radial gradients for ambient backgrounds (animated orbs)
- Subtle gradients in progress bars

### Typography

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
```

#### Type Scale
- **Display**: 2.5rem+ for hero headlines
- **H1**: 2rem for page titles
- **H2**: 1.5rem for section headers
- **H3**: 1.25rem for subsections
- **Body**: 1rem (16px base)
- **Small**: 0.875rem for metadata

#### Reading Optimization
- Line height: 1.6-1.8 for body text
- Max width: 65-75 characters per line
- Adequate spacing between paragraphs
- Consistent heading hierarchy

### Spacing System

Based on 0.25rem (4px) increments:

```
0.25rem (4px)   - Tight spacing
0.5rem  (8px)   - Close spacing
0.75rem (12px)  - Default gap
1rem    (16px)  - Standard spacing
1.5rem  (24px)  - Comfortable spacing
2rem    (32px)  - Section spacing
3rem    (48px)  - Major section breaks
```

### Animation Principles

#### Duration
- **Fast**: 150ms for micro-interactions (hover, focus)
- **Medium**: 200-300ms for UI transitions
- **Slow**: 400-600ms for page transitions

#### Easing
- `ease`: Default for most animations
- `ease-in-out`: For symmetrical motions
- `cubic-bezier()`: Custom curves for specific effects

#### Motion Guidelines
- Animations should feel purposeful, not decorative
- Use motion to guide attention and provide feedback
- Always respect `prefers-reduced-motion`
- Avoid animations on initial page load (performance)

---

## Component Design Patterns

### Skeleton Loaders

**Purpose**: Reduce perceived loading time by showing content placeholders

**Implementation**:
- Match the shape/layout of actual content
- Shimmer animation suggests loading activity
- Fade out smoothly when real content appears
- Show during navigation transitions

**When to Use**:
- Page navigation loading states
- Initial page load (before data arrives)
- Infinite scroll pagination

**When NOT to Use**:
- Quick operations (<200ms)
- Background updates
- Already-loaded content

---

### Pull-to-Refresh

**Purpose**: Provide native-app-like refresh gesture on mobile

**Implementation**:
- Touch-only (disabled on desktop)
- 80px threshold to trigger
- Resistance effect (distance / 2)
- Visual indicator shows pull distance
- Calls `invalidateAll()` to refresh data

**Best Practices**:
- Only enable when scrolled to top
- Prevent during active scroll
- Show loading state after trigger
- Minimum display time for feedback

---

### Continue Reading Banner

**Purpose**: Help readers resume long-form content

**Implementation**:
- Saves scroll position to localStorage (10-95% range)
- Shows banner for meaningful progress (10-90%)
- Smooth scroll to saved position
- Dismissible with localStorage cleanup

**Smart Behavior**:
- Only appears for partially-read articles
- Hides for very start (<10%) or near end (>90%)
- Clears automatically when article is finished
- Positioned to avoid bottom navigation on mobile

---

## Technical Architecture

### Frontend Stack

- **Framework**: SvelteKit 2.x with Svelte 5 (Runes syntax)
- **Styling**: CSS with CSS Variables (no framework)
- **Icons**: Lucide Svelte (tree-shakeable)
- **Editor**: TipTap (rich text)
- **Build**: Vite with Cloudflare Pages adapter

### State Management

- **Local state**: Svelte `$state` runes
- **Derived state**: Svelte `$derived` runes
- **Persistent state**: localStorage with try/catch
- **Server state**: SvelteKit load functions with caching

### Performance Optimizations

#### Code Splitting
- Route-based splitting (automatic)
- Dynamic imports for heavy components
- Lazy load editor on admin pages

#### Caching Strategy
- **Cloudflare KV**: Edge-cached post data
- **Cache headers**: Public pages (60s), admin (no-cache)
- **localStorage**: Reading progress, UI preferences
- **Browser cache**: Static assets with versioning

#### Image Optimization
- Cloudflare Images with responsive variants
- Blurhash LQIP (low-quality image placeholders)
- Lazy loading with Intersection Observer
- WebP/AVIF with fallbacks

---

## Accessibility Checklist

Every feature should meet these requirements:

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order (follows visual flow)
- [ ] Focus indicators visible (2px outline)
- [ ] Escape key closes modals/menus
- [ ] Enter/Space activates buttons

### Screen Readers
- [ ] Semantic HTML elements (`<nav>`, `<main>`, `<article>`)
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA landmarks for page sections
- [ ] Alt text on all images
- [ ] Proper heading hierarchy (no skipped levels)

### Visual Accessibility
- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Color contrast ≥ 3:1 for UI elements
- [ ] No information conveyed by color alone
- [ ] Adequate font sizes (≥16px for body)
- [ ] Proper line height (1.5+ for paragraphs)

### Motion Accessibility
- [ ] Respects `prefers-reduced-motion`
- [ ] Animations can be disabled
- [ ] No auto-playing videos
- [ ] No infinite scrolling/spinning

---

## Mobile Design Considerations

### Touch Targets
- Minimum size: 44x44px (48x48px preferred)
- Adequate spacing between targets (8px minimum)
- Larger targets for primary actions

### Thumb Zones
- Bottom navigation for frequently-used actions
- Important controls within easy thumb reach
- Dangerous actions (delete) require confirmation

### Performance on Mobile
- Minimize JavaScript execution
- Use CSS transforms for animations (GPU-accelerated)
- Lazy load images and heavy components
- Reduce network requests

### Mobile-Specific Features
- Pull-to-refresh gesture
- Bottom navigation bar
- Safe area insets for notched displays
- Viewport meta tag for proper scaling

---

## Progressive Enhancement Strategy

Start with a solid HTML foundation, then layer on enhancements:

### Level 1: HTML Only
- Semantic markup with proper structure
- Server-rendered content (no client JS required)
- Forms work with standard POST requests
- Links navigate with full page loads

### Level 2: CSS
- Visual design and layout
- Responsive design with media queries
- Hover states and transitions
- Print styles

### Level 3: JavaScript
- Enhanced interactions (smooth scroll, etc.)
- Client-side routing (SvelteKit)
- Progressive loading (skeleton states)
- Advanced features (reading progress, reactions)

**Core Principle**: The site should work without JavaScript, but be enhanced by it.

---

## Error Handling Philosophy

### User-Facing Errors

- **Clear language**: Explain what happened and why
- **Actionable**: Tell users what they can do
- **Visible**: Use color, icons, and positioning
- **Dismissible**: Let users clear error messages

Example:
```
❌ Failed to save post
The server is temporarily unavailable.
Your changes are saved locally and will sync when reconnected.
[Retry] [Dismiss]
```

### Technical Errors

- Log to console for debugging
- Send to error tracking (when implemented)
- Graceful degradation (show fallback UI)
- Never crash the entire application

### Network Errors

- Retry with exponential backoff (git operations)
- Show offline indicator
- Cache-first strategies where possible
- Optimistic UI updates with rollback

---

## Future Considerations

### Planned Enhancements

1. **Dark/Light Mode Toggle**
   - Respect system preference by default
   - Manual override persisted to localStorage
   - Smooth theme transitions

2. **Advanced Search**
   - Full-text search with Cloudflare Workers
   - Search result highlighting
   - Filters by category, tag, date

3. **Social Sharing**
   - Native share API on mobile
   - Custom share buttons on desktop
   - Open Graph previews

4. **Offline Support**
   - Service worker for offline reading
   - Cache recent articles
   - Offline indicator in UI

5. **Performance Monitoring**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Error tracking and alerting

---

## Design Review Checklist

Before shipping a new feature, verify:

### Functionality
- [ ] Works on mobile, tablet, desktop
- [ ] Works with keyboard only
- [ ] Works with screen reader
- [ ] Works with JavaScript disabled (core functionality)
- [ ] Works on slow connections

### Performance
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast interaction (FID < 100ms)
- [ ] Quick loading (LCP < 2.5s)
- [ ] Optimized images (WebP, lazy loading)
- [ ] Minimal JavaScript bundle size

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Color contrast passing
- [ ] Respects motion preferences

### User Experience
- [ ] Clear visual hierarchy
- [ ] Obvious affordances
- [ ] Immediate feedback
- [ ] Error states handled
- [ ] Loading states shown

---

## Conclusion

EdgePress's design philosophy centers on three pillars:

1. **Performance**: Fast, efficient, and optimized for edge deployment
2. **Accessibility**: Inclusive design that works for everyone
3. **User Experience**: Thoughtful interactions that delight users

Every feature, component, and interaction should embody these principles. When in doubt, prioritize the user's needs over technical complexity, accessibility over aesthetics, and performance over features.

Design is not just how it looks—it's how it works.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-30
**Maintained By**: EdgePress Team
