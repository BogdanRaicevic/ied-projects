# Racun V2 Frontend Visual Notes

## Goal

Keep the UI clean and professional, but make it easier to answer these questions at a glance:

- Where am I in the form?
- Which section matters right now?
- How many stavke do I already have?
- What is the most important financial result?

Constraint: stay within `React + MUI`, without introducing a custom design system outside what MUI already supports well.

## High-Level Read

What works now:

- spacing is calm and professional
- cards are consistent
- the layout is already structurally sound

What is missing:

- not enough visual hierarchy
- most cards have the same visual weight
- repeated `stavke` do not feel grouped as one collection
- `Pregled` gives equal importance to too many things at once

The result is not "bad", it is just too flat.

## Design Direction

I would not solve this with many strong colors.

I would use a **mostly white UI with controlled accents**:

- white for main surfaces
- very light tinted backgrounds for grouping
- one accent per section
- one strong accent for the final total / CTA area
- semantic colors only for warnings, errors, and success-like completion states

That gives orientation without making the screen noisy.

## Recommended Color Strategy

## 1. Page-Level Hierarchy

Right now white card on white page on white nested card creates low separation.

Suggested approach:

- page background: `grey.50` or a custom very light neutral
- major sections: white `Card`
- nested / derived areas: tinted `Box` or `Paper`
- active / focused section: subtle colored outline or header tint

MUI-friendly patterns:

- `borderColor: "divider"` as baseline
- `borderLeft: 4` for section identity
- `bgcolor: alpha(theme.palette.<color>.main, 0.04 - 0.08)` for light section tint
- `Chip` for status/count/type

## 2. Section Accent Colors

Use section accents sparingly, mostly in:

- top border or left border
- small icon / chip
- section header background tint

Suggested mapping:

- `Izdavac racuna`: `primary` / blue
- `Primalac racuna`: `secondary` or `info`
- `Stavke`: `teal` / `info`
- `Avans` / `Uslovi placanja`: `warning`
- `Pregled`: `success` or strong `primary`

Important: do **not** fill entire cards with color. Keep it to accents and very light tint.

## 3. Repeated Stavke Need Their Own Language

This is the biggest visual opportunity.

At the moment, multiple stavke are just multiple white cards. That makes them blur together.

I would add 4 layers of identification:

### A. Section summary in `Stavke` header

In the `Stavke` section header:

- add count chip: `3 stavke`
- optionally show split chips: `2 usluge`, `1 proizvod`

MUI:

- `CardHeader`
- `Chip`
- `Stack direction="row"`

### B. Each stavka gets a visible identity bar

Each `UslugaStavkaCard` / `ProizvodStavkaCard` should have:

- a colored top border or left border
- a stronger title row
- a pill/badge for type
- large sequence number

Example visual hierarchy:

- `Usluga`
- `Stavka #2`
- `Naziv usluge`

MUI:

- `Card` with `borderLeft`
- `Chip size="small"` for `Usluga` / `Proizvod`
- `Typography` with stronger title sizing

### C. Differentiate by type first, not by random color

I would not give every stavka a different color.

I would color by **type**:

- `Usluga`: `info` tint
- `Proizvod`: `success` tint

This keeps the logic memorable.

If you want more separation between multiple cards of the same type, use:

- alternating neutral backgrounds
- or a tiny numbered badge

not a rainbow.

### D. Group the list visually

The full `StavkeSection` can sit inside a slightly tinted container so the repeated cards feel like one "zone".

Example:

- white outer section card
- inside it, a `Box` with light tinted background
- individual white stavka cards inside that zone

That creates clear nesting.

## Recommendation for `Stavke`

If I were doing this as a senior FE, I would push toward this structure:

1. `Stavke` section header with count chips.
2. A light background container for the list.
3. Each stavka card with:
   - type chip
   - index badge
   - remove action separated visually
   - subtotal strip that looks like a footer, not just another block
4. Add-buttons in a dedicated action row, visually separated from the cards.

Extra improvement:

- after adding a new stavka, scroll to it and briefly highlight it
- when a field inside one stavka is focused, slightly strengthen that card border

Both are possible in React + MUI only.

## `Pregled` Needs Reordering, Not Just More Color

The current `Pregled` is doing too much in one card:

- totals
- deductions
- rok / datum
- stavke list
- validation errors
- main CTA

That makes the important number compete with everything else.

## Recommended `Pregled` Structure

Split it into 4 clear blocks inside the same right panel:

### 1. Financial summary first

Top area should contain only the money hierarchy:

- Poreska osnovica
- PDV
- Avans / Odbitak if applicable
- final emphasized total

The final total should be visually dominant:

- larger type
- tinted background
- stronger border
- more padding than the regular rows

Think "invoice outcome card inside the summary card".

### 2. Timing / payment metadata second

Below the total:

- `Rok za uplatu`
- `Datum uplate avansa`

These are secondary facts. They should not visually compete with the total.

Use:

- smaller section label
- subtle divider
- compact rows

### 3. Stavke preview third

The stavke list inside `Pregled` should be treated as a compact preview, not a full detailed list.

Recommended options:

- show first 3 stavke + `+2 jos`
- or use compact chips / mini rows
- or make the block collapsible if there are many stavke

If there are many items, long vertical lists will make the panel feel cramped very quickly.

### 4. Error + CTA footer last

The submit button should feel like the final action area.

I would place:

- validation state just above CTA
- CTA in its own top-separated footer zone

If there are errors:

- show error count as a compact summary first
- only expand the full list when needed

That reduces visual panic.

## Suggested `Pregled` Visual Hierarchy

Good priority order:

1. `Ukupna naknada`
2. `CTA`
3. `Error state` if present
4. `Poreska osnovica / PDV / Avans`
5. `Rok za uplatu` / `Datum`
6. `Stavke preview`

That is closer to how users think:

- what is the number?
- am I allowed to continue?
- what is blocking me?
- what makes up that number?

## MUI Components I Would Use

Within your current stack, I would limit myself to:

- `Card`, `CardHeader`, `CardContent`
- `Paper`, `Box`, `Stack`, `Grid`
- `Chip`, `Divider`, `Alert`, `Button`
- `List` only for short previews
- `Collapse` or `Accordion` for expandable error or stavka preview
- `Badge` only if you want count emphasis

I would avoid overcomplicating it with heavy custom wrappers unless you are ready to standardize them.

## Concrete Color Rules

These rules are important so the screen stays elegant:

- one strong color per section max
- only one area on screen should look "loud"
- final total gets the loudest emphasis
- errors use MUI error colors only
- warnings use warning only for true warnings, not for decoration
- type colors (`Usluga`, `Proizvod`) should stay consistent everywhere

## What I Would Change First

If we want the highest impact with low implementation risk:

1. Add page/background layering so cards are not all on pure white.
2. Add section accent borders/tints to major cards.
3. Add count/type chips and stronger identity for each stavka card.
4. Rebuild `Pregled` into grouped blocks with a dominant final total.
5. Reduce the visual length of the stavke list inside `Pregled`.

That alone should make the flow much easier to scan.

## Questions For You

I want you to answer these, even if the answer is "I don't know yet".

### Overall direction

1. Do you want the UI to stay very corporate / neutral, or can it feel a bit more product-like and modern?
2. Are you okay with a very light gray page background, or do you want the page to remain fully white?
3. Do you want color to communicate **section type**, **importance**, or both?

### About `Stavke`

4. When users add stavke, is it usually `1-3`, or can it become `10+` often?
5. Do users need to compare multiple stavke side by side mentally, or mostly edit one at a time?
6. Would you like each stavka to be always expanded, or are you open to collapsed summaries with expand-on-click?
7. Should `Usluga` and `Proizvod` feel clearly different visually, or only subtly different?
8. Do you want the add buttons to stay at the bottom, or should there also be an add action near the section header?

### About `Pregled`

9. Is the main purpose of `Pregled` to reassure the user while typing, or to prepare them for submission?
10. Should the `Pregled` list every stavka in detail, or only summarize them?
11. When there are validation errors, do you want a compact error count or the full list always visible?
12. Would you like the final total to sit in a tinted block that looks almost like a mini receipt?

### About interaction

13. Do you want the currently active section to highlight when the user focuses an input inside it?
14. Should we visually mark completed sections, or only the active one?
15. On smaller screens, is the right summary panel still important, or can it become a collapsed summary block lower on the page?

### About tone

16. If I gave you 3 tones, which is closer to what you want:
    - calm accounting software
    - polished internal business tool
    - modern productized workflow app
17. Should the interface feel more "finance-formal" or more "guided and friendly"?

## My Bias / Recommendation

If you want my honest senior FE opinion:

I would choose **polished internal business tool**.

That means:

- mostly white
- soft gray page background
- restrained section accents
- strong type hierarchy
- clear repeated-card identity for stavke
- a more premium, less cramped `Pregled`

Not colorful. Just clearer.

## Suggested Next Step

After you answer the questions above, I can turn this into one of these:

1. a precise visual spec for each section
2. a small MUI theme proposal with exact palette usage
3. an implementation plan for `StavkeSection` and `SummaryPanel`
