# Editing the website with Keystatic (simple guide)

This guide is for **editors and content owners**. You do not need to write code. Keystatic is the admin area where you update text and images that appear on the public site.

The site is **one page**: everything is edited under **Site** in the admin.

---

## How to open the admin

1. Open the website in your browser (for example your live site or a preview URL your team gives you).
2. Go to the **admin address** by adding **`/keystatic`** to the end of the site address.  
   **Example:** if the site is `https://example.com`, open `https://example.com/keystatic`
3. **If the browser asks for a username and password**, use the login your technical contact provided. (If nothing asks, the admin may be open only on a local test machine—that is normal during development.)

You should see the Keystatic dashboard with **Site** as the main (or only) content area.

---

## Saving your work

- Use **Save** (or the equivalent control) in the admin when you finish an edit.
- A small **“Saved”** message may appear briefly after a successful save.
- On the **live server**, changes usually show on the public page after you **refresh** the browser (you may need to wait a second after saving).

---

## Site (everything on the home page)

**Site** is a single document. The fields below control the hero area (full-screen background section), then the **Contact** section at the bottom.

### Text and images (structured fields)

| What you see in the admin | What it does on the site |
|---------------------------|---------------------------|
| **Title** | Main heading and browser tab title |
| **Description** | Short intro under the title; also used for search-engine description |
| **Logo** | Large logo near the top of the hero area (uploaded image) |
| **Background picture** | Full-screen photo behind the hero content |
| **Press text** | Longer text block; you can use line breaks |
| **Album iframe** | Paste a **player URL** (e.g. Spotify or Bandcamp embed link) or the **iframe code** your streaming platform gives you |
| **Video → Video iframe** | Paste a video URL or the full iframe code from YouTube, Vimeo, etc. |
| **Video → Video thumbnail** | Shown as the preview; the play icon appears on hover and the real player loads only after click (saves bandwidth). Add both thumbnail and iframe for this behavior. With iframe only (no thumbnail), the video embed shows immediately. |

### Contact (rich text)

The **Contact** editor is **rich text**: headings, bold, lists, links, and similar formatting. That content appears in the **Contact** section **below** the full-screen hero area—not in the YAML fields above.

Use **Save** when you are done.

---

## Images

Logo, background, video thumbnail, and similar assets are stored under **`public/images/`** in folders managed by Keystatic (`logo`, `site-background`, `video`, etc.). You usually only need to **upload** or **choose** a file in the admin; the correct folder is set for you.

---

## If something goes wrong

- **Cannot open `/keystatic`** — Check the address, try again after your team confirms the site is running, or ask for the correct URL and login.
- **Save fails** — Note the message, try again, and contact your technical person with what you were editing.
- **Public site does not update** — Hard-refresh the page (or try another browser). If it still fails, the live server or deployment may need attention from your technical contact.

---

## Technical follow-up (optional)

Saved content lives in **`src/content/site/index.mdoc`**: YAML at the top for the structured fields, then the **Contact** Markdoc body. Someone with access to the code may **commit** those files to version control so backups and history stay in sync. You do not need to do that yourself unless your team has asked you to.

For how the site is wired technically, see [`keystatic-cms.md`](keystatic-cms.md).
