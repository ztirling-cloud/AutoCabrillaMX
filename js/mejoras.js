/* AutoCabrilla MX: diagramas V-M-flecha y barras por fuerza axial.
   Convención visual solicitada: rojo=compresión, azul=tensión. */
(function(){
  const COLOR_COMP="#d32f2f", COLOR_TENS="#1565c0", COLOR_ZERO="#64748b";
  function fuerzaColor(f){
    const tol=1e-3;
    if(!Number.isFinite(f)||Math.abs(f)<tol) return COLOR_ZERO;
    return f<0?COLOR_COMP:COLOR_TENS;
  }
  function fuerzaTexto(f){
    if(!Number.isFinite(f)) return "Fuerza no disponible";
    const tipo=Math.abs(f)<1e-3?"Fuerza casi nula":(f<0?"Compresión":"Tensión");
    return `${tipo}: ${(Math.abs(f)/1000).toFixed(2)} kN`;
  }

  window.svgCabrilla=function(g,fuerzas){
    const W=420,H=135,p=18;
    const sx=x=>p+x*(W-2*p)/g.L;
    const sy=y=>H-p-y*(H-2*p)/Math.max(g.h,0.01);
    const fs=fuerzas||[];
    const lineas=g.barras.map((b,k)=>{
      const a=g.nodos[b.i],d=g.nodos[b.j];
      const ancho=b.g.includes("Cordón")?5:3;
      const f=fs[k];
      const color=fuerzaColor(f);
      const title=`${b.g} · ${fuerzaTexto(f)}`.replace(/&/g,"&amp;").replace(/</g,"&lt;");
      return `<line x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(d.x)}" y2="${sy(d.y)}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round"><title>${title}</title></line>`;
    }).join("");
    const nodos=g.nodos.map(n=>`<circle cx="${sx(n.x)}" cy="${sy(n.y)}" r="2.5" fill="#172033"/>`).join("");
    return `<svg class="option-drawing" viewBox="0 0 ${W} ${H}" aria-label="Cabrilla: rojo compresión, azul tensión">${lineas}${nodos}</svg>`;
  };

  function diagramHTML(i){
    return `<div class="force-legend"><span class="force-key"><i class="force-swatch force-compression"></i>Compresión</span><span class="force-key"><i class="force-swatch force-tension"></i>Tensión</span><span class="force-key"><i class="force-swatch force-zero"></i>Casi nula</span></div>
    <div class="option-diagrams">
      <div class="diagram-box"><h4>Diagrama de cortante V(x)</h4><canvas class="diagram-canvas" id="diagV_${i}" width="600" height="150"></canvas></div>
      <div class="diagram-box"><h4>Diagrama de momento M(x)</h4><canvas class="diagram-canvas" id="diagM_${i}" width="600" height="150"></canvas></div>
      <div class="diagram-box"><h4>Diagrama de flecha δ(x)</h4><canvas class="diagram-canvas" id="diagD_${i}" width="600" height="150"></canvas><div class="diagram-note">Flecha estructural obtenida del análisis matricial; la curva se representa suavizada entre apoyos.</div></div>
    </div>`;
  }

  window.renderizarOpciones=function(){
    const cont=document.getElementById("opcionesCabrilla");
    cont.innerHTML=opcionesCalculadas.map((o,i)=>{
      const s=o.sol;
      const mats=Object.keys(s.sel).map(g=>`<div><strong>${g}:</strong> ${s.sel[g].nombre}</div>`).join("");
      return `<article class="option-card ${i===opcionSeleccionada?"selected":""}">
        <span class="option-badge">${etiquetaOpcion(i)}</span><h3>Opción ${i+1}</h3>
        ${svgCabrilla(s.geo,s.res.fuerzasGrav)}
        ${diagramHTML(i)}
        <div class="option-stats">
          <div class="option-stat"><span>Peso total</span><strong>${fmt(s.res.peso,1)} kg</strong></div>
          <div class="option-stat"><span>Utilización</span><strong>${fmt(s.maxu*100,1)} %</strong></div>
          <div class="option-stat"><span>Deflexión</span><strong>${fmt(s.res.maxDefGrav*1000,2)} mm</strong></div>
          <div class="option-stat"><span>Peralte total</span><strong>${fmt(s.geo.hTotal,2)} m</strong></div>
          <div class="option-stat"><span>Entre ejes</span><strong>${fmt(s.geo.hEjes,3)} m</strong></div>
          <div class="option-stat"><span>Índice de eficiencia</span><strong>${fmt((1/(s.res.peso*Math.max(s.maxu,0.05)))*1000,2)}</strong></div>
        </div>
        <div class="option-materials"><div><strong>Colores:</strong> rojo compresión · azul tensión</div><div><strong>Regla:</strong> máximo 2 materiales; interiores ≤ cordones</div>${mats}</div>
        <button type="button" class="choose-btn" onclick="seleccionarCabrilla(${i})">${i===opcionSeleccionada?"CABRILLA SELECCIONADA":"USAR ESTA CABRILLA"}</button>
      </article>`;
    }).join("");
    requestAnimationFrame(()=>opcionesCalculadas.forEach((o,i)=>dibujarDiagramasOpcion(i,o.sol)));
  };

  function baseCanvas(id,title,unit){
    const c=document.getElementById(id); if(!c) return null;
    const ctx=c.getContext("2d"),W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
    const m={l:46,r:18,t:16,b:28};
    ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m.l,m.t);ctx.lineTo(m.l,H-m.b);ctx.lineTo(W-m.r,H-m.b);ctx.stroke();
    ctx.fillStyle="#475569";ctx.font="11px Arial";ctx.fillText(unit,7,15);ctx.textAlign="right";ctx.fillText("x (m)",W-4,H-7);ctx.textAlign="left";
    return {c,ctx,W,H,m};
  }
  function plot(id,xs,ys,unit,stroke,fill){
    const b=baseCanvas(id,"",unit);if(!b)return;
    const {ctx,W,H,m}=b, xmin=0,xmax=Math.max(...xs,1), maxAbs=Math.max(...ys.map(v=>Math.abs(v)),1e-9);
    const sx=x=>m.l+x/(xmax||1)*(W-m.l-m.r), sy=y=>m.t+(maxAbs-y)/(2*maxAbs)*(H-m.t-m.b);
    const y0=sy(0);ctx.strokeStyle="#94a3b8";ctx.beginPath();ctx.moveTo(m.l,y0);ctx.lineTo(W-m.r,y0);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx(xs[0]),y0);ys.forEach((y,k)=>ctx.lineTo(sx(xs[k]),sy(y)));ctx.lineTo(sx(xs[xs.length-1]),y0);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    ctx.beginPath();ys.forEach((y,k)=>{const X=sx(xs[k]),Y=sy(y);k?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#334155";ctx.font="10px Arial";ctx.textAlign="right";ctx.fillText(maxAbs.toFixed(2),m.l-5,m.t+5);ctx.fillText((-maxAbs).toFixed(2),m.l-5,H-m.b);ctx.textAlign="center";ctx.fillText("0",m.l,H-m.b+14);ctx.fillText(xmax.toFixed(2),W-m.r,H-m.b+14);ctx.textAlign="left";
  }
  window.dibujarDiagramasOpcion=function(i,s){
    const L=s.geo.L, n=Math.max(40,s.geo.np*8), xs=[] ,V=[],M=[],D=[];
    const w=s.res.masaTotal*G/L/1000; // kN/m, equivalente uniforme del caso gravitacional
    const R=w*L/2, dmax=s.res.maxDefGrav*1000;
    for(let k=0;k<=n;k++){
      const x=L*k/n, xi=x/L;xs.push(x);
      V.push(R-w*x);M.push(R*x-w*x*x/2);
      D.push(-dmax*16*xi*xi*(1-xi)*(1-xi));
    }
    plot(`diagV_${i}`,xs,V,"kN","#7c3aed","rgba(124,58,237,.14)");
    plot(`diagM_${i}`,xs,M,"kN·m","#ea580c","rgba(234,88,12,.14)");
    plot(`diagD_${i}`,xs,D,"mm","#0891b2","rgba(8,145,178,.14)");
  };

  const dibujarBase=window.dibujar;
  window.dibujar=function(g){
    const c=document.getElementById("vista"),ctx=c.getContext("2d");
    const actual=(window.opcionesCalculadas&&opcionesCalculadas[opcionSeleccionada])?opcionesCalculadas[opcionSeleccionada].sol:null;
    if(!actual||actual.geo!==g){dibujarBase(g);return;}
    ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);
    const izq=75,der=45,sup=125,inf=90,ancho=c.width-izq-der,alto=c.height-sup-inf;
    const sx=x=>izq+x*ancho/g.L,sy=y=>c.height-inf-y*alto/Math.max(g.h,.01);
    ctx.fillStyle="#172033";ctx.font="bold 18px Arial";ctx.fillText("Geometría y esfuerzos axiales",20,28);
    ctx.font="13px Arial";ctx.fillStyle="#475569";ctx.fillText("Rojo = compresión   |   Azul = tensión   |   Gris = fuerza casi nula",20,52);
    g.barras.forEach((b,k)=>{const a=g.nodos[b.i],d=g.nodos[b.j];ctx.lineWidth=b.g.includes("Cordón")?6:4;ctx.strokeStyle=fuerzaColor(actual.res.fuerzasGrav[k]);ctx.beginPath();ctx.moveTo(sx(a.x),sy(a.y));ctx.lineTo(sx(d.x),sy(d.y));ctx.stroke();});
    g.nodos.forEach(n=>{ctx.fillStyle="#111827";ctx.beginPath();ctx.arc(sx(n.x),sy(n.y),4,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle="#334155";ctx.font="12px Arial";ctx.fillText(`Opción ${opcionSeleccionada+1}: ${etiquetaOpcion(opcionSeleccionada)}`,20,75);
    ctx.fillText(`Flecha gravitacional máxima: ${(actual.res.maxDefGrav*1000).toFixed(2)} mm`,20,96);
  };
})();
