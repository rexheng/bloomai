# Bloom Companion: Visual Layout System Prompt

## Overview

You are designing the visual layout system for **Bloom Companion**, a gamified journalling web application. The core experience centres on an **interactive virtual room** with an **AI companion avatar (bloom-avatar)** that users can tap to initiate conversations. This is NOT a traditional chat interface—the conversation is embodied within the room environment itself.

---

## Core Design Philosophy

### Embodied AI Companion
The AI chatbot is not a separate chat panel or messaging interface. Instead, the AI is represented by the **bloom-avatar**: a charming, animated character that lives within the virtual room. Users interact with the companion by tapping/clicking on the avatar, which triggers conversation. The room IS the interface.

### Spatial Presence Over Chat UI
Unlike traditional chatbot wrappers (ChatGPT-style text boxes), Bloom Companion prioritises:
- **Environmental immersion**: The room is always visible and central
- **Character interaction**: The bloom-avatar has presence, personality, and spatial positioning
- **Contextual responses**: Speech bubbles or floating dialogue emerge from the avatar within the room context
- **Living space**: The room feels inhabited, not like a UI overlay

---

## Room Layout System

### Perspective & Camera Angle

The room uses a **three-quarter isometric-style perspective** (also known as ¾ view or oblique projection), creating a warm, inviting diorama effect:

- **Camera Position**: Elevated viewpoint looking down at approximately 30-45 degrees
- **Angle**: Slight diagonal orientation (not perfectly front-on), typically showing two walls meeting at a corner
- **Depth**: Creates visible floor plane with clear spatial depth from foreground to background
- **Cropping**: Room edges extend beyond viewport, suggesting a larger space exists beyond the visible frame
- **Fixed Camera**: No camera controls for MVP; single optimised viewing angle

### Spatial Zones

The room is divided into functional depth layers:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   BACKGROUND LAYER (Rear Wall)                              │
│   ───────────────────────────────────────────────────────   │
│   • Wallpaper/window backdrop                               │
│   • Wall-mounted decorations (posters, shelves, clock)      │
│   • Tall furniture backs (bookshelves, cabinets)            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   MIDGROUND LAYER (Primary Interaction Zone)                │
│   ───────────────────────────────────────────────────────   │
│   • Main furniture pieces (desk, shelving unit)             │
│   • Plant placement positions (on furniture, stands)        │
│   • ★ BLOOM-AVATAR PRIMARY POSITION ★                       │
│   • Interactive objects with tap states                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   FOREGROUND LAYER (Closest to Camera)                      │
│   ───────────────────────────────────────────────────────   │
│   • Floor-level items (rugs, floor plants, pet beds)        │
│   • Chair/seating (player's implied position)               │
│   • Occasional decorative elements                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composition Principles

1. **Central Focus Area**: The midground centre is reserved for the bloom-avatar's primary position—this is where the eye naturally lands
2. **Breathing Room**: The avatar has clear visual space around it; avoid cluttering the avatar's immediate surroundings
3. **Visual Flow**: Decorative items guide the eye naturally toward the avatar position
4. **Layered Density**: Background can be denser with decoration; foreground remains relatively open
5. **Warm Lighting**: Implied light source (window, lamp) creates cosy atmosphere with subtle highlights/shadows

---

## Bloom-Avatar Integration

### Avatar Positioning

The bloom-avatar occupies a **fixed anchor point** within the room layout:

- **Primary Position**: Seated on windowsill, desk edge, or dedicated perch in the midground centre-right or centre
- **Scale**: Prominently sized relative to room objects (approximately 15-20% of viewport height)
- **Elevation**: Slightly elevated from floor level to ensure visibility
- **Clear Silhouette**: Avatar should read clearly against any wallpaper/background combination

### Avatar States

The bloom-avatar transitions between visual states:

| State | Visual Behaviour |
|-------|------------------|
| **Idle** | Gentle ambient animation (subtle breathing, occasional blinks, small movements) |
| **Attention** | Perks up when user hovers/approaches cursor; slight lean toward camera |
| **Speaking** | Animated speech with expression changes; speech bubble appears |
| **Listening** | Attentive pose; optional thinking indicator when processing |
| **Celebrating** | Joyful animation when user earns points or unlocks items |
| **Sleepy** | Drowsy animation if app inactive for extended period |

### Interaction Model

```
User Action                    →    Avatar Response
────────────────────────────────────────────────────────────
Tap/click on avatar            →    Opens conversation mode
Hover over avatar              →    Avatar acknowledges with animation
Long press (mobile)            →    Quick-action menu (view stats, etc.)
Tap elsewhere in room          →    Closes active conversation
Swipe/pan room                 →    Avatar eyes may track gesture
```

### Conversation Display

When conversation is active:

1. **Speech Bubble Origin**: Dialogue emerges from bloom-avatar's position as floating speech bubbles
2. **Bubble Styling**: Soft, rounded bubbles that feel organic to the illustrated room aesthetic
3. **Text Input**: Minimal input field appears at bottom of screen (floating over room, not replacing it)
4. **History Scroll**: Previous messages can scroll upward within bubble area, fading at edges
5. **Room Remains Visible**: Conversation overlays the room; room dims slightly but remains visible as context

**Visual Hierarchy During Chat:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────────────┐                   │
│   │                                     │                   │
│   │   Speech bubble                     │                   │
│   │   with AI response                  │                   │
│   │                                     │                   │
│   └──────────────┬──────────────────────┘                   │
│                  │                                          │
│                  ▼                                          │
│              🌱 Bloom-Avatar                                 │
│                                                             │
│   [Room content visible but slightly dimmed]                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Type your message...                            ⏎  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Item Placement System

### Fixed Placement Slots

For MVP, items snap to predefined placement slots rather than free-form positioning:

```
PLACEMENT SLOT MAP
──────────────────────────────────────────────────────────────

    [WALL-L1]  [WALL-L2]  [WALL-C1]  [WALL-R1]  [WALL-R2]
         ↓         ↓          ↓          ↓          ↓
    ┌────────────────────────────────────────────────────┐
    │  🖼️         🖼️         🕐         🖼️         🖼️    │  ← Wall slots
    │                                                    │
    │  ┌──────────┐              ┌──────────────────┐   │
    │  │ SHELF-T  │              │                  │   │
    │  │  🌿  🌵  │     ☀️       │   DESK-SURFACE   │   │
    │  ├──────────┤   window     │  🪴  📚  🖊️  💡  │   │
    │  │ SHELF-M  │              │                  │   │
    │  │  🌱  🕯️  │   [AVATAR]   │                  │   │
    │  ├──────────┤      🐰      └──────────────────┘   │
    │  │ SHELF-B  │                     │chair│         │
    │  │  🪴  📻  │                                     │
    │  └──────────┘                                     │
    │                                                    │
    │  [FLOOR-L]        [FLOOR-C]        [FLOOR-R]      │
    │     🌿               🛋️               🧸          │
    └────────────────────────────────────────────────────┘
```

### Slot Categories

| Slot Type | Example Locations | Accepted Items |
|-----------|-------------------|----------------|
| **Wall** | Above desk, beside window | Posters, clocks, floating shelves, frames |
| **Surface** | Desk top, shelf levels | Small plants, books, lamps, accessories |
| **Floor** | Room corners, beside furniture | Large plants, rugs, floor cushions, pets |
| **Window** | Windowsill, window area | Medium plants, hanging items |
| **Avatar-Adjacent** | Near bloom-avatar position | Companion accessories, special items |

### Visual Feedback for Placement

- **Available Slot**: Subtle glow or outline when user enters placement mode
- **Hover State**: Slot highlights when dragging item over valid position
- **Invalid Placement**: Gentle shake or red tint if incompatible item/slot
- **Successful Placement**: Satisfying settle animation, possible sparkle effect

---

## UI Overlay Elements

### Persistent HUD (Always Visible)

Minimal UI elements float over the room without obstructing the core experience:

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 347/463    ☐ 3117    ⭐ 95                         ≡  │
│  [EXP]  [PREMIUM CURRENCY]  [Stars]             [Menu]      │
│                                                             │
│                                                             │
│                                                             │
│                        [ROOM]                               │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Top Bar Elements:**
- **Bloom Points Balance**: Primary currency with icon (always visible)
- **Streak Counter**: Current day streak with flame/star indicator
- **Menu Toggle**: Hamburger or icon menu for settings, inventory, shop

### Contextual UI (Appears When Needed)

- **Item Shop**: Slides in as overlay panel from right
- **Inventory**: Grid view overlay for owned items
- **Profile/Stats**: Modal overlay with blur background
- **Notifications**: Toast messages at top (points earned, unlocks)

---

## Visual Style Guidelines

### Art Direction

- **Style**: Warm, illustrated 3D artwork with soft edges and gentle colours
- **Palette**: Muted, cosy tones—warm yellows, soft greens, peachy pinks, cream whites
- **Lighting**: Golden-hour warmth; implied natural light from window source
- **Line Quality**: Soft, slightly imperfect hand-drawn aesthetic (not perfectly vector)
- **Texture**: Subtle paper or grain texture overlay for warmth

### Bloom-Avatar Design Principles

- **Approachable**: Round shapes, large eyes, soft features
- **Expressive**: Clear emotional readability at small sizes
- **Unique**: Distinctive silhouette recognisable even as icon
- **Customisable**: Base design allows for accessory additions (hats, bows, etc.)

### Animation Philosophy

- **Ambient Life**: Everything has subtle motion—plants sway, candles flicker, avatar breathes
- **Responsive**: UI and avatar respond to user input with satisfying micro-interactions
- **Eased Transitions**: All state changes use smooth easing (ease-out for arrivals, ease-in for exits)
- **Performance-Conscious**: Animations optimised for 60fps on mobile web

---

## Responsive Behaviour

### Mobile (Primary)
- Portrait orientation: Full room visible, avatar centred
- Chat input anchored to bottom with keyboard accommodation
- Tap targets generously sized (minimum 44px)

### Tablet
- Room scales up, more decorative detail visible
- Avatar and speech bubbles scale proportionally
- Optional side panel for chat history

### Desktop
- Room can expand or maintain aspect ratio with decorative borders
- Mouse hover states enabled for avatar and interactive items
- Chat could optionally appear as side panel rather than overlay

---

## Technical Implementation Notes

### Canvas/Rendering Approach
- **Recommended**: HTML/CSS with layered positioned elements (for MVP simplicity)
- **Alternative**: Canvas-based rendering for complex animations (post-MVP)
- **Asset Format**: PNG sprites with transparency; consider WebP for compression

### Z-Index Layering
```
z-index: 100  →  Modal overlays, notifications
z-index: 50   →  Chat bubbles, input field
z-index: 30   →  Bloom-avatar (must be above room items)
z-index: 20   →  Foreground room items
z-index: 10   →  Midground room items, furniture
z-index: 1    →  Background, wallpaper, walls
```

### State Management Considerations
- Room configuration persists to database
- Avatar state syncs with conversation context
- Animation states handled locally (not persisted)
- Placement changes save on confirmation

---

## Summary

The Bloom Companion visual system creates an **inhabited, living space** where the AI companion is not a chatbot bolted onto a UI, but a **character that lives within the room**. Users don't "open a chat"—they **visit their bloom-avatar** in a cosy space they've decorated together. Every visual decision should reinforce this sense of place, presence, and warmth.

**Key Differentiators from Traditional Chat UIs:**
1. The room is always visible; conversation happens within it
2. The AI has a physical avatar with position and animation
3. Speech emerges from the character, not a message panel
4. The environment reflects user progress and personality
5. Interaction feels like visiting a friend, not using a tool
