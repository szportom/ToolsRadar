async function buildNetwork(){
  const res = await fetch('data/tools.json');
  const data = await res.json();

  const nodes = [];
  const edges = [];
  let idCounter = 1;
  const palette = ["#00d1ff","#7b61ff","#3be77b","#ff7ab6","#ffd24b"];
  let paletteIndex = 0;

  for(const [category, subs] of Object.entries(data)){
    const catId = `cat-${idCounter++}`;
    nodes.push({id:catId,label:category,title:category,group:'category',shape:'circle',size:34,color:{background:palette[paletteIndex%palette.length],border:'#ffffff'}});
    paletteIndex++;

    for(const [subname, tools] of Object.entries(subs)){
      const subId = `sub-${idCounter++}`;
      nodes.push({id:subId,label:subname,title:subname,group:'subcategory',shape:'dot',size:22,color:{background:'#111827',border:palette[(paletteIndex)%palette.length]}});
      edges.push({from:catId,to:subId});

      for(const tool of tools){
        const toolId = `tool-${idCounter++}`;
        nodes.push({id:toolId,label:tool.name,title:tool.name + '\n' + (tool.url||''),group:'tool',shape:'ellipse',size:18,color:{background:'#061018',border:'#2b8cff'}});
        edges.push({from:subId,to:toolId});
        nodes[nodes.length-1].url = tool.url || null;
      }
    }
  }

  const container = document.getElementById('network');
  const visData = {nodes:new vis.DataSet(nodes), edges:new vis.DataSet(edges)};
  const options = {
    physics:{
      stabilization:false,
      barnesHut:{gravitationalConstant:-20000,centralGravity:0.3,springLength:150,springConstant:0.04,avoidOverlap:0.5}
    },
    interaction:{hover:true,tooltipDelay:200,multiselect:false},
    nodes:{font:{color:'#e6eef3'},borderWidth:2},
    edges:{color:'rgba(255,255,255,0.06)',smooth:{type:'continuous'}}
  };

  const network = new vis.Network(container, visData, options);

  network.on('doubleClick', params => {
    if(params.nodes && params.nodes.length){
      const nodeId = params.nodes[0];
      const node = visData.nodes.get(nodeId);
      if(node && node.url){
        window.open(node.url, '_blank');
      }
    }
  });

  network.on('hoverNode', params => {
    const node = visData.nodes.get(params.node);
    const info = document.getElementById('info');
    info.textContent = node.title + (node.url ? ' — kliknij dwukrotnie, by otworzyć link' : '');
  });
  network.on('blurNode', ()=>{document.getElementById('info').textContent = 'Kliknij w węzeł, aby otworzyć link. Przytrzymaj i przeciągnij, aby przesunąć.'});
}

buildNetwork().catch(err=>{
  console.error(err);
  const el = document.getElementById('info');
  if(el) el.textContent = 'Błąd ładowania danych — sprawdź plik data/tools.json';
});