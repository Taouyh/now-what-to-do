// Draft-only, idempotent optical-position correction. Run after whoami/session.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
const section=figma.getNodeById('516:10138');
const pairs=[['516:10157','516:10192',48],['516:10206','516:10241',28],['516:10255','516:10290',48]];
const annotations={
 '516:10139':'现在做 · 主要操作位于视觉中心略偏上',
 '516:10203':'时间与条件留在顶部；任务名称、开始和换一件整体上移 48px，位于视觉中心略偏上。保留组内间距与同色背景。',
 '516:10252':'小屏整体上移 28px，保留触控尺寸与组内间距；留白随可用高度缩减，视觉中心略偏上。',
 '516:10301':'长名称与已有起点整体上移 48px；名称仍预留两行，保留完整说明和按钮间距，不增加卡片背景。',
 '516:10304':'顶部：时间、当前条件\n视觉中心略偏上：任务名称、开始、换一件\n底部：保留适量呼吸空间',
 '516:10154':'主操作组：名称 → 开始 → 换一件。\n名称预留两行高度，保留现有按钮尺寸和 20px 组内间距。\n已有“下次起点”仍在名称下方，整组按视觉中心略偏上定位。'
};
for(const id of Object.keys(annotations)){const t=figma.getNodeById(id);for(const s of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);}
const bounds=(g,s)=>({x:g.absoluteBoundingBox.x-s.absoluteBoundingBox.x,y:g.absoluteBoundingBox.y-s.absoluteBoundingBox.y,width:g.width,height:g.height});
const snapshot=g=>JSON.stringify({w:g.width,h:g.height,spacing:g.itemSpacing,padding:[g.paddingTop,g.paddingBottom,g.paddingLeft,g.paddingRight],fills:g.fills,strokes:g.strokes,children:g.children.map(n=>({id:n.id,x:n.x,y:n.y,w:n.width,h:n.height,visible:n.visible}))});
const changed=[],states=[];
for(const [sid,gid,shift]of pairs){const s=figma.getNodeById(sid),g=figma.getNodeById(gid),area=g.parent,utility=s.findOne(n=>n.name==='Time and conditions / top utility row');
const before=bounds(g,s),internal=snapshot(g),utilityBefore=bounds(utility,s);
area.paddingBottom=area.paddingTop+shift*2;area.name='Flexible focus area / optical center above midpoint';changed.push(area.id);
const after=bounds(g,s);if(snapshot(g)!==internal)throw Error('Internal layout changed '+gid);
if(JSON.stringify(bounds(utility,s))!==JSON.stringify(utilityBefore))throw Error('Utility moved '+sid);
if(after.y<utilityBefore.y+utilityBefore.height||after.y+after.height>s.height)throw Error('Overflow '+sid);
states.push({screen:sid,group:gid,screenSize:[s.width,s.height],before,after,movedUp:before.y-after.y,offsetAboveAreaCenter:shift,areaPaddingBottom:area.paddingBottom,internalLayoutPreserved:true,utility:utilityBefore});}
for(const [id,value]of Object.entries(annotations)){const t=figma.getNodeById(id);t.characters=value;changed.push(id);}
return{mutatedNodeIds:changed,sectionId:section.id,states};
