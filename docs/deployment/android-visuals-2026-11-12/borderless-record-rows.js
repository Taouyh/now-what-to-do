await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('49:243'));
const ids=['574:10556','574:10426','574:10427','574:10428','574:10429','574:10472','574:10473','574:10474','574:10475'];
const before=[];
for(const id of ids){const n=await figma.getNodeByIdAsync(id);before.push({id,x:n.x,y:n.y,w:n.width,h:n.height,fills:n.fills,strokes:n.strokes});}
for(const id of ids){const n=await figma.getNodeByIdAsync(id);n.strokes=[];}
const after=[];
for(const b of before){const n=await figma.getNodeByIdAsync(b.id);if(n.strokes.length||n.x!==b.x||n.y!==b.y||n.width!==b.w||n.height!==b.h||JSON.stringify(n.fills)!==JSON.stringify(b.fills))throw new Error('Border/layout check failed');after.push({id:n.id,strokes:n.strokes,x:n.x,y:n.y,w:n.width,h:n.height});}
return{mutatedNodeIds:ids,before,after,scope:'Remove record row outer borders; preserve transparent fill and geometry'};
