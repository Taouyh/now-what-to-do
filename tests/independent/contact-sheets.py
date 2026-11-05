from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
p=Path('docs/development/book-c-2026-11-05/independent-evidence')
for size in ['1600x1000','1280x800','390x844']:
 for language in ['zh-CN','en','ja']:
  files=[p/f'{size}-{language}-{theme}-{route}.png' for theme in ['light','dark'] for route in ['home','tasks','today','settings']]
  cell=(400,280) if size!='390x844' else (300,820)
  result=Image.new('RGB',(cell[0]*4,cell[1]*2),'white')
  draw=ImageDraw.Draw(result)
  for i,f in enumerate(files):
   im=ImageOps.contain(Image.open(f).convert('RGB'),(cell[0],cell[1]-22))
   x=(i%4)*cell[0];y=(i//4)*cell[1]
   result.paste(im,(x,y+22));draw.text((x+3,y+3),f.stem,fill='black')
  result.save(p/f'contact-{size}-{language}.jpg',quality=88)
