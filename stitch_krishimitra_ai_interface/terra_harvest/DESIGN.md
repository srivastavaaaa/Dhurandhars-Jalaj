---
name: Terra Harvest
colors:
  surface: '#f8faf3'
  surface-dim: '#d9dbd4'
  surface-bright: '#f8faf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4ed'
  surface-container: '#edefe8'
  surface-container-high: '#e7e9e2'
  surface-container-highest: '#e1e3dd'
  on-surface: '#191c18'
  on-surface-variant: '#404943'
  inverse-surface: '#2e312d'
  inverse-on-surface: '#eff2eb'
  outline: '#717973'
  outline-variant: '#c0c9c1'
  surface-tint: '#356850'
  primary: '#002819'
  on-primary: '#ffffff'
  primary-container: '#06402b'
  on-primary-container: '#77ac90'
  inverse-primary: '#9cd2b5'
  secondary: '#4f6600'
  on-secondary: '#ffffff'
  secondary-container: '#c9f258'
  on-secondary-container: '#546d00'
  tertiary: '#2d2000'
  on-tertiary: '#ffffff'
  tertiary-container: '#483400'
  on-tertiary-container: '#cb9900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8efd0'
  primary-fixed-dim: '#9cd2b5'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#1b503a'
  secondary-fixed: '#c9f258'
  secondary-fixed-dim: '#add53e'
  on-secondary-fixed: '#161f00'
  on-secondary-fixed-variant: '#3b4d00'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#fabd00'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#f8faf3'
  on-background: '#191c18'
  surface-variant: '#e1e3dd'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin-mobile: 16px
  container-margin-desktop: 80px
  gutter: 16px
  section-gap-lg: 64px
  touch-target-min: 48px
---

## Brand & Style
The design system is built on a foundation of trust, growth, and accessibility. It targets agricultural investors and farmers, specifically optimized for the diverse literacy levels and environmental conditions of rural India. 

The visual style is **Corporate / Modern** but infused with **Tactile** warmth. It prioritizes clarity and high-contrast elements to ensure readability under bright sunlight (outdoor use) while maintaining an earthy, professional aesthetic. The mood is "Modern Rural"—it respects traditional farming values through a warm color palette while signaling technological advancement through clean layouts and crisp typography.

Key attributes:
- **Trustworthy:** Grounded in stable earth tones and deep forest greens.
- **Accessible:** Large touch targets, high-contrast text, and iconography-heavy navigation.
- **Optimistic:** Bright, "sun-drenched" accents of yellow to signify harvest and prosperity.

## Colors
The palette is derived from the lifecycle of a crop: the deep green of healthy foliage, the bright lime of new growth, and the golden yellow of a ready harvest.

- **Primary (Forest Green):** Used for primary text, headers, and navigation to establish authority and reliability.
- **Secondary (Sprout Green):** Used for primary call-to-action buttons to ensure high visibility against dark backgrounds.
- **Tertiary (Golden Harvest):** Used for highlighting financial growth, alerts, or interactive chips.
- **Background (Cream/Bone):** A warm off-white neutral reduces eye strain compared to pure white and reinforces the earthy feel.
- **High-Contrast Accents:** Dark chocolate browns are used for secondary text to maintain a warm but legible hierarchy.

## Typography
The typography system uses **Plus Jakarta Sans** for headlines to provide a friendly, modern, and open geometric feel. For body text and functional labels, **Be Vietnam Pro** is selected for its exceptional legibility and contemporary humanist traits, which perform well at smaller sizes on mobile screens.

To accommodate low-literacy users, we prioritize:
- **Large Base Sizes:** 18px body text on mobile as the standard.
- **Increased Line Height:** Generous spacing between lines to prevent text crowding.
- **Weight Contrast:** Strong distinctions between bold headers and regular body text to aid scanning.

## Layout & Spacing
This design system utilizes a **fluid grid** model optimized for mobile-first delivery. 

- **Mobile:** A 4-column grid with 16px margins. Primary actions are placed within the "thumb zone" (bottom two-thirds of the screen).
- **Desktop:** A 12-column grid with 80px margins and a max-width of 1440px.
- **Rhythm:** An 8px base unit drives all spacing. Consistent padding of 24px is used within cards to ensure data isn't cramped.
- **Density:** We employ a "Low Density" approach. Elements are given significant breathing room to reduce cognitive load, making the interface feel less overwhelming for users less familiar with complex digital platforms.

## Elevation & Depth
Hierarchy is established using **Tonal Layers** and **Soft Ambient Shadows**. 

1.  **Level 0 (Base):** The neutral cream background.
2.  **Level 1 (Cards):** White surfaces with a very soft, diffused green-tinted shadow (Hex: #06402B at 8% opacity). This makes elements feel like they are resting gently on the ground.
3.  **Level 2 (Active/Floating):** Higher elevation shadows used for buttons and floating action menus to indicate interactivity.
4.  **Glassmorphism:** Reserved specifically for image overlays (like price tickers or crop info badges) to maintain context with the background photography while ensuring text legibility.

## Shapes
The shape language is **Rounded**, reflecting the organic curves found in nature. 

- **Standard Elements:** 8px (0.5rem) radius for input fields and small cards.
- **Large Containers:** 16px (1rem) radius for main content sections and featured cards.
- **Buttons/Chips:** Full pill-shape (999px) is used for primary buttons to maximize the "friendly" and "clickable" affordance.
- **Images:** All photography should use a minimum 16px corner radius to avoid harsh edges that conflict with the approachable brand persona.

## Components
- **Buttons:** Primary buttons use the secondary "Sprout Green" with dark green text for maximum contrast. They must include an icon (e.g., an arrow or plus sign) to reinforce the action's intent visually.
- **Input Fields:** Use a solid 1px border in a muted earth tone. Focus states should switch to a 2px primary green border. Labels must always be visible (no floating labels) to ensure clarity.
- **Chips:** Used for categorizing crops or investment types. These use the "Golden Harvest" yellow for high visibility.
- **Cards:** White backgrounds with subtle green-tinted shadows. Every card should feature a clear visual indicator (icon or thumbnail) to help users identify the content at a glance.
- **Progress Indicators:** Use a thick, tactile bar in primary green to show investment maturity or crop growth stages, making the data feel tangible.
- **Navigation:** A bottom navigation bar on mobile with large icons and clear text labels to accommodate one-handed use in the field.