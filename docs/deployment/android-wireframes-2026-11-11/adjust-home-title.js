// Draft-only, idempotent title correction; supersedes whole-group raising.
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));figma.skipInvisibleInstanceChildren=false;
const specs=[
 {screen:'516:10157',group:'516:10192',shift:32,originalTop:364,height:222,startY:460,changeY:536},
 {screen:'516:10206',group:'516:10241',shift:20,originalTop:287,height:216,startY:383,changeY:459},
 {screen:'516:10255',group:'516:10290',shift:28,originalTop:346.5,height:257,startY:483.5,changeY:559.5,nextY:442.5}
];
const notes={
 '516:10139':'现在做 · 仅上移任务名称，操作按钮位置不变',
 '516:10203':'仅任务名称上移 32px；开始、换一件、时间与条件保持原位。名称仍预留两行，不新增卡片背景。',
 '516:10252':'小屏仅任务名称上移 20px；开始与换一件保持原位和触控尺寸。',
 '516:10301':'长名称上移 28px；已有起点说明、开始和换一件保持原位。名称完整显示，不改变按钮尺寸。',
 '516:10304':'顶部：时间、当前条件保持原位\n任务名称：单独上移\n开始、换一件：保持原位\n已有起点说明：保持原位',
 '516:10154':'仅任务名称上移，保留两行占位。\n开始、换一件及已有起点说明保持原坐标与尺寸。\n名称与下方内容的留白增加，两个按钮之间仍保持 20px。'
};
for(const id of Object.keys(notes)){const t=figma.getNodeById(id);for(const s of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);}
for(const spec of specs){const g=figma.getNodeById(spec.group);for(const t of g.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))await figma.loadFontAsync(s.fontName);}
const changed=[],created=[],states=[];
for(const spec of specs){
 const s=figma.getNodeById(spec.screen),g=figma.getNodeById(spec.group),area=g.parent,originalTitle=g.children.find(n=>n.name==='Task name');
 const origin=s.absoluteBoundingBox.y;
 area.paddingBottom=0;area.name='Flexible focus area / buttons keep original positions';
 // Keep the original 76px title plus 20px following gap in the flow.
 const titleProps={fontName:originalTitle.fontName,fontSize:originalTitle.fontSize,lineHeight:originalTitle.lineHeight,letterSpacing:originalTitle.letterSpacing,textAlignHorizontal:originalTitle.textAlignHorizontal,textAlignVertical:originalTitle.textAlignVertical,fills:JSON.parse(JSON.stringify(originalTitle.fills)),characters:originalTitle.characters,width:originalTitle.width,height:originalTitle.height};originalTitle.visible=false;g.paddingTop=96;
 let title=area.children.find(n=>n.name==='Task name / raised independently');
 if(!title){title=figma.createText();area.appendChild(title);created.push(title.id);title.name='Task name / raised independently';}
 title.layoutPositioning='ABSOLUTE';title.fontName=titleProps.fontName;title.fontSize=titleProps.fontSize;title.lineHeight=titleProps.lineHeight;title.letterSpacing=titleProps.letterSpacing;title.textAlignHorizontal=titleProps.textAlignHorizontal;title.textAlignVertical=titleProps.textAlignVertical;title.fills=titleProps.fills;title.characters=titleProps.characters;title.textAutoResize='NONE';title.resize(titleProps.width,titleProps.height);title.x=g.x;title.y=g.y-spec.shift;
 const start=g.children.find(n=>n.name==='Start / primary'),change=g.children.find(n=>n.name==='Change / secondary'),next=g.children.find(n=>n.name==='Existing next step');
 const y=n=>n.absoluteBoundingBox.y-origin;
 if(Math.abs(y(start)-spec.startY)>.01||Math.abs(y(change)-spec.changeY)>.01)throw Error('Button moved '+spec.group);
 if(next&&spec.nextY!==undefined&&Math.abs(y(next)-spec.nextY)>.01)throw Error('Next step moved');
 if(g.height!==spec.height||Math.abs(y(g)-spec.originalTop)>.01)throw Error('Group changed');
 const utility=s.findOne(n=>n.name==='Time and conditions / top utility row');
 if(y(utility)!==130||utility.height!==44||y(title)<174)throw Error('Utility overlap');
 changed.push(area.id,g.id,originalTitle.id,title.id);
 states.push({screen:spec.screen,group:spec.group,title:title.id,screenSize:[s.width,s.height],titleMovedUp:spec.shift,titleTop:y(title),groupTop:y(g),groupHeight:g.height,
 start:{originalY:spec.startY,finalY:y(start),originalAbsoluteY:origin+spec.startY,finalAbsoluteY:start.absoluteBoundingBox.y,width:start.width,height:start.height},
 change:{originalY:spec.changeY,finalY:y(change),originalAbsoluteY:origin+spec.changeY,finalAbsoluteY:change.absoluteBoundingBox.y,width:change.width,height:change.height},
 nextStep:next&&next.visible?{originalY:spec.nextY,finalY:y(next),originalAbsoluteY:origin+spec.nextY,finalAbsoluteY:next.absoluteBoundingBox.y}:null,
 utility:{y:y(utility),height:utility.height},titleHeight:title.height,titleBottom:y(title)+title.height});
}
for(const [id,value]of Object.entries(notes)){figma.getNodeById(id).characters=value;changed.push(id);}
return{mutatedNodeIds:changed,createdNodeIds:created,states};
