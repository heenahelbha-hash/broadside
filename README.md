# Broadside — Community Letterpress Print Shop

> A community letterpress print shop dedicated to hand-pulled wood & metal type editions, workshops, open press access, and typographical preservation.

---

## Visual Vernacular & Design Choices

- **Color Palette**:
  - Paper: `#F7F3E9` (warm cotton rag paper tone)
  - Ink Black: `#1B1810` (deep printer's lampblack)
  - Hot Press Red: `#B7472A` (sparingly applied vermilion press accent)
  - Olive: `#5C6B4A` (secondary earthy shop ink)
  - Mustard: `#C9971C` (job ticket & swatch accent)
- **Typography**:
  - Display & Headlines: **Anton** (bold, condensed display face for authentic wood-type broadsides)
  - Body & Editorial Copy: **Source Serif 4** (workmanlike serif for genuine print readability)
  - Press Specs & Job Tickets: **Space Mono** (monospaced compositor metrics)
- **Layout Highlights**:
  - **Stacked Broadside Hero**: Authentic poster lockup with varying condensed widths, Oxford double borders, printer's ornaments, and registration crosses.
  - **Interactive "Pull a Proof" Letterpress Simulator**: Live Vandercook bed & cylinder animation with synthetic mechanical sound (via Web Audio API), randomized sub-pixel registration jitter, ink density variation, deboss shadows, and an authentic press inspection log.
  - **How a Job Gets Made**: Genuine 3-step sequence (**Compose → Ink → Pull**) with diagrammatic letterpress illustrations.
  - **Workshop Schedule**: Styled as a perforated printed order sheet / job ticket table with level filters and voucher reservation modal.
  - **Print-Job Gallery**: Tactile color and ink swatches instead of stock photography, complete with loupe inspector cards detailing pigment ratios and makeready notes.
  - **Shop Foundry Roster**: Real equipment profiles for the Vandercook SP-15, Chandler & Price 10×15 Platen, and the Wood Type Morgue.

---

## Deployment to GitHub Pages

This project is already initialized with `git` on the `main` branch. To publish it to GitHub Pages:

```bash
cd broadside
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/broadside.git
git push -u origin main
```

Then in your repository:
1. Go to **Settings → Pages**.
2. Under **Build and deployment > Source**, select **Deploy from a branch**.
3. Set the branch to `main` / `(root)` and click **Save**.
4. The site will be live at:
   ```
   https://YOUR-USERNAME.github.io/broadside/
   ```

---

## Local Preview

To view locally, open `index.html` directly in any modern web browser, or run a lightweight local static server:

```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.
