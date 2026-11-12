"""Regenerate compact decorative WebP assets and a single font stylesheet.
Original PNGs and upstream font CSS/licenses remain unchanged.
Requires Pillow. WebP quality 85 intentionally trades invisible texture detail
for much lower cold-start transfer; output is not pixel-identical/lossless.
"""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1] / 'public/assets'
for name in ['paper-left', 'paper-right', 'environment', 'scroll-paper', 'bookmark', 'task-paper']:
    image = Image.open(root / (name + '.png'))
    image.save(root / (name + '.webp'), quality=85, method=6)
    print(name, (root / (name + '.webp')).stat().st_size)
styles = []
for family in ['noto-serif-sc', 'noto-sans-sc', 'eb-garamond']:
    css = (root / 'fonts' / family / 'index.css').read_text(encoding='utf-8')
    # Late downloaded fonts must not change line lengths/pagination mid-session.
    css = css.replace('font-display: swap', 'font-display: optional')
    styles.append(css.replace('url(./files/', 'url(./' + family + '/files/'))
(root / 'fonts/fonts.css').write_text('\n'.join(styles), encoding='utf-8')
