# Lampa Favorites Sort

**Sort your Lampa favorites by title or release year.** The plugin works with movies and TV series, both in one **All Favorites** view and in individual favorites categories. It does not change your saved bookmarks.

**Version:** 1.2.2  
**Author:** ARIALD  
**License:** MIT  
**Default language:** English (other translations follow your Lampa language)

## Install the plugin in Lampa (for users)

You need an existing installation of Lampa (including a compatible client such as Luxo on Apple TV) and a **public HTTPS URL** that serves `lampa-favorites-sort.js` as JavaScript. GitHub Pages is the recommended hosting option.

1. Open **Lampa** on your TV or device.
2. Go to **Settings → Extensions** (sometimes called **Plugins**, depending on your Lampa build).
3. Select **Add plugin / Add extension**.
4. Enter the installation URL:

   ```text
   https://ariald-com.github.io/Lampa-Favorites-Sort/lampa-favorites-sort.js
   ```

5. Confirm the URL. Check that the plugin entry is enabled and its request status is successful (often **200**).
6. Fully exit and reopen Lampa or the client app (for example, Luxo).
7. Open **Settings → Favorites Sort** to set the default sorting mode and per-category overrides. In the sidebar, open **All Favorites**, if the shortcut is enabled.

The plugin may appear as **Untitled / Без названия** in Lampa's **Extensions** list when added manually. This is the client's label for the URL entry, not necessarily an error in the JavaScript. Rename the entry to **Favorites Sort** using your client's edit/rename action, if available. The plugin's own settings show **Version** and **Author**.

**No CUB Premium subscription is required** for this plugin's local sorting functionality. A successful HTTP response confirms download but not necessarily runtime compatibility; verify that the settings page and sorting actually work.

## Publish an installable URL with GitHub Pages (for maintainers)

If you are publishing this repository for other users:

1. Create a **public GitHub repository**, for example `lampa-favorites-sort`.
2. Upload all repository files, including `lampa-favorites-sort.js` to the **repository root**, along with `README.md`, `LICENSE`, and `tests/`.
3. Open the repository's **Settings → Pages** page. Under **Build and deployment**, choose **Deploy from a branch**, select **main**, folder **/(root)**, and save.
4. Wait until GitHub Pages shows the published website URL. Then open the plugin URL in a browser:

   ```text
   https://ariald-com.github.io/Lampa-Favorites-Sort/lampa-favorites-sort.js
   ```

5. Verify the response shows JavaScript (it should begin with a `/*! Lampa Favorites Sort...` comment), **not an HTML 404 page**.
6. Put that exact `.js` URL in the GitHub repository description, README installation instructions and any Lampa plugin catalog submission.

The URL remains stable when you update the JavaScript in place. Client-side and CDN caching can delay updates, so **automatic immediate updates to all installations are not guaranteed**. There is no need to append `?v=1.2.2` for ordinary installation. If a client keeps an old build, restart it or re-add the URL with a temporary cache-busting query parameter.

## Install from your own Synology NAS / Lampac NextGen (local use)

If Lampa is already running through Lampac on your Synology, you can host the JavaScript locally. The path below is an **example from a specific Lampac Docker layout**: verify it matches your container's actual web root. Back up an existing copy first.

1. Upload `lampa-favorites-sort.js` to your NAS, for example:

   ```text
   /volume1/docker/lampac/lampa-favorites-sort.js
   ```

2. On the NAS, copy the file into the running container (example container name: `lampac`):

   ```bash
   sudo docker cp /volume1/docker/lampac/lampa-favorites-sort.js \
     lampac:/lampac/wwwroot/lampa-main/lampa-favorites-sort.js
   ```

3. From a device on the same local network, confirm that the actual URL serves JavaScript rather than an error or HTML:

   ```bash
   curl -fS 'http://NAS_IP:9118/lampa-main/lampa-favorites-sort.js' | head -n 3
   ```

4. In Lampa choose **Settings → Extensions → Add plugin** and use:

   ```text
   http://NAS_IP:9118/lampa-main/lampa-favorites-sort.js
   ```

   Replace `NAS_IP` with the NAS's IP address. Keep the TV and NAS on networks that can reach each other.
5. Restart Lampa and open **Settings → Favorites Sort**.

**Important:** `docker cp` changes only the currently running container. The file will disappear if Docker recreates that container. For a permanent local installation, use a bind mount to an existing web-served directory **after verifying that path** or host the JavaScript through GitHub Pages. Do **not** expose your NAS's Lampac port publicly just to distribute a plugin. TorrServer settings do not need to change.

## Configure the plugin

Go to **Settings → Favorites Sort**:

- **Open All Favorites:** Display one combined list of favorited movies and series with duplicates removed.
- **Show All Favorites in menu:** Show or hide the sidebar shortcut. Hiding it does not delete any favorites or remove the Open All Favorites settings action.
- **Default sort order:** Applies to All Favorites and categories without an override.
- **Bookmarks / Liked / Watch later / Watching / Watched / Planned / Continuing / Dropped:** Choose an independent order or **Use default**.
- **Version / Author:** Read-only information at the bottom of the plugin settings.

Available sorting modes:

| Mode | Behavior |
| --- | --- |
| Title A–Z / Z–A | Locale-aware alphabetical sorting |
| Release year: oldest / newest first | For movies, release year; for TV series, first-air year |
| Lampa order / Reverse Lampa order | Uses the order returned by Lampa, **not necessarily the date added** |
| No sorting | Preserve Lampa's native order |

Unknown release years appear at the end of a year-sorted list. Changing the sorting option should refresh an active favorites grid on supported builds; if not, reopen the screen.

## Language and translations

- **English is the default** when no UI language is configured or when the requested language is unsupported.
- If Lampa is configured to one of the supported languages, the plugin uses that translation: **English (`en`), Russian (`ru`), Ukrainian (`uk`), German (`de`), French (`fr`), Polish (`pl`), Spanish (`es`)**.
- Common regional variants such as `en-US` and `uk-UA` use their base language; `ua` is treated as Ukrainian.
- There is no separate language switch in the plugin: change the Lampa application language and restart Lampa if labels do not refresh immediately.

The installation instructions and this README are written in **English**.

## Updating or removing the plugin

**Update:** Replace the JavaScript at the same URL and restart Lampa. If the old build is cached, remove and add the extension URL again, optionally with a temporary query such as `?v=1.2.2`. Existing preferences saved under `ariald_favsort_*` are retained.

**Remove:** Remove/disable the URL from **Settings → Extensions**, then restart the client. Saved favorites are not deleted. Existing preference keys may remain in Lampa storage until cleared by the user.

## Compatibility, privacy and troubleshooting

- Uses the Lampa `Favorite`, `SettingsApi`, `Activity`, `Storage`, `Lang`, `Manifest`, and optional `Menu` APIs. Forks and TV clients may implement some of these differently; **not all devices have been physically tested**.
- Works client-side: no network requests made by the plugin, no favorites transmitted, no favorite records modified.
- If the URL reports 404, check case-sensitive filenames and Pages deployment. If it returns HTML, you probably pointed to a web page instead of the raw `.js` resource.
- If Lampa shows the plugin as enabled but no settings appear, restart it, check the JavaScript URL and test on a supported client.
- If the **All Favorites** sidebar entry cannot be hidden live on a particular fork, change the setting and restart Lampa; **Open All Favorites** remains accessible inside the plugin settings.
- If release-year sorting seems incomplete, some saved records lack release metadata. The plugin intentionally does not fetch missing information over the network.

Please include your client (Luxo, Android TV, browser, etc.) and Lampa version in GitHub issues.

## Development

Requires Node.js for local tests:

```bash
node --check lampa-favorites-sort.js
node tests/plugin.test.js
```

## License

MIT. See [LICENSE](LICENSE).
