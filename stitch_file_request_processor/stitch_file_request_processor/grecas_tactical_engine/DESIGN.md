---
name: Grecas Tactical Engine
colors:
  surface: '#fcf9f1'
  surface-dim: '#dcdad2'
  surface-bright: '#fcf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3eb'
  surface-container: '#f0eee6'
  surface-container-high: '#ebe8e0'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c17'
  on-surface-variant: '#45483c'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f1e9'
  outline: '#76786b'
  outline-variant: '#c6c8b8'
  surface-tint: '#52652a'
  primary: '#33450d'
  on-primary: '#ffffff'
  primary-container: '#4a5d23'
  on-primary-container: '#bed58e'
  inverse-primary: '#b8cf88'
  secondary: '#755b00'
  on-secondary: '#ffffff'
  secondary-container: '#fed255'
  on-secondary-container: '#735a00'
  tertiary: '#7f1319'
  on-tertiary: '#ffffff'
  tertiary-container: '#a02c2e'
  on-tertiary-container: '#ffbcb8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4eca2'
  primary-fixed-dim: '#b8cf88'
  on-primary-fixed: '#141f00'
  on-primary-fixed-variant: '#3b4d14'
  secondary-fixed: '#ffe08e'
  secondary-fixed-dim: '#ecc246'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#891b20'
  background: '#fcf9f1'
  on-background: '#1c1c17'
  surface-variant: '#e5e2db'
typography:
  display:
    fontFamily: Oswald
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  display-mobile:
    fontFamily: Oswald
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Oswald
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Oswald
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Oswald
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Oswald
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: '1.35'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.45'
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.4'
  label-lg:
    fontFamily: Oswald
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
  label-md:
    fontFamily: Oswald
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Oswald
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  gutter-desktop: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system delivers an operational, high-legibility interface tailored for military duty roster management and command coordination within the 6º BEC (Batalhão de Engenharia de Construção - Roraima). 

The visual style blends **Tactical Utility** with **Disciplined Minimalism**. It avoids decorative frivolities, prioritizing high contrast, immediate hierarchy, and zero visual ambiguity under field conditions or mobile use. The interface evokes discipline, operational readiness, precision, and structural reliability.

Visual attributes include:
- Structural, compact surfaces inspired by tactical field manuals and logbooks.
- High-contrast status signifiers designed for instant scanning (especially between standard weekday duty and weekend/holiday guard duties).
- Tight, disciplined geometry with subdued corners and functional border demarcation.

## Colors

The color architecture is derived from engineering corps insignia, terrain canvas, and regulatory military roster formats:

- **Primary (`#4A5D23`)**: Deep Olive Drab. Anchors structural navigation, top app bars, primary active states, and tactical command buttons.
- **Secondary (`#C9A227`)**: Insignia Gold. Reserved for command positions, officer/NCO rank highlights, active shift indicators, and leadership distinctions.
- **Tertiary / Action Accent (`#B33A3A`)**: Beret Crimson. Dictates urgent interventions, critical operational notices, cancellations, and primary CTA triggers.
- **Neutral (`#2B2B26`)**: Tactical Lead. Delivers maximum contrast for typographic data, high-density roster text, and tabular borders.
- **Background (`#F5F1E8`)**: Sand Canvas. Mutes glare under direct daylight while maintaining a warm field-grade surface.
- **Surface (`#FFFDF7`)**: Ivory Field Card. Elevated surface for duty assignment cards, modals, and container lists.

### Operational Scale Badges:
- **Dia Preto (`#2B2B2B`)**: Business days / regular garrison shifts. Solid dark slate chip with crisp white typography.
- **Dia Vermelho (`#A83232`)**: Weekend / Holiday guard duties. High-visibility red chip with sharp white typography to instantly alert military personnel of critical weekend shifts.

## Typography

Typography establishes an authoritarian yet utilitarian hierarchy. Headings and compact badges leverage **Oswald** in uppercase styling to mimic stencil markings, dispatch boards, and tactical logs. Its condensed verticality conserves horizontal real estate on handheld screens and duty boards.

Body text uses **Inter** for optimal rendering of personnel lists, military ranks, service numbers, and operational remarks.

### Rules of Usage:
- All `label-*` and `headline-*` tokens must default to uppercase transformation (`text-transform: uppercase`) for military discipline and rapid field legibility.
- Strict mono-numeric alignment must be prioritized for dates, military ID codes, and platoon tallies (`font-feature-settings: 'tnum' on, 'lnum' on`).

## Layout & Spacing

The layout is built around a mobile-first, data-dense **fluid column grid** that scales efficiently to command desktop stations:

- **Mobile Viewport (<768px)**: 4 columns, `margin: 1rem`, `gutter: 1rem`. Stacks duty lists vertically, prioritizing today's active shift, alert banners, and next-turn rosters.
- **Tablet / In-Vehicle Displays (768px - 1024px)**: 8 columns, `margin: 1.5rem`, `gutter: 1rem`. Enables dual-pane navigation (Scale overview alongside individual soldier status).
- **Command Desktop (>1024px)**: 12 columns with a max content envelope of `1280px`, `margin-desktop: 2rem`, `gutter-desktop: 1.5rem`. Accommodates comprehensive month-wide shift matrices and export-ready logistical grids.

Component spacing sticks rigidly to multiples of 4px, driving a dense, structured visual density reminiscent of official field documentation.

## Elevation & Depth

Visual hierarchy is maintained primarily through **low-contrast outlines, tonal surface layers, and tight, structured borders** rather than soft ambient shadows. This prevents a blurry aesthetic and guarantees readability in outdoor, high-glare environments.

- **Ground (Level 0)**: Background `#F5F1E8`.
- **Card/Roster Units (Level 1)**: `#FFFDF7` with a razor-thin structural outline: `border: 1px solid rgba(43, 43, 38, 0.15)`. Minimal, crisp drop shadow: `0 1px 2px rgba(43, 43, 38, 0.08)`.
- **Operational Shift Highlighting (Level 2)**: Gold or Olive left accent strip (`border-left: 4px solid #C9A227` or `#4A5D23`) to denote active duty status without cluttering screen area.
- **Modals / Tactical Drawers (Level 3)**: `#FFFDF7` base, `border: 2px solid #2B2B26`, shadow `0 8px 24px rgba(43, 43, 38, 0.25)`.

## Shapes

The design system employs a **Soft / Clipped** shape profile (`roundedness: 1`). Corners are strictly restrained:

- Buttons, input controls, chips, and small markers utilize `0.25rem` (4px).
- Duty roster cards, module sheets, and calendar blocks utilize `0.5rem` (8px).
- Badges and status pills must maintain squared-off or subtly rounded edges (never fully rounded pill designs) to preserve the functional, industrial military aesthetic.

## Components

### 1. Buttons
- **Primary Tactical Action**: Background `#4A5D23`, text `#FFFDF7`, border 1px solid `#37461A`. Font: Oswald SemiBold, uppercase, tracking `0.06em`. Height: 44px (minimum touch target).
- **Secondary Action**: Transparent background, border 1px solid `#2B2B26`, text `#2B2B26`. Hover: Background `#2B2B26` with text `#FFFDF7`.
- **Destructive / Red Alert**: Background `#B33A3A`, text `#FFFDF7`. Used for roster strikes, AWOL flags, or emergency swap cancellations.

### 2. Duty Badges & Status Chips (Dia Preto vs. Dia Vermelho)
- **Dia Preto (Useful / Weekday Service)**: Background `#2B2B2B`, text `#FFFDF7`, font Oswald, uppercase, padding `4px 8px`, border-radius `2px`. Represents standard battalion shifts.
- **Dia Vermelho (Weekend / Holiday Service)**: Background `#A83232`, text `#FFFDF7`, font Oswald, uppercase, padding `4px 8px`, border-radius `2px`. Represents red-scale guard posts, weekends, and critical garrison readiness.
- **Leadership / Graduação Chip**: Background `#C9A227`, text `#2B2B26`, font Oswald Bold.

### 3. Roster List & Duty Cards
- Rendered on `#FFFDF7` surfaces with `1px solid rgba(43, 43, 38, 0.12)` boundary.
- Left-aligned indicator bar (4px thick) dynamically rendered in `#A83232` (Dia Vermelho) or `#2B2B2B` (Dia Preto).
- Internal layout displays: Soldier Military ID / War Name (Inter Bold), Sub-unit/Fraction (Inter Medium), and Guard Post Assignment (Oswald Medium).

### 4. Input Fields & Selectors
- Background `#FFFDF7`, 1px solid border in `#2B2B26`. Active focus state features an outline in `#4A5D23` with 2px width and zero offset.
- Floating or fixed labels in Oswald SemiBold, uppercase, sized at 11px for crisp, form-like precision.

### 5. Checkboxes & Radio Elements
- Squared geometry (2px radius). Checked state displays background in `#4A5D23` with high-contrast white ticks. No soft shadows.

### 6. Operational Shift Bar (Sticky Header for Mobile)
- Pinned to the top of the interface: shows current duty Officer of the Day (Oficial de Dia), current battalion condition, and immediate phone/radio callouts using high-contrast tactical gold and olive tones.