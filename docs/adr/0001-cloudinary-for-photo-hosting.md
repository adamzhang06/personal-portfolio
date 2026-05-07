# ADR-0001: Cloudinary for photo hosting

**Status:** Deferred  
**Date:** 2026-05-06

## Context

Photos were self-hosted in `/public/photos/` and shipped with the repo. High-resolution camera files (Nikon Z5II, D750, F3 scans) are large — adding portrait sessions will compound this quickly. The photography revamp adds scroll-jump year navigation, which means all photo DOM elements exist on page load; without optimization, all images would network-request simultaneously.

## Decision

Host photos on Cloudinary (free tier). Store the Cloudinary URL per photo slot in the layout data. Cloudinary handles WebP conversion, responsive sizing via URL parameters (`w_`, `f_auto`), and CDN delivery. The repo no longer stores image files.

Photo metadata (camera, lens, film, settings, location, date) remains in the codebase alongside the Cloudinary URL — Cloudinary is a delivery layer only.

## Alternatives considered

**Keep self-hosting + vite-imagetools** — build-time WebP generation and srcset. Keeps the repo self-contained but doesn't solve repo bloat as portrait sessions grow, and requires a build step per new photo.

## Consequences

- Repo stays small regardless of how many portrait sessions are added
- Lazy loading with Intersection Observer handles the scroll-jump performance concern — images load as they enter the viewport, not all at once
- Dependency on an external service (Cloudinary free tier limits: 25GB storage, 25GB bandwidth/month)
- Photo URLs change if migrating away from Cloudinary in the future
