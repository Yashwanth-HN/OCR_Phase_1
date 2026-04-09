# Source Folder Structure

Use this layout to keep OCR code organized and easy to maintain.

## Existing folders
- `assets`: static images, icons, and media
- `components`: reusable UI components
- `hooks`: custom React hooks
- `lib`: shared helper utilities
- `pages`: route-level pages
- `test`: test utilities and test files

## New folders
- `features/ocr`: OCR-specific UI, hooks, and business logic
- `services`: API and external service calls (OCR endpoints, auth, storage)
- `types`: shared TypeScript types and interfaces
- `constants`: app-wide constants and config values
- `layouts`: page/frame layouts
- `utils`: pure utility functions not tied to React
- `styles`: global style modules, theme tokens, animation files

## Suggested placement examples
- OCR upload workflow: `features/ocr`
- OCR API client: `services`
- OCR response interfaces: `types`
- MIME limits and file-size limits: `constants`
