await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));figma.skipInvisibleInstanceChildren=false;
const source=await figma.getNodeByIdAsync('497:9796');const name='Android / B+C visual review / 2026-11-12';
if(figma.currentPage.children.some(n=>n.name===name))throw new Error('Visual board already exists; inspect before retrying');
const fonts=new Map();for(const t of source.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fonts.set(JSON.stringify(s.fontName),s.fontName);
for(const f of fonts.values())await figma.loadFontAsync(f);
const x=Math.max(...figma.currentPage.children.map(n=>n.x+n.width))+200;
const target=source.clone();target.name=name;target.x=x;target.y=0;
const mapping={};function pair(a,b){mapping[a.id]=b.id;if('children'in a&&'children'in b)for(let i=0;i<a.children.length;i++)pair(a.children[i],b.children[i]);}pair(source,target);
const masters=target.findAllWithCriteria({types:['COMPONENT']});const draftRefs=[];
for(const i of target.findAllWithCriteria({types:['INSTANCE']})){const m=await i.getMainComponentAsync();if(m&&source.findOne(n=>n.id===m.id))draftRefs.push({id:i.id,main:m.id,replacement:mapping[m.id]});}
return{boardId:target.id,createdNodeIds:[target.id,...target.findAll(()=>true).map(n=>n.id)],mapping,masters:masters.map(m=>({id:m.id,name:m.name})),draftRefs};
