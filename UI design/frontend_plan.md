# Komal.ai --- Frontend Plan & UI Design

## 1. Product Direction

**Komal.ai** is a calm, voice-first AI conversation/support experience.

Core feeling:

> **Talk freely. Be heard. Feel a little lighter.**

The interface should feel: - Minimal - Warm - Private - Human - Soft
rather than clinical - Voice-first - Visually immersive

For V1, focus on the frontend experience and interaction flow before
connecting the AI/backend.

------------------------------------------------------------------------

## 2. Main User Flow

``` text
Home
  ↓
Choose someone to talk to
  ↓
Male / Female therapist
  ↓
Therapist introduction
  ↓
Start Therapy
  ↓
Voice conversation
  ↕
Chat Log
  ↓
Save Chat / New Chat / Chat History
```

There are two therapist experiences:

``` text
Alex → male voice conversation
Komal → female voice conversation
```

The UI structure should remain almost identical for both.

------------------------------------------------------------------------

# 3. Pages Required for V1

## Page 01 --- Home / Landing Page

### Header

Top-left:

**Komal.ai**

Top-right:

**about** + arrow

### Center

**Start a free conversation**

*choose someone to talk to*

### Therapist Selection

Two minimal line-art portraits:

**Alex**\
Male therapist

**Komal**\
Female therapist

A small dot/line can visually separate them.

### Bottom Statement

**Talk freely. Be heard. Feel a little lighter.**

### Visual Style

-   Warm off-white base
-   Subtle pastel gradient
-   Fine vertical grid lines
-   Thin gray line-art portraits
-   Soft rounded buttons
-   Serif typography
-   Large whitespace

------------------------------------------------------------------------

# 4. Page 02 --- Male Therapist Introduction

### Top-left

**go back**

### Center

Large line-art portrait of Alex.

**Alex**

*Someone to talk to, whenever you need.*

### Actions

**Start therapy**

Secondary:

**Chat log**

Keep this page simple. Avoid long biographies, ratings, statistics, and
excessive buttons.

------------------------------------------------------------------------

# 5. Page 03 --- Female Therapist Introduction

Same structure as the male page.

**Komal**

*Someone to talk to, whenever you need.*

Actions:

**Start therapy**

**Chat log**

Only the therapist identity and voice change.

------------------------------------------------------------------------

# 6. Page 04 --- Male Voice Therapy

This is the main conversation screen.

### Layout

``` text
                  go back


             Voice Waveform


               I'm listening


             chat log   pause
```

### Center

A large animated voice waveform.

Possible status text:

-   **I'm listening**
-   **I'm speaking**
-   **I'm thinking**
-   **Paused**

### Bottom

Pill:

**chat log**

Circular control:

**pause / play**

------------------------------------------------------------------------

# 7. Voice Control Behaviour

## Listening / Play

When active:

-   Microphone access is enabled
-   User voice can be captured
-   Waveform animates
-   Status says **I'm listening**

## Pause

When paused:

-   Microphone is not actively listening
-   Waveform becomes static/minimal
-   Status says **Paused**
-   Control changes back to play

The microphone state should always be visually obvious.

------------------------------------------------------------------------

# 8. Page 05 --- Female Voice Therapy

Same layout as the male voice screen.

``` text
                  go back


             Voice Waveform


               I'm listening


             chat log   pause
```

The therapist's voice changes, while the visual system stays consistent.

------------------------------------------------------------------------

# 9. Page 06 --- Chat Log

The chat log is the text representation of the voice conversation.

### Top-left

**go back**

### Top-right

Small menu button.

Menu:

``` text
Save chat
New chat
Chat history
```

### Conversation

Use a clean editorial format rather than conventional messaging bubbles.

Example:

**You**

> I've been feeling really overwhelmed lately.

**Komal**

> That sounds like a lot to carry. Do you want to tell me what's been
> making things feel overwhelming?

The latest message can fade in subtly.

------------------------------------------------------------------------

# 10. Chat Log Interaction

The chat log updates automatically as the voice conversation progresses.

Example:

``` text
You
I've been having a difficult week.

Komal
I'm here. Take your time.

You
I don't really know where to start...
```

Keep the typography spacious and readable.

------------------------------------------------------------------------

# 11. Chat Menu

## Save chat

Saves the current conversation.

## New chat

Starts a new conversation.

Confirmation:

**Start a new conversation?**

Options:

**continue**\
**new chat**

## Chat history

Opens saved conversations.

------------------------------------------------------------------------

# 12. Free Tier

For V1, keep the free-tier rule simple:

### Free user

**1 saved conversation**

If the user tries to save another:

``` text
Your free plan includes 1 saved conversation.

Replace your existing saved chat?
```

Actions:

**replace saved chat**

**cancel**

Don't build a complicated subscription system during the first frontend
iteration.

------------------------------------------------------------------------

# 13. Chat History

Simple screen.

### Header

**Chat history**

### Saved conversation

Example:

``` text
Tonight
A difficult week
```

or:

``` text
Sep 15
Feeling overwhelmed
```

Clicking it opens the chat log.

For the free tier, show one saved conversation.

------------------------------------------------------------------------

# 14. Recommended Page Structure

The V1 screens are:

``` text
01. Home
02. Male Therapist
03. Female Therapist
04. Male Voice Therapy
05. Female Voice Therapy
06. Chat Log
07. Chat History
```

However, these should NOT necessarily be seven completely separate
codebases/pages.

Use reusable components.

For example:

``` text
TherapistPage
  therapist = Alex
  voice = male

TherapistPage
  therapist = Komal
  voice = female
```

Likewise:

``` text
VoiceTherapy
  therapist = Alex

VoiceTherapy
  therapist = Komal
```

------------------------------------------------------------------------

# 15. Frontend Architecture

Recommended structure:

``` text
src/
│
├── components/
│   ├── Header
│   ├── BackButton
│   ├── TherapistCard
│   ├── TherapistSelector
│   ├── Waveform
│   ├── VoiceControls
│   ├── ChatLog
│   ├── ChatMenu
│   └── ChatHistory
│
├── pages/
│   ├── Home
│   ├── Therapist
│   ├── Therapy
│   ├── ChatLog
│   └── ChatHistory
│
├── data/
│   └── therapists
│
├── styles/
│   └── global
│
└── App
```

------------------------------------------------------------------------

# 16. Therapist Data

Use data instead of hardcoding separate components.

``` text
Alex
- gender: male
- voice: male
- description: Someone to talk to, whenever you need.
- portrait: alex.svg

Komal
- gender: female
- voice: female
- description: Someone to talk to, whenever you need.
- portrait: komal.svg
```

This lets the same components render both therapists.

------------------------------------------------------------------------

# 17. Visual Design System

## Landing Background

Suggested base:

``` text
#FFF8F3
```

Use subtle gradients containing:

-   Soft peach
-   Blush pink
-   Pale lavender
-   Very subtle blue
-   Warm orange

Avoid highly saturated neon gradients on the landing page.

The stronger peach/orange gradient can be reserved for the immersive
therapy screen.

------------------------------------------------------------------------

# 18. Typography

The current design has an editorial, poetic feeling.

### Display / Emotional Text

Use a refined serif.

Possible fonts:

-   Cormorant Garamond
-   DM Serif Display
-   Playfair Display

### UI

Use a clean sans-serif.

Possible fonts:

-   Inter
-   Geist
-   Manrope

Recommended pairing:

``` text
Headings → Cormorant Garamond
UI → Inter
```

Italic serif can be used for emotional subtitles.

------------------------------------------------------------------------

# 19. Buttons

Buttons should be:

-   Rounded / pill-shaped
-   Low contrast
-   Soft
-   Minimal
-   No heavy shadows

Example:

``` text
┌────────────────────┐
│    start therapy   │
└────────────────────┘
```

Avoid heavy gradients, thick borders, and generic SaaS styling.

------------------------------------------------------------------------

# 20. Waveform

The waveform should become one of Komal.ai's visual identities.

### Idle

Small waveform.

### Listening

Reacts to microphone input.

### AI speaking

Reacts to AI audio playback.

### Paused

Minimal/static horizontal line.

### Thinking

Slow subtle animation.

It should feel elegant rather than like a music player.

------------------------------------------------------------------------

# 21. Interaction Philosophy

The core principle:

> **Less UI. More conversation.**

Ideal journey:

``` text
Open Komal.ai
      ↓
Choose someone
      ↓
Start therapy
      ↓
Talk
```

Everything else should remain secondary.

------------------------------------------------------------------------

# 22. Responsive Design

### Desktop

Large centered artwork and waveform.

### Tablet

Reduce portrait and typography scale.

### Mobile

Therapist cards can stack vertically or become horizontally swipeable.

Voice screen:

``` text
       go back


   smaller waveform


    I'm listening


 [chat log] [pause]
```

Keep the waveform centered.

------------------------------------------------------------------------

# 23. V1 Development Order

### Step 1

Set up the project.

### Step 2

Implement typography, colors, gradients, spacing, and global styles.

### Step 3

Build Home.

### Step 4

Build reusable therapist selection.

### Step 5

Build therapist introduction.

### Step 6

Build voice therapy screen.

### Step 7

Implement waveform animation.

### Step 8

Implement play/pause UI state.

### Step 9

Build chat log.

### Step 10

Build chat menu.

### Step 11

Build chat history.

### Step 12

Connect navigation.

### Step 13

Test desktop + mobile.

### Step 14

Only then connect:

-   Microphone
-   Speech-to-text
-   AI response
-   Text-to-speech
-   Conversation storage

------------------------------------------------------------------------

# 24. Frontend States to Prototype

``` text
Home
↓
Choose Alex
↓
Alex Introduction
↓
Start Therapy
↓
Listening
↓
AI Speaking
↓
Paused
↓
Chat Log
↓
Chat Menu
↓
Save Chat
↓
Chat History
↓
New Chat
```

Repeat the same flow for Komal.

------------------------------------------------------------------------

# 25. Don't Build These Yet

Initially avoid spending time on:

-   Authentication
-   Payments
-   Subscription dashboard
-   Complex profiles
-   Admin dashboard
-   Database architecture
-   Analytics dashboard
-   Complex settings
-   Dark mode
-   Multiple subscription tiers
-   Advanced AI memory

First make the **core conversation experience feel right**.

------------------------------------------------------------------------

# 26. Final V1 Experience

Landing:

``` text
                    Komal.ai

             Start a free conversation
               choose someone to talk to


             Alex          ●          Komal
               ◯                       ◯


        Talk freely. Be heard. Feel a little lighter.
```

Therapist:

``` text
                    Alex

                  [portrait]


       Someone to talk to,
          whenever you need.


             Start therapy
               Chat log
```

Voice:

``` text
                    go back


              ── waveform ──


                I'm listening


             chat log   pause
```

Chat:

``` text
go back                              ⋯

You
I've been feeling overwhelmed lately.

Komal
I'm here. Take your time.

You
I don't know where to start.

Komal
You don't have to know. We can start anywhere.
```

This is the core product loop.

------------------------------------------------------------------------

# 27. Important Product Note

Because the product is positioned around therapy/mental-health
conversations, the eventual product should clearly distinguish an **AI
companion/support tool** from a licensed human therapist.

The interface can still use warm language such as **talk**,
**conversation**, and **someone to talk to**, while avoiding claims that
the AI is a licensed clinician.

For the prototype, prioritize a feeling of safety, calm, privacy, and
transparency.
