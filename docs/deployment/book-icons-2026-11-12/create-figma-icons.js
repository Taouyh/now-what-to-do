/**
 * bindVariablesToComponent
 *
 * Binds design token variables to the visual properties of a component node.
 * Supports fills, strokes, all padding directions, item spacing, and corner radius.
 * Only binds properties for which a variable ID is provided in `bindings`.
 *
 * This function should be called on each variant individually within a component
 * set, OR on the component set itself for properties shared by all variants.
 *
 * @param {ComponentNode | FrameNode | RectangleNode} component
 *   The Figma node to mutate. Usually a ComponentNode or one of its children.
 * @param {{
 *   fills?: string,
 *   strokes?: string,
 *   paddingTop?: string,
 *   paddingBottom?: string,
 *   paddingLeft?: string,
 *   paddingRight?: string,
 *   itemSpacing?: string,
 *   cornerRadius?: string
 * }} bindings
 *   Each key is a visual property name; each value is a Figma Variable ID
 *   (e.g. "VariableID:123:456"). Omit a key to skip binding that property.
 * @returns {Promise<{ mutatedNodeIds: string[] }>}
 *   List of node IDs that were mutated (for audit/validation purposes).
 */
async function bindVariablesToComponent(component, bindings) {
  const mutatedNodeIds = []

  if (!component) {
    return { mutatedNodeIds }
  }

  // Batch every getVariableByIdAsync call upfront in a single Promise.all rather
  // than awaiting per-property — the lookups are independent and IPC-bound.
  const floatBindings = [
    ['paddingTop', 'paddingTop'],
    ['paddingBottom', 'paddingBottom'],
    ['paddingLeft', 'paddingLeft'],
    ['paddingRight', 'paddingRight'],
    ['itemSpacing', 'itemSpacing'],
    ['cornerRadius', 'cornerRadius'],
  ]

  const requestedIds = []
  if (bindings.fills) requestedIds.push(['fills', bindings.fills])
  if (bindings.strokes) requestedIds.push(['strokes', bindings.strokes])
  for (const [bindingKey] of floatBindings) {
    if (bindings[bindingKey]) requestedIds.push([bindingKey, bindings[bindingKey]])
  }

  const resolved = await Promise.all(
    requestedIds.map(([, id]) => figma.variables.getVariableByIdAsync(id)),
  )
  const varByKey = {}
  for (let i = 0; i < requestedIds.length; i++) {
    varByKey[requestedIds[i][0]] = resolved[i]
  }

  const markMutated = () => {
    if (!mutatedNodeIds.includes(component.id)) {
      mutatedNodeIds.push(component.id)
    }
  }

  // --- Fills ---
  const fillVar = varByKey.fills
  if (fillVar) {
    const existingFills = component.fills
    if (Array.isArray(existingFills) && existingFills.length > 0) {
      // Bind the color of the first fill to the variable
      const boundFill = figma.variables.setBoundVariableForPaint(existingFills[0], 'color', fillVar)
      component.fills = [boundFill, ...existingFills.slice(1)]
    } else {
      // No existing fill — create a solid fill bound to the variable
      const boundFill = figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } },
        'color',
        fillVar,
      )
      component.fills = [boundFill]
    }
    markMutated()
  }

  // --- Strokes ---
  const strokeVar = varByKey.strokes
  if (strokeVar) {
    const existingStrokes = component.strokes
    if (Array.isArray(existingStrokes) && existingStrokes.length > 0) {
      const boundStroke = figma.variables.setBoundVariableForPaint(
        existingStrokes[0],
        'color',
        strokeVar,
      )
      component.strokes = [boundStroke, ...existingStrokes.slice(1)]
    } else {
      const boundStroke = figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } },
        'color',
        strokeVar,
      )
      component.strokes = [boundStroke]
    }
    markMutated()
  }

  // --- Spacing properties (FLOAT variables bound via setBoundVariable) ---
  for (const [bindingKey, figmaProp] of floatBindings) {
    const variable = varByKey[bindingKey]
    if (variable) {
      component.setBoundVariable(figmaProp, variable)
      markMutated()
    }
  }

  return { mutatedNodeIds }
}


await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
if(figma.currentPage.children.some(n=>n.name==='App icon / Book / Review 2026-11-12'))throw new Error('Review already exists; use returned IDs');
await figma.loadFontAsync({family:'Noto Sans SC',style:'Regular'});
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const color=s=>({r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255});
const vars={'#452A1A':'VariableID:6:3','#F0DFB7':'VariableID:6:5','#703C25':'VariableID:6:6','#B18A50':'VariableID:6:7','#F1DCAD':'VariableID:6:8'};
const coll=figma.variables.createVariableCollection('App icon / Book accents');
for(const [name,c] of [['Cover shade','#542D1E'],['Page edges','#D6BD87'],['Page light','#FFF0CF'],['Page highlight','#F8EACC'],['Monochrome','#FFFFFF']]){
 const v=figma.variables.createVariable(name,coll,'COLOR');v.setValueForMode(coll.defaultModeId,{...color(c),a:1});v.scopes=['SHAPE_FILL','FRAME_FILL'];v.setVariableCodeSyntax('WEB','var(--icon-'+name.toLowerCase().replaceAll(' ','-')+')');v.setVariableCodeSyntax('ANDROID','@color/icon_'+name.toLowerCase().replaceAll(' ','_'));vars[c]=v.id;
}
const svgs=["<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"512\" height=\"512\" viewBox=\"0 0 512 512\"><path id=\"Leather-tile\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M112 16 H400 Q496 16 496 112 V400 Q496 496 400 496 H112 Q16 496 16 400 V112 Q16 16 112 16 Z\"/>\n<path id=\"Tile-lower-shade\" fill=\"#542D1E\" fill-rule=\"evenodd\" d=\"M16 336 Q256 406 496 336 V400 Q496 496 400 496 H112 Q16 496 16 400 Z\"/>\n<path id=\"Inset-brass\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M112 38 H400 Q474 38 474 112 V400 Q474 474 400 474 H112 Q38 474 38 400 V112 Q38 38 112 38 Z M112 42 Q42 42 42 112 V400 Q42 470 112 470 H400 Q470 470 470 400 V112 Q470 42 400 42 Z\"/>\n<path id=\"Cover-shadow\" fill=\"#452A1A\" fill-rule=\"evenodd\" d=\"M76 172 Q76 160 90 159 Q182 151 256 179 Q330 151 422 159 Q436 160 436 172 L436 354 Q436 366 424 367 Q330 359 256 385 Q182 359 88 367 Q76 366 76 354 Z\"/>\n<path id=\"Leather-binding\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M76 160 Q76 148 90 147 Q182 139 256 167 Q330 139 422 147 Q436 148 436 160 L436 342 Q436 354 424 355 Q330 347 256 373 Q182 347 88 355 Q76 354 76 342 Z\"/>\n<path id=\"Page-block\" fill=\"#D6BD87\" fill-rule=\"evenodd\" d=\"M86 158 Q174 145 256 177 Q338 145 426 158 L426 342 Q337 331 256 361 Q175 331 86 342 Z\"/>\n<path id=\"Left-page\" fill=\"#F0DFB7\" fill-rule=\"evenodd\" d=\"M88 151 Q176 140 250 172 L250 347 Q175 318 88 331 Z\"/>\n<path id=\"Right-page\" fill=\"#FFF0CF\" fill-rule=\"evenodd\" d=\"M262 172 Q336 140 424 151 L424 331 Q337 318 262 347 Z\"/>\n<path id=\"Left-page-light\" fill=\"#F8EACC\" fill-rule=\"evenodd\" d=\"M88 151 Q176 140 250 172 L250 187 Q175 157 88 168 Z\"/>\n<path id=\"Spine\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M250 172 L256 175 L262 172 L262 347 L256 352 L250 347 Z\"/>\n<path id=\"Bookmark\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M367 147 L391 146 L391 205 L379 196 L367 205 Z\"/>\n<path id=\"First-line\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M119 213 Q164 209 211 222 L211 232 Q164 219 119 223 Z\"/>\n<path id=\"Second-line\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M119 247 Q153 245 185 252 L185 262 Q153 255 119 257 Z\"/>\n<path id=\"Start\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M316 222 L316 285 Q316 289 320 287 L365 257 Q369 254 365 251 L320 220 Q316 218 316 222 Z\"/></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"108\" height=\"108\" viewBox=\"0 0 108 108\"><g transform=\"translate(13.04 13.04) scale(.16)\"><path id=\"Cover-shadow\" fill=\"#452A1A\" fill-rule=\"evenodd\" d=\"M76 172 Q76 160 90 159 Q182 151 256 179 Q330 151 422 159 Q436 160 436 172 L436 354 Q436 366 424 367 Q330 359 256 385 Q182 359 88 367 Q76 366 76 354 Z\"/>\n<path id=\"Leather-binding\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M76 160 Q76 148 90 147 Q182 139 256 167 Q330 139 422 147 Q436 148 436 160 L436 342 Q436 354 424 355 Q330 347 256 373 Q182 347 88 355 Q76 354 76 342 Z\"/>\n<path id=\"Page-block\" fill=\"#D6BD87\" fill-rule=\"evenodd\" d=\"M86 158 Q174 145 256 177 Q338 145 426 158 L426 342 Q337 331 256 361 Q175 331 86 342 Z\"/>\n<path id=\"Left-page\" fill=\"#F0DFB7\" fill-rule=\"evenodd\" d=\"M88 151 Q176 140 250 172 L250 347 Q175 318 88 331 Z\"/>\n<path id=\"Right-page\" fill=\"#FFF0CF\" fill-rule=\"evenodd\" d=\"M262 172 Q336 140 424 151 L424 331 Q337 318 262 347 Z\"/>\n<path id=\"Left-page-light\" fill=\"#F8EACC\" fill-rule=\"evenodd\" d=\"M88 151 Q176 140 250 172 L250 187 Q175 157 88 168 Z\"/>\n<path id=\"Spine\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M250 172 L256 175 L262 172 L262 347 L256 352 L250 347 Z\"/>\n<path id=\"Bookmark\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M367 147 L391 146 L391 205 L379 196 L367 205 Z\"/>\n<path id=\"First-line\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M119 213 Q164 209 211 222 L211 232 Q164 219 119 223 Z\"/>\n<path id=\"Second-line\" fill=\"#B18A50\" fill-rule=\"evenodd\" d=\"M119 247 Q153 245 185 252 L185 262 Q153 255 119 257 Z\"/>\n<path id=\"Start\" fill=\"#703C25\" fill-rule=\"evenodd\" d=\"M316 222 L316 285 Q316 289 320 287 L365 257 Q369 254 365 251 L320 220 Q316 218 316 222 Z\"/></g></svg>","<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"108\" height=\"108\" viewBox=\"0 0 108 108\"><g transform=\"translate(13.04 13.04) scale(.16)\"><path id=\"Left-leaf\" fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M88 151 Q176 140 246 172 L246 347 Q175 318 88 331 Z\"/>\n<path id=\"Right-leaf-with-start-cutout\" fill=\"#FFFFFF\" fill-rule=\"evenodd\" d=\"M266 172 Q336 140 424 151 L424 331 Q337 318 266 347 Z M316 222 L316 285 L365 254 Z\"/></g></svg>"];
const notification=svgs[2].replace('width="108" height="108" viewBox="0 0 108 108"','width="24" height="24" viewBox="0 0 24 24"').replace('translate(13.04 13.04) scale(.16)','translate(-1.824 -1.554) scale(.054)');
const background='<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108"><path fill="#703C25" d="M0 0H108V108H0Z"/></svg>';
const specs=[['Windows',512,svgs[0]],['Android foreground',108,svgs[1]],['Android monochrome',108,svgs[2]],['Notification',24,notification],['Android background',108,background]];
const masters=[];
for(let i=0;i<specs.length;i++){
 const [name,size,source]=specs[i];const c=figma.createComponent();c.name='App icon / Book / '+name;c.resize(size,size);c.fills=[];c.x=52600+i*570;c.y=0;
 c.description='Original open-book identity. Editable vectors from packaging SVG source. '+(name.startsWith('Android')?'108 dp canvas; artwork within centered 66 dp safe circle.':'No lettering; inspect at native output size.');
 const art=figma.createNodeFromSvg(source);c.appendChild(art);art.x=0;art.y=0;art.name='Editable paths';
 for(const n of art.findAllWithCriteria({types:['VECTOR']})){if(Array.isArray(n.fills)&&n.fills[0]?.type==='SOLID'){const id=vars[hex(n.fills[0].color)];if(id)await bindVariablesToComponent(n,{fills:id});}}
 masters.push(c);
}
function textNode(parent,content,size=18){const t=figma.createText();t.fontName={family:'Noto Sans SC',style:'Regular'};t.characters=content;t.fontSize=size;t.fills=[{type:'SOLID',color:color('#452A1A')}];parent.appendChild(t);return t;}
function row(parent,gap=32){const r=figma.createAutoLayout('HORIZONTAL',{itemSpacing:gap});r.fills=[];r.counterAxisAlignItems='MAX';parent.appendChild(r);return r;}
function specimen(parent,c,size,label){const box=figma.createAutoLayout('VERTICAL',{itemSpacing:12});box.fills=[];parent.appendChild(box);const i=c.createInstance();box.appendChild(i);i.rescale(size/c.width);textNode(box,label,16);return box;}
const board=figma.createAutoLayout('VERTICAL',{itemSpacing:36});board.name='App icon / Book / Review 2026-11-12';board.x=52600;board.y=700;board.paddingTop=40;board.paddingBottom=40;board.paddingLeft=40;board.paddingRight=40;board.fills=[{type:'SOLID',color:color('#F0DFB7')}];
textNode(board,'NowWhat · 翻开书页，开始一件事',32);
textNode(board,'Windows / Android 应用图标 · 旧书主题 · 2026-11-12',18);
const top=row(board);specimen(top,masters[0],256,'Windows 主标识');
for(const s of [16,24,32,48,64,128])specimen(top,masters[0],s,s+' px');
const android=row(board,40);
for(const [label,radius] of [['圆形裁切',72],['圆角裁切',34],['圆弧方形裁切',54]]){
 const col=figma.createAutoLayout('VERTICAL',{itemSpacing:12});col.fills=[];android.appendChild(col);
 const mask=figma.createFrame();mask.resize(144,144);mask.cornerRadius=radius;mask.clipsContent=true;mask.fills=[{type:'SOLID',color:color('#703C25')}];col.appendChild(mask);
 const inst=masters[1].createInstance();mask.appendChild(inst);inst.rescale(2);inst.x=-36;inst.y=-36;textNode(col,label,16);
}
const monoBox=specimen(android,masters[2],144,'Android 主题单色');monoBox.fills=[{type:'SOLID',color:color('#452A1A')}];monoBox.children[1].fills=[{type:'SOLID',color:color('#F0DFB7')}];
const notBox=specimen(android,masters[3],24,'24 px 通知轮廓');notBox.fills=[{type:'SOLID',color:color('#452A1A')}];notBox.paddingTop=16;notBox.paddingLeft=16;notBox.paddingRight=16;notBox.paddingBottom=16;notBox.children[1].fills=[{type:'SOLID',color:color('#F0DFB7')}];
textNode(board,'自适应图标：108 × 108 dp 分层画布，主体位于中央 66 dp 安全圆内。',18);
textNode(board,'图标无文字与纸纹噪点；保留书脊、页边厚度和右页开始符号。',18);
const nodes=[...masters,board].flatMap(n=>[n,...n.findAll(()=>true)]);
return {boardId:board.id,masters:masters.map(n=>({id:n.id,name:n.name,w:n.width,h:n.height})),collectionId:coll.id,variables:vars,createdNodeIds:nodes.map(n=>n.id),vectorCount:nodes.filter(n=>n.type==='VECTOR').length,imageNodeCount:nodes.filter(n=>'fills'in n&&Array.isArray(n.fills)&&n.fills.some(p=>p.type==='IMAGE')).length};
