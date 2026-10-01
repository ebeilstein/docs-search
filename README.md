# Employee Help Guides (prototype)

A searchable help site. People type a question in their own words ("how do I reset my password")
and get walked through the matching guide one step at a time. Everything runs in the browser:
no server, no AI service, no API keys.

## Adding or editing a guide

1. Create a Markdown file in `docs/` (copy an existing one as a template). The file name becomes the link, e.g. `docs/reset-password.md` → `#/reset-password/1`.
2. Use this layout:

   ```markdown
   ---
   title: Reset your password
   keywords: forgot password, locked out, can't log in
   category: Accounts
   ---
   One or two sentences on what this guide is for.

   ## Before you start
   - Things to have ready (optional section)

   ## Steps
   1. First step. **Bold** the buttons and menu names people should look for.
      An indented line under a step adds extra detail.
   2. Second step.

   ## If something goes wrong
   - **Problem:** what to do (optional section)
   ```

3. Commit to `main`. A GitHub Action rebuilds `search-index.json` automatically.

**Tips for good search results:** put the words people actually say into `keywords`
(e.g. "paystub", "locked out", "W4"), and not just the official term.

## Running it locally

```sh
node build.js            # regenerate search-index.json after editing docs
python3 -m http.server   # then open http://localhost:8000
```

The page must be served over http(s); opening `index.html` directly from disk won't load the guides.

## Customizing

- **Help contact text:** the `HELP_CONTACT` line near the top of the script in `index.html`.
- **Colors:** the variables at the top of the `<style>` block.

The four guides in `docs/` are sample content; replace them with your real procedures.
