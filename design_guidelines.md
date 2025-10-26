# Design Guidelines: Swashtya Sathi AI Healthcare Platform

## Design Approach

**System:** Material Design with healthcare-focused adaptations, drawing from modern medical platforms like Practo and Apple Health for clean, trustworthy data presentation.

**Core Principles:**
- **Clarity First**: Medical information must be instantly scannable with zero ambiguity
- **Trust Through Professionalism**: Clean, structured layouts that convey medical authority
- **Efficient Workflows**: Minimize clicks for critical actions (prescriptions, record access, emergency SOS)
- **Multilingual Accessibility**: Design accommodates Hindi, Marathi, and English text expansion

---

## Typography System

**Font Stack:** 
- Primary: Inter (Google Fonts) - exceptional clarity for medical data
- Devanagari Support: Noto Sans Devanagari for Hindi/Marathi

**Hierarchy:**
- Page Titles: text-3xl font-bold (Doctor Dashboard, Patient Records)
- Section Headers: text-xl font-semibold (Medical History, Prescriptions)
- Card Titles: text-lg font-medium (Patient Name, Medicine Name)
- Body Text: text-base font-normal (Medical notes, descriptions)
- Metadata: text-sm (Dates, ABHA IDs, timestamps)
- Captions: text-xs (Helper text, disclaimers)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12** consistently
- Component padding: p-6
- Section spacing: space-y-8
- Card gaps: gap-4
- Button padding: px-6 py-3

**Grid Structure:**
- Dashboard layout: Sidebar (w-64) + Main Content (flex-1)
- Card grids: grid-cols-1 md:grid-cols-2 xl:grid-cols-3
- Form layouts: max-w-2xl for single-column forms
- Data tables: w-full with responsive horizontal scroll

---

## Navigation Architecture

**Top Navigation Bar:**
- Fixed at top (sticky top-0)
- Height: h-16
- Contains: Logo (left), Role indicator (Patient/Doctor), ABHA ID display, Emergency SOS button (right), User avatar dropdown
- Shadow: shadow-sm for subtle depth

**Side Navigation (Dashboard):**
- Fixed left sidebar for Doctors/Pharmacies
- Width: w-64
- Navigation items with icons (use Heroicons)
- Active state: Subtle background highlight
- Collapsed mobile: Hidden by default, slide-in overlay

**Patient Mobile Navigation:**
- Bottom tab bar (fixed bottom-0) for primary actions
- Icons: Home, Chat, Records, Reminders, Profile

---

## Component Library

### Cards (Primary Container)
- Border radius: rounded-lg
- Padding: p-6
- Shadow: shadow-md
- Hover state: Slight shadow increase (shadow-lg)
- Used for: Patient cards, prescription items, health record entries

### Patient Information Card
- Header: Patient name (text-lg font-semibold), ABHA ID (text-sm)
- Avatar: w-12 h-12 rounded-full (left side)
- Metadata row: Age, Gender, Last Visit (text-sm, horizontal flex)
- Action buttons: View Records, Send Message (right-aligned)

### Prescription Card
- Medicine name: text-base font-medium
- Dosage, Duration, Frequency: text-sm in grid-cols-3
- Doctor signature section: text-xs with timestamp
- QR code: Fixed w-20 h-20 (top-right corner)
- Status badge: Small pill (Verified/Pending/Dispensed)

### Health Record Timeline
- Vertical timeline with connecting line (border-l-2)
- Date markers: Circular badges (w-3 h-3 rounded-full)
- Record cards: Indented ml-8, stacked vertically (space-y-4)
- Icons for record type: Lab reports, prescriptions, consultations

### Chat Messages
- User messages: Right-aligned, rounded-2xl, max-w-xs
- AI/Doctor messages: Left-aligned, rounded-2xl, max-w-xs
- Timestamp: text-xs, opacity-70
- Language indicator: Small flag icon for translated messages

### Data Tables (Medical Records)
- Sticky header: sticky top-0
- Row height: h-12
- Alternating row backgrounds for readability
- Action column: Right-aligned with icon buttons
- Pagination: Bottom-aligned with page numbers

### Forms (Profile, Prescription Creator)
- Label positioning: Above input (mb-2)
- Input height: h-12
- Input border: border rounded-md
- Focus state: Ring treatment (focus:ring-2)
- Required fields: Red asterisk
- Helper text: text-sm (below input)
- Multi-column forms: grid-cols-1 md:grid-cols-2 gap-6

### Search & Filter Bar
- Fixed at top of listings (sticky)
- Search input: w-full md:w-96 with search icon
- Filters: Horizontal row of dropdown buttons
- Clear filters: Text link (right side)

### Emergency SOS Button
- Large: px-8 py-4
- Fixed position option for critical placement
- Icon: Alert/Emergency (Heroicons)
- High contrast treatment for visibility

### Analytics Dashboard
- Chart containers: p-6, min-h-80
- Chart library: Chart.js integration
- Grid layout: grid-cols-1 lg:grid-cols-2 gap-8
- Stat cards: Large numbers (text-4xl font-bold), labels below
- Trend indicators: Up/down arrows with percentage

### Modal Overlays
- Backdrop: Darkened overlay (bg-opacity-75)
- Modal: max-w-2xl, rounded-lg, p-8
- Close button: Top-right (absolute positioning)
- Used for: ABHA authentication, consent requests, prescription preview

### Status Badges
- Small pills: px-3 py-1, rounded-full, text-xs font-medium
- States: Active, Pending, Verified, Expired, Dispensed
- Icon support: Optional small icon before text

### AI Chatbot Interface
- Fixed bottom-right: w-96 (desktop), full-screen (mobile)
- Input bar: Fixed at bottom (sticky bottom-0)
- Message area: Scrollable, max-h-96
- Language selector: Dropdown in header
- Typing indicator: Animated dots

---

## Page-Specific Layouts

### Doctor Dashboard
- 3-column grid (desktop): Patient list (8 cols), Patient preview (4 cols)
- Search bar: Top, full-width with filters
- Patient cards: Vertical stack with spacing-4
- Quick actions: Floating action button group (bottom-right)

### Patient Dashboard
- Hero section: ABHA card display with patient photo (h-48)
- Tab navigation: Horizontal tabs (Records, Prescriptions, Reminders, Chat)
- Timeline view: Vertical scroll, centered max-w-4xl
- AI insights card: Prominent placement at top, p-8

### Prescription Creator
- Two-column: Medicine selection (left), Prescription preview (right)
- Medicine search: Autocomplete with dropdown
- Add medicine: Button triggers form row insertion
- Digital signature: Canvas or text with timestamp
- Preview: Real-time PDF-style rendering

### Pharmacy Portal
- Scanner interface: Central QR scanner (w-64 h-64)
- Prescription verification: Large card with medicine list
- Inventory check: Real-time stock display
- Update status: Prominent action buttons

### Profile Pages
- Header: Large avatar (w-32 h-32), name, ABHA ID
- Info sections: Stacked cards (space-y-6)
- Edit mode: Inline editing with save/cancel actions
- ABHA sync indicator: Small badge showing last sync time

---

## Responsive Breakpoints

- Mobile: Base (full-width cards, stacked layout)
- Tablet: md: (2-column grids, sidebar appears)
- Desktop: lg: (3-column grids, full sidebar)
- Wide: xl: (4-column grids for data-dense views)

---

## Accessibility & Multilingual

- Font sizes: Minimum text-base for body content
- Touch targets: Minimum h-12 for interactive elements
- Language switching: Dropdown in top navigation
- RTL support: Not required (all languages LTR)
- ARIA labels: All interactive elements
- Keyboard navigation: Full support for form traversal

---

## Images

**ABHA Card Display:** Use realistic ABHA card mockup image (400x250px) in patient dashboard hero section showing 14-digit number format

**Doctor Profile Photos:** Professional headshots (w-32 h-32 rounded-full) throughout patient-facing interfaces

**Medical Icons:** Use Heroicons for consistency - stethoscope, pill, syringe, heartbeat, document icons for record types

**Empty States:** Illustrative graphics for "No prescriptions," "No appointments" with encouraging text

---

## Animations

**Minimal, purposeful only:**
- Page transitions: None (instant)
- Loading states: Simple spinner (animate-spin)
- Success actions: Subtle checkmark fade-in
- Chat messages: Slide-in from appropriate side
- Modal appearance: Fade-in backdrop + scale modal (150ms)