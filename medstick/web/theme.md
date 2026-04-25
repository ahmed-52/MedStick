# MedStick Next.js App Theme

This file documents the active visual theme used by the Next.js dashboard and chat app in `medstick/web/`.

Scope:
- Included: dashboard shell, home screen, chat UI, patients, library, shared app chrome
- Excluded: settings UI and generic template settings pages

## Theme Summary

The app uses a restrained clinical dashboard theme built on top of the AlignUI token system. The product no longer uses the original green fintech accent as its main identity. The active product look is:

- institutional and clinical, not playful
- white and off-white surfaces with cool blue accents
- WHO/UN-inspired blue palette
- soft slate text hierarchy
- rounded cards and shells
- low-shadow, low-noise, evidence-led interface

The design goal is not “consumer health app” and not “generic SaaS admin”. It is a calm, trustworthy on-device clinical workspace.

## Core Palette

### Product Theme Tokens

These are the real brand/product tokens currently driving the app:

- `--color-who-blue`: `#009edb`
- `--color-who-blue-hover`: `#0086bd`
- `--color-who-blue-deep`: `#00669e`
- `--color-who-navy`: `#0a2540`
- `--color-who-tint`: `#e6f4fb`
- `--color-who-canvas`: `#f7f9fb`
- `--color-who-ink`: `#0a1628`
- `--color-who-ink-soft`: `#475569`
- `--color-who-ink-mute`: `#94a3b8`
- `--color-who-surface`: `#eef2f6`
- `--color-who-ring`: `rgba(10, 22, 40, 0.08)`
- `--color-who-ring-strong`: `rgba(10, 22, 40, 0.14)`
- `--color-who-ok`: `#2e7d32`
- `--color-who-warn`: `#ed6c02`
- `--color-who-err`: `#c62828`

### Semantic Overrides Applied Across App

The global theme remaps the template tokens so the app inherits the clinical palette:

- primary actions use WHO blue
- neutral backgrounds are cooler and less gray-warm
- text shifts from generic gray to slate/ink values
- success/warning/error colors are calmer and more medical UI appropriate

### Color Usage Rules

- Use `--color-who-blue` for primary CTAs, selected states, key icons, and active nav
- Use `--color-who-blue-deep` for emphasis text, active icons, and blue-on-light surfaces
- Use `--color-who-canvas` for soft page backgrounds and hover surfaces
- Use `--color-who-tint` for icon chips, badges, selected pills, and light accent fills
- Use `--color-who-navy` for major headings and dark actions
- Use `--color-who-ink` for primary content text
- Use `--color-who-ink-soft` for supporting copy
- Use `--color-who-ink-mute` for metadata, labels, and subdued annotations
- Use ring borders instead of heavy shadows or loud card outlines

## Typography

### General Typographic Direction

Typography is restrained, compact, and institutional.

- Primary typeface: `Inter, system-ui, sans-serif`
- Headline utility: `.font-headline`
- Display utilities: `.font-display`, `.font-display-tight`
- Numeric utility: `.font-tabular`

### Headline Behavior

Headlines are not oversized marketing statements. They are:

- semibold
- tight tracked
- low line-height
- sentence case or title case
- authoritative without being dramatic

The actual headline utility:

- weight: `600`
- letter spacing: `-0.018em`
- line height: `1.05`

### Text Hierarchy

The app consistently uses:

- major headings: navy / strong ink
- section labels: uppercase micro labels with wide tracking
- body copy: ink-soft
- metadata and helper text: ink-mute

Typical ranges in the product:

- page titles: `26px` to `34px`
- card titles: `18px` to `22px`
- list item titles: `14px` to `16px`
- supporting text: `12px` to `13px`
- metadata labels: `10px` to `11px`

## Shape Language

The UI uses rounded, soft clinical containers rather than sharp admin panels.

Common radii:

- page shells: `rounded-2xl` to `rounded-3xl`
- primary cards: `rounded-2xl`
- list rows and subcards: `rounded-xl`
- compact controls: `rounded-md` to `rounded-lg`
- pills and chips: `rounded-full`

Logo treatments:

- sidebar badge: blue rounded box, not circular
- empty chat state: rounded square blue badge with white logo

## Surfaces and Elevation

### Surface Hierarchy

1. Page canvas
- usually `--color-who-canvas`
- soft off-white blue-tinted background

2. Primary cards
- white background
- thin ring border using `--color-who-ring`

3. Interactive sub-surfaces
- `--color-who-canvas` or `--color-who-tint`
- used for hovers, icon backgrounds, selected light states

### Shadow Style

Shadows are subtle and sparse:

- soft, low-opacity shadows on special input shells or logo badges
- ring borders carry most of the structural work
- no glassmorphism, no heavy depth, no flashy gradients

## Motion and Interaction

Interaction is understated and functional.

- small color transitions
- subtle press behavior via `.clinical-press`
- focus states use WHO blue rings
- hover usually shifts background to canvas/tint or deepens the blue

No bounce, no glow, no decorative motion system.

## Dashboard / Home Theme

The dashboard home mixes three tones:

1. Clinical console
- structured, evidence-led, institutional

2. Action launcher
- tiles, mode rows, and quick-entry tools

3. AI workspace
- chat-oriented prompt entry and consult launch

### Home Screen Characteristics

- large white cards on a WHO canvas background
- uppercase section labels for structure
- one strong blue featured action
- supporting tiles and rows with white surfaces and blue-tint icon chips
- charts and activity panels use restrained clinical styling, not startup analytics aesthetics

### Home Components

#### Hero / Featured Tile

Used for high-priority flows like outbreak or emergency tools.

- solid WHO blue background
- white text
- white/15 icon chip
- white secondary CTA pill inside the card
- rounded-2xl container

#### Standard Tiles

- white background
- ring border
- hover to WHO canvas
- blue-tint icon chip
- navy/ink title
- soft supporting copy

#### Mode List Rows

- white container with row dividers
- blue-tint icon chip by default
- row hover to WHO canvas
- right chevron in muted ink
- optional badge in WHO tint with deep blue text

#### Ask MedStick Card

This should visually feel like an extension of the chat composer.

- white outer card
- embedded white input shell with subtle shadow
- blue logo badge
- navy send button when active
- no hero-banner treatment
- minimal helper text

## Chat Theme

The chat interface is cleaner and quieter than the home screen. It behaves like a focused workspace inside a large white shell.

### Chat Shell

- white main surface
- rounded large desktop container
- subtle border
- sparse header
- centered message column

### Empty State

- blue rounded-square logo badge
- centered product name
- muted helper text
- lots of whitespace

The empty state should feel calm and deliberate, not promotional.

### Composer

The composer is one of the strongest visual references in the app.

- layered shell with soft outer background
- white inner container
- rounded high-radius shape
- dark navy send button when active
- muted disabled send state
- attachments preview as rounded media chips

This is the main reference for dashboard prompt-entry surfaces.

### Message Styling

#### User Messages

- soft neutral bubble, not bright brand color
- `bg-bg-soft-200`
- rounded with a slightly tighter bottom-right corner
- strong ink text

#### Assistant Messages

- mostly unboxed text flow
- markdown content inside a clean readable column
- no heavy assistant bubble chrome

#### Tool Messages

- centered cards or subdued rounded placeholders
- integrate with the same white-card clinical system

### Chat Header

- small breadcrumb-style title
- muted top meta
- low-noise ghost buttons
- active patient and active document chips are compact pills

## Sidebar Theme

The sidebar is part of the product theme and should match the dashboard canvas, not a leftover template brand.

Current characteristics:

- white sidebar body
- muted gray/slate text
- WHO blue active/primary states
- logo in a blue rounded box
- search uses canvas/tint surfaces
- active nav items use blue text and canvas/tint support
- chat history is secondary, not over-styled

### Sidebar Rules

- Never reintroduce green as the primary sidebar accent
- Keep active states blue and light, not loud
- Keep background white
- Use muted gray text for inactive items
- Use WHO tint for highlighted inline accents

## Component Pattern Rules

### Use This

- white cards with light clinical ring borders
- WHO blue for primary action
- navy for major emphasis
- tint backgrounds for icons and badges
- muted metadata with generous spacing
- semibold headings
- calm clinical microcopy

### Avoid This

- green default accents
- generic startup KPI styling
- loud gradients
- heavy shadows
- black-heavy dark buttons everywhere
- overusing solid blue backgrounds outside the main CTA moments
- marketing hero sections inside the core app

## Practical Theme Checklist

When adding or updating dashboard/chat UI:

1. Start from `--color-who-*` tokens, not raw random blues
2. Prefer white card + ring border first
3. Use `--color-who-blue` only for important actions and selected states
4. Use `--color-who-tint` for icon holders, badges, and light emphasis
5. Use `.font-headline` for key headings
6. Keep copy concise and calm
7. Match home prompt surfaces to the chat composer language
8. Match shell backgrounds to WHO canvas, not template gray
9. Keep settings styling out of product theme decisions

## Theme One-Liner

MedStick’s Next.js app theme is a white-and-clinical-blue on-device medical workspace: institutional, quiet, trustworthy, and action-oriented, with soft rounded shells, ring borders, navy headings, WHO-blue CTAs, and a chat-first interaction model.
