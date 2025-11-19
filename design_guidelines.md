# Istikhara App Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from premium spiritual and Islamic apps like Quran.com, Muslim Pro, and Headspace (for calm, focused UX). The design should convey reverence, clarity, and spiritual connection while maintaining modern usability.

## Core Design Principles

1. **Sacred Minimalism**: Clean, uncluttered layouts that honor the spiritual nature
2. **Typographic Reverence**: Arabic and Urdu text treated with exceptional care
3. **Focused Experience**: Guide users through a meditative journey from upload to interpretation

## Typography System

**Arabic Text (Quranic Verses)**:
- Primary: 'Amiri' or 'Scheherazade New' (Google Fonts)
- Sizes: text-3xl to text-5xl for displayed verses
- Weight: font-normal to font-medium
- Line height: leading-loose for readability

**Urdu Text (Interpretations)**:
- Primary: 'Noto Nastaliq Urdu' (Google Fonts)
- Sizes: text-base to text-2xl depending on hierarchy
- Right-to-left (RTL) text direction
- Generous line spacing: leading-relaxed

**English/UI Text**:
- Primary: 'Inter' or 'Poppins'
- Sizes: text-sm to text-xl
- Weight: font-normal for body, font-semibold for headings

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, and 24 (e.g., p-4, mb-8, gap-12)

**Container Widths**:
- Main content: max-w-4xl
- Verse display: max-w-3xl
- Form elements: max-w-2xl

## Page Structures

### Landing Page

**Hero Section (70vh)**:
- Centered layout with subtle geometric Islamic pattern overlay (using CSS or SVG)
- Large heading explaining the app purpose in both English and Urdu
- Primary CTA: Upload interface card (400px width) with drag-and-drop zone
- Tagline beneath explaining "Receive divine guidance through Quranic verses"

**How It Works Section**:
- 3-column grid (md:grid-cols-3, base: grid-cols-1)
- Each step as a card: Upload → AI Analysis → Spiritual Interpretation
- Icons from Heroicons (cloud-arrow-up, sparkles, book-open)
- Spacing: py-20, gap-8 between cards

**About Istikhara Section**:
- Single column, max-w-prose
- Explanation in Urdu and English side-by-side (2-column on desktop)
- Padding: py-16

**Footer**:
- Centered layout
- Islamic greeting, privacy policy link, developer credit
- Padding: py-12

### Upload Interface Component

**Card Design**:
- Rounded corners: rounded-2xl
- Padding: p-8
- Border style: Dashed border when empty, solid when file present
- Height: min-h-64
- Centered content with upload icon and instructional text

**States**:
- Default: Upload icon + "Drop Quranic verse image" text
- Hover: Slightly elevated appearance
- Active/Uploading: Loading spinner with progress text
- Success: Thumbnail preview with "Analyzing..." message

### Results Page

**Layout Structure**:
- Full-width header showing uploaded image thumbnail (max-h-32)
- Main content area: max-w-4xl, centered

**Verse Display Section**:
- Card with generous padding: p-12
- Arabic text: Centered, text-4xl, leading-loose
- Border: Subtle decorative border using Islamic geometric pattern elements

**Interpretation Section (Urdu)**:
- Three distinct subsections with clear headings:
  1. **لفظی معنی** (Literal Meaning): p-6, mb-8
  2. **پس منظر** (Background/Context): p-6, mb-8
  3. **فال کے مطابق روحانی پیغام** (Spiritual Message): p-8, highlighted treatment
- Each subsection in its own card: rounded-xl, p-6
- Text alignment: text-right for Urdu
- Spacing between sections: space-y-6

**Action Buttons**:
- "Analyze Another Verse" - Primary button, centered below content
- "Share Interpretation" - Secondary option
- Button container: mt-12, flex justify-center gap-4

## Component Library

**Buttons**:
- Primary: px-8, py-4, rounded-full, text-base, font-medium
- Secondary: px-6, py-3, rounded-full, border-2
- Icon buttons: p-3, rounded-lg

**Cards**:
- Standard: rounded-xl, p-6 to p-8
- Featured (verse display): rounded-2xl, p-12, shadow-lg
- Borders: border or border-2 for emphasis

**Icons**:
- Library: Heroicons
- Sizes: w-6 h-6 for inline, w-12 h-12 for featured
- Usage: Upload, analysis indicators, navigation

**Loading States**:
- Spinner: Rotating crescent moon icon or circular progress
- Skeleton: Pulsing placeholders for text sections
- Message: "Analyzing verse..." in both English and Urdu

## Images

**Hero Background**:
- Subtle Islamic geometric pattern (Moroccan/Arabesque style) as SVG or low-opacity background
- Not a photograph - pattern-based for reverence
- Tiled seamlessly across hero section

**Uploaded Verse Images**:
- Display as: Thumbnail in header (max-h-32), rounded-lg
- Original uploaded image shown in modal if clicked
- Aspect ratio preserved, object-fit: contain

**No decorative photography** - keep focus on sacred text and interpretations

## Accessibility

- Ensure proper RTL support for Arabic and Urdu
- High contrast between text and backgrounds
- Focus indicators on all interactive elements
- Proper ARIA labels for upload interface
- Keyboard navigation throughout

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: Simple fade-in (300ms)
- Upload success: Gentle check mark animation
- Loading states: Subtle pulse or rotation
- NO scroll-triggered animations - maintain meditative calm

## Responsive Behavior

**Mobile (base to md)**:
- Single column layouts throughout
- Upload interface: Full width with min-h-48
- Hero: 60vh to allow scrolling
- Cards: p-4 instead of p-8
- Font sizes: Scale down 1-2 sizes (text-2xl → text-xl)

**Desktop (lg+)**:
- Multi-column where specified
- Larger spacing and padding values
- Maximum widths enforced for readability
- Centered layouts with breathing room on sides

---

**Design Philosophy**: This app handles sacred text and spiritual guidance. Every design decision should honor that responsibility with clarity, simplicity, and beauty. Avoid visual noise; create space for contemplation.