# Changelog

## 1.2.2 - 2026-11-13

- Explicitly use English when Lampa has no selected language or requests an unsupported locale; preserve all seven existing translations.
- Rewrite README in English with step-by-step installation instructions for Lampa, GitHub Pages publishing and local Synology/Lampac hosting.
- Document the different behaviors of public plugin URLs, caching, manual plugin titles and non-destructive upgrades.

## 1.2.1 - 2026-11-13

- Shortened **All Favorites** sidebar and screen title across all seven languages.
- Added read-only localized **Version** and **Author** fields in plugin settings.
- Preserved existing sorting, category choices and menu visibility preferences.
- Documented naming behavior in the plugin-list card and public GitHub Pages distribution.

## 1.2.0 - 2026-11-13

- Added release-year ascending/descending sorting for movies and TV series (first air date).
- Missing or invalid release years sort last; equal-year order remains stable.
- Added setting to show/hide the optional All Favorites sidebar entry, enabled by default.
- Preserved the settings entry and saved favorites when the sidebar entry is hidden.
- Added localizations for new controls in seven languages and mock API regression tests.


## 1.1.0 - 2026-11-13

- Added seven languages with English fallback.
- Registered extension metadata (name, description, author and version).
- Added immediate refresh of active favorites and bookmarks views after changing a select.
- Preserved existing v1.0 saved sort preferences.
- Kept sorting read-only and excluded history/unrelated Favorite queries.
- Added documentation, license and automated mock API tests.

## 1.0.0 - 2026-11

- Initial experimental category sorting and unified favorites view.
