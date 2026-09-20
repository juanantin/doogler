# Originals — WHAT IS STILL NEEDED

The artwork everything served is derived from. Nothing in this folder is
loaded by the page directly.

**This folder is empty.** The sibling's artwork was stripped when this repo was
copied from `juanantin/purr`, and nothing has been supplied for $DOOGLER yet.
Every image slot on the page is currently a dashed placeholder that names what
belongs in it — deliberately loud, because a missing photo that looks like a
design decision is the one that ships.

## What the owner needs to supply

| Drop it here | What it is | What gets derived from it |
|---|---|---|
| `mark_square.png` | A **square** mark — the dog's head, ideally already tight to it. 1024×1024 or larger, transparent ground preferred | `images/favicon.png`, `images/icon-192.png`, `images/icon-512.png`, `images/apple-touch-icon.png`, `/favicon.ico`, and `images/avatar.png` for the top bar and footer |
| `hero.jpg` | The hero photo — Jeffree in the “Doogler” bandana in front of the Dooglerplex sign. 1600px on the long edge or better | `images/hero.jpg` |
| `photo1.jpg`, `photo2.jpg`, `photo3.jpg` | The collage photos, roughly square | `images/photo1.jpg` … `photo3.jpg` |
| `earth.jpg` | The Earth-from-space image behind the dark banner. 2400px wide or better, since it runs full-bleed | `images/earth.jpg` |
| `wordmark.png` | The wordmark, if there is a drawn one | Optional — the page currently sets “$DOOGLER” as **live text** in Inter 800 with the four Google colours applied per letter, which stays crisp at any zoom and costs no request. A drawn wordmark would replace that; the text version is the better default |
| `launch_banner.png` | The banner the token launched with. `.github/workflows/fetch-art.yml` pulls this from thestonks.exchange once `contractAddress` is set, so it may not need supplying by hand | `images/social.jpg` — the 1200×630 share card |

## Deriving the served files

```bash
# Icons. Crop to the MOST RECOGNISABLE PART and pad back to a square: a full
# scene shrinks to noise at 16px, so it has to be the dog's head that survives.
python3 - <<'EOF'
from PIL import Image
src = Image.open('images/src/mark_square.png').convert('RGBA')
for size, out in [(192, 'images/icon-192.png'), (512, 'images/icon-512.png'),
                  (180, 'images/apple-touch-icon.png'), (64, 'images/favicon.png'),
                  (256, 'images/avatar.png')]:
    im = src.resize((size, size), Image.LANCZOS)
    if out.endswith('apple-touch-icon.png'):
        # iOS renders a transparent home-screen icon as BLACK, so this one
        # alone is flattened onto white.
        bg = Image.new('RGB', (size, size), (255, 255, 255))
        bg.paste(im, (0, 0), im)
        im = bg
    im.save(out)
src.resize((32, 32), Image.LANCZOS).save('favicon.ico', sizes=[(16,16),(32,32)])
EOF

# The share card: LETTERBOX onto 1200×630, never crop to it.
python3 - <<'EOF'
from PIL import Image
src = Image.open('images/src/hero.jpg').convert('RGB')
w, h = src.size
art = src.resize((1200, round(h * 1200 / w)), Image.LANCZOS)
card = Image.new('RGB', (1200, 630), (255, 255, 255))   # sample from the art's own border
card.paste(art, (0, (630 - art.height) // 2))
card.save('images/social.jpg', 'JPEG', quality=88, optimize=True)
EOF
```

**Letterbox the card, never crop it.** X crops a large-image card to 2:1 and
takes the SIDES. On the sibling that took the logo off one end and the tagline
off the other.

Then run `node scripts/stamp.mjs`, which moves every `?v=` in `index.html`
together with `version` in `config.js`, so browsers let go of the icon they
have cached.

## Where each slot lives in the markup

Search `index.html` for `art-slot` — every placeholder carries a comment saying
what belongs in it and what to swap it for. The dark banner's photo is set in
`assets/css/styles.css` on `.banner`, where the gradient that keeps the type
legible over it is already written out.
