from pathlib import Path
from html.parser import HTMLParser
import json

ROOT = Path(__file__).parent / 'raw'
class Extract(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.text = []; self.links = []; self.scripts = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'): self.skip += 1
        if tag == 'script' and a.get('src'): self.scripts.append(a['src'])
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, text):
        if not self.skip and text.strip(): self.text.append(text.strip())

for path in ROOT.glob('*.html'):
    parser = Extract(); parser.feed(path.read_text(encoding='utf-8'))
    path.with_suffix('.txt').write_text('\n'.join(parser.text), encoding='utf-8')
    path.with_suffix('.links.json').write_text(json.dumps({'links':parser.links,'scripts':parser.scripts}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(path.name, 'scripts:', parser.scripts, 'store links:', [x for x in parser.links if 'apple.com' in x or 'play.google' in x])
apple = ROOT / 'apple-search-us.json'
if apple.exists():
    data = json.loads(apple.read_text(encoding='utf-8'))
    print('APPLE resultCount', data.get('resultCount'))
    for result in data.get('results', []): print(result.get('trackName'), result.get('sellerName'), result.get('trackViewUrl'))
