# Publishing an article on estherlindanigiwan.com

Your website is now the home of every article. Publish here first, then share to LinkedIn and Medium.

## 1. Publish on the website (about 3 minutes)

1. Open the `posts` folder in the GitHub repository (github.com/enigiwan-sys/estherlindanigiwan).
2. Open `_TEMPLATE.md`, click the copy icon to copy its text, then go back to `posts`.
3. Click **Add file > Create new file**. Name it with the date and a short title, for example:
   `2026-11-10-choosing-your-first-banking-partner.md`
4. Paste the template and fill in the top block:
   - `title`: the article headline
   - `date`: publication date, written as 2026-11-10
   - `summary`: one or two sentences (shown on the Writing page, in the RSS feed and in link previews)
   - `tags`: two or three topics, separated by commas
   - `linkedin` and `medium`: leave empty for now; add the links later if you like
   - `draft`: change to `false` when you are ready to publish (keep `true` to save without publishing)
5. Replace the sample text below the block with your article. Leave a blank line between paragraphs. Use `##` for subheadings.
6. Click **Commit changes**. Netlify rebuilds the site automatically within about a minute.

Your article is now live at `estherlindanigiwan.com/writing/<short-title>/`, listed on the Writing page, shown in the latest three on the homepage, and added to the RSS feed at `estherlindanigiwan.com/feed.xml`.

## 2. Share to LinkedIn

**Announcement post (automatic, set up once):**
In Zapier (or Make or IFTTT), create: *RSS by Zapier: New Item in Feed* with feed URL `https://estherlindanigiwan.com/feed.xml`, then *LinkedIn: Create Share Update* with the item title, summary and link. Each new article then announces itself on your profile.

**Africa Fintech Insider edition (manual):**
Paste the article into a new newsletter edition. End with your bio statement and "First published at estherlindanigiwan.com".

## 3. Import to Medium (1 minute)

1. Go to medium.com/p/import.
2. Paste the article's link from your website and click Import.
3. Check the formatting, then publish. Medium marks your website as the original source, which protects your search ranking.

Optional: add the LinkedIn and Medium links to the article's `linkedin:` and `medium:` lines, so readers see where else it lives.

## Good to know

- Files whose names start with `_` are never published (that is how the template stays private).
- To fix a typo, open the article file in GitHub, click the pencil icon, edit and commit.
- To link to an article that lives only on Medium, add a file with an `external:` line pointing to it (see the two existing Medium articles in `posts`).
