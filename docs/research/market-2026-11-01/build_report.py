"""Render the research graphic and a native-layer Figma import plugin.

This is artifact authoring only; it does not modify application code.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import html
import json

ROOT = Path(__file__).resolve().parent
WIDTH, PAD, GAP = 1440, 64, 24
FONT = Path('C:/Windows/Fonts/msyh.ttc')
BOLD = Path('C:/Windows/Fonts/msyhbd.ttc')
BG, INK, MUTED = '#F4F3EC', '#202D28', '#59665E'
GREEN, WHITE, LINE = '#255F48', '#FFFFFF', '#D9DFD5'


def block(text, kind='body', link=None):
    return dict(text=text, kind=kind, link=link)


def card(label, title, *body, tone='white'):
    return dict(tone=tone, blocks=[block(label, 'label'), block(title, 'title'), *body])


rows = [
    [dict(tone='plain', padding=0, blocks=[
        block('NOW WHAT  /  MARKET RESEARCH  /  01', 'eyebrow'),
        block('有空，却不知道做什么', 'hero'),
        block('减少犹豫，选一件现在能做的事。', 'subtitle'),
        block('2026.11.01  ·  公开资料桌面调研  ·  中文场景优先 / 全球产品参照', 'small'),
    ])],
    [card('研究结论', '需求真实；付费市场尚未证实。',
          block('建议继续做小规模验证：用现有产品测试“更快开始”，再决定商业投入。'),
          block('证据：商店用户自述＋直接竞品供给。缺口：中国发生率、可比 MAU、留存与真实付费。', 'small'), tone='dark')],
    [card('01 / DEMAND', '用户为什么需要它？',
          block('有一段空档，也有想做的事，却卡在选择或第一步。'),
          block('Spin The Wheel 用户自述：不知道做什么时交给转盘，随后执行。[S02]'),
          block('先服务：反复犹豫、并且想改变的人。\n5–30 分钟仅为试验场景；允许休息。', 'small'),
          block('需求存在 ≠ 大众普遍 ≠ 愿意付费', 'emphasis')),
     card('02 / SCALE REFERENCES', '三个规模参照，非市场前三',
          block('50M+   Decision Roulette', 'metric'),
          block('10M+   Spin The Wheel', 'metric'),
          block('1M+     Tiny Decisions / 小决定', 'metric'),
          block('同一口径：Google Play 累计下载档位。[S01–03]\n按三个样本排序；不代表 MAU、目标人群或全市场排名。', 'small'))],
    [card('03 / CLOSEST COMPETITORS', '核心想法已经有人在做',
          block('dunno：免费；1,000+ 活动；按时间、精力和情境，一次给一件。[S04]'),
          block('Spontask：从自己的清单抽下一项；官网列 $1/年去广告、$2/年含同步。[S05]'),
          block('两者用户量未披露；Spontask 价格未做结账验证。', 'small'),
          block('单项推荐、免注册、隐私，都不是独有卖点。', 'emphasis')),
     card('04 / NOW WHAT TODAY', '在已有基础上重定方向',
          block('已有：个人活动、时间与条件推荐、下一小步、换一件、计时恢复、本地记录。'),
          block('已有：中文 / 英语 / 日语；网页、Windows、Android。依据本地说明，未重测运行。', 'small'),
          block('待验证：零录入开始＋个人项目续做。\n让记录帮助下次开始，少做一次重新规划。'),
          block('示例：第 42 页，先读一页。', 'emphasis'))],
    [card('05 / DIFFERENTIATION HYPOTHESIS', '不是“别人做不了”，而是验证我们能否做得更顺。',
          block('从我想做的事里，选出现在能做的一件，告诉我第一步，下次还能接着做。'),
          block('相比转盘：少手工过滤。相比泛活动库：更贴近个人项目。相比复杂待办：少管理负担。', 'small'),
          block('以上是组合价值假设；没有证据表明这些能力不可复制。', 'small'), tone='green')],
    [card('06 / WILLINGNESS TO PAY', '卖结果，先验证复用',
          block('可能付费点：续做上下文、跨设备接续、优质中文第一步内容。'),
          block('免费工具很多；“帮我随机选”本身很难支撑高价格。'),
          block('先验证复用，再测试 ¥19 / ¥39 可选买断。仅为价格实验，尚无付费证据。', 'small')),
     card('07 / OPEN SOURCE', '先借鉴，不急于选框架',
          block('Bored-API · MIT\n活动字段与随机推荐；托管接口未验证。'),
          block('Super Productivity · MIT\n离线、计时、恢复与同步参照。'),
          block('Habitica · 代码 GPLv3\n素材另有许可；不能当作 MIT 商用素材。', 'small'))],
    [card('08 / RULES AFTER RESEARCH', '三条约束，贯穿后续阶段',
          block('开发：核心离线可用；先过滤再推荐；保护数据和恢复。'),
          block('产品：一个可行动建议；可拒绝、可休息；复用先于付费。'),
          block('设计：一个主动作；条件按需展开；不靠广告和负罪感催促。'))],
    [card('NEXT / VALIDATION', '先证明“更快开始”，再进入产品原型。',
          block('本人 7 天空档日记 → 8–12 人访谈与对比 → 看真实启动时间、跳过与一周主动复用。'),
          block('探索决策线：多数人启动更快、组内中位时间约降 30%、至少半数主动复用。均为拟定阈值，尚未测试。', 'small'), tone='dark')],
    [dict(tone='plain', padding=0, blocks=[
        block('来源与边界', 'label'),
        block('S01 Tiny Decisions / S02 Spin The Wheel / S03 Decision Roulette：Google Play。S04 dunno：加拿大 App Store。', 'source'),
        block('S05 Spontask 官网；S07 Goblin Tools；S08 Bored-API；S09 Super Productivity；S12 Habitica 仓库与许可。', 'source'),
        block('完整链接、中文竞品、比较依据与实验方案见同目录 REPORT.md / SOURCES.md。未访谈，未安装实测，未验证收入。', 'source'),
        block('流程：市场调研 → 原型 → 产品文档 → UI/UX → 技术研究 → 技术文档 → 开发 → 部署', 'source'),
    ])],
]

STYLES = {
    'eyebrow': (17, 26, True), 'hero': (60, 84, True),
    'subtitle': (28, 43, False), 'label': (17, 27, True),
    'title': (32, 48, True), 'body': (23, 36, False),
    'small': (19, 30, False), 'emphasis': (22, 34, True),
    'metric': (27, 40, True), 'source': (17, 27, False),
}
fonts = {k: ImageFont.truetype(str(BOLD if v[2] else FONT), v[0]) for k, v in STYLES.items()}


def wrap(text, font, limit):
    lines = []
    for paragraph in text.split('\n'):
        current = ''
        for char in paragraph:
            if current and font.getlength(current + char) > limit:
                lines.append(current.rstrip())
                current = char.lstrip()
            else:
                current += char
        lines.append(current)
    return lines


placed = []
y = PAD
for row in rows:
    width = (WIDTH - 2 * PAD - GAP * (len(row) - 1)) / len(row)
    height = 0
    for i, c in enumerate(row):
        c.update(x=PAD + i * (width + GAP), y=y, width=width)
        padding = c.get('padding', 30)
        c['padding'] = padding
        content_y = padding
        for b in c['blocks']:
            size, line_h, bold = STYLES[b['kind']]
            b.update(size=size, lineHeight=line_h, bold=bold,
                     lines=wrap(b['text'], fonts[b['kind']], width - 2 * padding))
            b['x'], b['y'] = padding, content_y
            b['width'] = width - 2 * padding
            b['height'] = len(b['lines']) * line_h
            content_y += b['height'] + 13
        height = max(height, content_y - 13 + padding)
    for c in row:
        c['height'] = height
        placed.append(c)
    y += height + GAP
HEIGHT = int(y - GAP + PAD)

palette = {
    'white': (WHITE, INK, MUTED, GREEN),
    'plain': (BG, INK, MUTED, GREEN),
    'dark': (INK, '#FFFFFF', '#D1DED5', '#B7D4A1'),
    'green': ('#DFE9D8', INK, '#475B4D', GREEN),
}
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label="Now What 市场调研报告图">',
       f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{BG}"/>']
im = Image.new('RGB', (WIDTH, HEIGHT), BG)
draw = ImageDraw.Draw(im)
for c in placed:
    background, ink, muted, accent = palette[c['tone']]
    x, cy, w, h = c['x'], c['y'], c['width'], c['height']
    if c['tone'] != 'plain':
        svg.append(f'<rect x="{x}" y="{cy}" width="{w}" height="{h}" rx="18" fill="{background}"/>')
        draw.rounded_rectangle((x, cy, x+w, cy+h), 18, fill=background)
    for b in c['blocks']:
        color = accent if b['kind'] in ('eyebrow', 'label', 'emphasis', 'metric') else muted if b['kind'] in ('small', 'source') else ink
        b['color'] = color
        for li, line in enumerate(b['lines']):
            tx, ty = x + b['x'], cy + b['y'] + li * b['lineHeight']
            svg.append(f'<text x="{tx}" y="{ty+b["size"]}" font-family="Microsoft YaHei, Noto Sans SC, sans-serif" font-size="{b["size"]}" font-weight="{700 if b["bold"] else 400}" fill="{color}">{html.escape(line)}</text>')
            draw.text((tx, ty + 2), line, font=fonts[b['kind']], fill=color)
svg.append('</svg>')
(ROOT / 'market-report.svg').write_text('\n'.join(svg), encoding='utf-8')
im.save(ROOT / 'market-report.png')
data = dict(width=WIDTH, height=HEIGHT, padding=PAD, gap=GAP, background=BG, cards=placed)
(ROOT / 'report-layout.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

plugin = '''// Local research artifact importer; creates native editable text and auto-layout frames.
// No network calls, product-code edits, or library imports.
const data = __DATA__;
const rgb = hex => ({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255});
const paint = hex => [{type:'SOLID',color:rgb(hex)}];
async function main(){
 const available = await figma.listAvailableFontsAsync();
 const families = ['Microsoft YaHei','Noto Sans SC','PingFang SC','Source Han Sans SC'];
 let regular, bold;
 for(const family of families){
   const matches=available.filter(f=>f.fontName.family===family);
   const normal=matches.find(f=>/^(Regular|Normal)$/.test(f.fontName.style));
   if(normal){regular=normal.fontName;bold=(matches.find(f=>/^(Bold|Semibold|Semi Bold|Medium)$/.test(f.fontName.style))||normal).fontName;break;}
 }
 if(!regular) throw new Error('Install Microsoft YaHei or Noto Sans SC before importing.');
 await Promise.all([figma.loadFontAsync(regular),figma.loadFontAsync(bold)]);
 const existing = figma.currentPage.children;
 const maxX=existing.reduce((m,n)=>Math.max(m,n.x+n.width),0);
 const root=figma.createFrame();root.name='Now What · Market research · 2026-11-01';
 root.resize(data.width,data.height);root.x=maxX+160;root.y=0;root.fills=paint(data.background);root.clipsContent=false;
 const rows=new Map();for(const c of data.cards){if(!rows.has(c.y))rows.set(c.y,[]);rows.get(c.y).push(c);}
 root.layoutMode='VERTICAL';root.primaryAxisSizingMode='FIXED';root.counterAxisSizingMode='FIXED';
 root.paddingTop=root.paddingBottom=root.paddingLeft=root.paddingRight=data.padding;root.itemSpacing=data.gap;
 const createdNodeIds=[root.id];let overflow=[];
 for(const rowData of rows.values()){
   const row=figma.createFrame();createdNodeIds.push(row.id);row.name='Research row';root.appendChild(row);
   row.layoutMode='HORIZONTAL';row.resize(data.width-2*data.padding,rowData[0].height);row.primaryAxisSizingMode='FIXED';row.counterAxisSizingMode='FIXED';row.itemSpacing=data.gap;row.fills=[];row.clipsContent=false;
   for(const c of rowData){
     const panel=figma.createFrame();createdNodeIds.push(panel.id);panel.name=c.blocks.find(b=>b.kind==='title')?.text||'Report header / sources';row.appendChild(panel);
     panel.layoutMode='VERTICAL';panel.resize(c.width,c.height);panel.primaryAxisSizingMode='FIXED';panel.counterAxisSizingMode='FIXED';panel.itemSpacing=13;
     panel.paddingTop=panel.paddingBottom=panel.paddingLeft=panel.paddingRight=c.padding;panel.cornerRadius=c.tone==='plain'?0:18;panel.clipsContent=false;
     const backgrounds={white:'#FFFFFF',plain:data.background,dark:'#202D28',green:'#DFE9D8'};panel.fills=paint(backgrounds[c.tone]);
     for(const b of c.blocks){
       const t=figma.createText();createdNodeIds.push(t.id);t.fontName=b.bold?bold:regular;t.fontSize=b.size;t.lineHeight={unit:'PIXELS',value:b.lineHeight};t.fills=paint(b.color);t.characters=b.lines.join('\\n');t.name=b.kind+' / '+b.text.slice(0,28);
       panel.appendChild(t);t.textAutoResize='HEIGHT';t.resize(b.width,Math.max(b.lineHeight,b.height));t.layoutSizingHorizontal='FIXED';
       if(t.height>b.height+2)overflow.push(t.id);
     }
   }
 }
 figma.currentPage.selection=[root];figma.viewport.scrollAndZoomIntoView([root]);
 figma.closePlugin(JSON.stringify({frameId:root.id,createdNodeIds,font:regular.family,overflow,warning:overflow.length?'Inspect text reflow.':''}));
}
main().catch(e=>figma.closePlugin('Import failed: '+e.message));
'''.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
plugin_dir = ROOT / 'figma-import'
plugin_dir.mkdir(exist_ok=True)
(plugin_dir / 'code.js').write_text(plugin, encoding='utf-8')
(plugin_dir / 'manifest.json').write_text(json.dumps({
    'name': 'Now What Research Report', 'id': 'now-what-research-local-import',
    'api': '1.0.0', 'main': 'code.js', 'editorType': ['figma'],
    'networkAccess': {'allowedDomains': ['none']},
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'width':WIDTH,'height':HEIGHT,'cards':len(placed),'textBlocks':sum(len(c['blocks']) for c in placed),'png':'market-report.png','svg':'market-report.svg'}, ensure_ascii=False))
