# Plan: Reduce Product Card Size on Mobile Home Page

## Goal
Make product cards smaller on mobile version of home page.

## Current State
- Home page uses `ProductRow` component with horizontal scroll
- Cards have fixed width: `w-44 sm:w-48` (176px mobile, 192px sm+)
- Other pages (category, ProductListing) use different approaches:
  - Category: `w-44` horizontal scroll
  - ProductListing: responsive grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

## Problem
Product cards on home page feel too large on mobile because:
1. Fixed 176px width leaves little room for content with `p-4` padding
2. Text gets truncated heavily (`line-clamp-2`, `min-h-[40px]`)
3. Image area dominates the card

## Solution
Reduce mobile card width in `ProductRow.tsx`:
- Change from `w-44 sm:w-48` to `w-36 sm:w-44 md:w-48`
  - Mobile (< 640px): 144px (`w-36`)
  - sm (640px+): 176px (`w-44`)
  - md (768px+): 192px (`w-48`)

This matches the progressive sizing pattern and makes cards more compact on mobile.

## Files to Modify
1. `src/components/ProductRow.tsx` - Line 90: update width classes

## Validation
- Check mobile view: cards should fit better, less truncation
- Check tablet/desktop: should maintain similar appearance
- Verify horizontal scroll still works