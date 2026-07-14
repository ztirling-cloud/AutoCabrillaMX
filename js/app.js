const ayudasProyecto={
  estado:{
    titulo:"Estado",
    texto:"Seleccione el estado donde se construirá el proyecto. Este dato ayuda a identificar las condiciones generales de viento del lugar.",
    ejemplo:"Ejemplo:\nEstado: Colima"
  },
  municipio:{
    titulo:"Municipio",
    texto:"Seleccione el municipio donde estará la estructura. El sistema utiliza esta ubicación para asignar los datos de viento disponibles.",
    ejemplo:"Ejemplo:\nMunicipio: Tecomán"
  },
  luz:{
    titulo:"Luz de la cabrilla",
    texto:"Es la distancia libre entre el apoyo izquierdo y el apoyo derecho. No debe incluir volados.",
    ejemplo:"Apoyo A ●────────────● Apoyo B\n             6.00 m"
  },
  separacion:{
    titulo:"Separación entre cabrillas",
    texto:"Es la distancia entre una cabrilla y la siguiente. Define el área de techo que soportará cada cabrilla.",
    ejemplo:"Cabrilla 1 ───────────\n              3.00 m\nCabrilla 2 ───────────"
  },
  paneles:{
    titulo:"Número de paneles",
    texto:"Divide la cabrilla en secciones iguales para realizar el análisis estructural. Debe ser un número par para conservar la simetría tipo Pratt.",
    ejemplo:"●──●──●──●──●──●──●\nCada división es un panel."
  },
  carga:{
    titulo:"¿Qué es la carga de diseño?",
    texto:"Ingrese el peso total del techo por metro cuadrado (kg/m²). Considere las láminas, las correas y cualquier otro elemento fijo que irá sobre la cubierta.",
    ejemplo:"Nota: La carga de viento se calcula automáticamente según la ubicación del proyecto."
  },
  modoPeralte:{
    titulo:"Modo de peralte",
    texto:"En automático, el programa busca una altura conveniente. En manual, el cliente define directamente la altura de la cabrilla.",
    ejemplo:"Automático: el programa propone.\nManual: el cliente escribe la altura."
  },
  peralte:{
    titulo:"Peralte manual",
    texto:"Es la altura total exterior de la cabrilla, medida desde la cara exterior del cordón inferior hasta la cara exterior del cordón superior. El programa descuenta automáticamente el tamaño de los cordones para calcular la distancia entre sus ejes.",
    ejemplo:"      ▲\n      │ 0.80 m\n──────┴──────"
  },
  calibre:{
    titulo:"Calibre mínimo permitido",
    texto:"Define el espesor mínimo de los perfiles PTR que el programa podrá seleccionar durante la optimización.",
    ejemplo:"Ejemplo:\nCal. 14 = perfil más grueso que Cal. 16."
  }
};

function mostrarAyudaProyecto(clave,boton){
  const ayuda=ayudasProyecto[clave];
  if(!ayuda) return;
  document.getElementById("helpTitle").textContent=ayuda.titulo;
  document.getElementById("helpText").textContent=ayuda.texto;
  document.getElementById("helpExample").textContent=ayuda.ejemplo;
  document.querySelectorAll(".info-btn").forEach(b=>b.classList.remove("active"));
  if(boton) boton.classList.add("active");
}

document.querySelectorAll(".info-btn").forEach(boton=>{
  boton.addEventListener("click",()=>mostrarAyudaProyecto(boton.dataset.help,boton));
});

const municipios={
  "Colima":["Armería","Colima","Comala","Coquimatlán","Cuauhtémoc","Ixtlahuacán","Manzanillo","Minatitlán","Tecomán","Villa de Álvarez"],
  "Jalisco":["Guadalajara","Zapopan","Tlaquepaque","Tonalá","Puerto Vallarta","Autlán de Navarro","Cihuatlán"],
  "Michoacán":["Morelia","Lázaro Cárdenas","Uruapan","Zamora","Apatzingán"],
  "Nayarit":["Tepic","Bahía de Banderas","Compostela"],
  "Guanajuato":["León","Guanajuato","Irapuato","Celaya","Salamanca"],
  "Puebla":["Puebla","Tehuacán","Atlixco","San Martín Texmelucan"],
  "Querétaro":["Querétaro","San Juan del Río","El Marqués","Corregidora"],
  "Veracruz":["Veracruz","Xalapa","Coatzacoalcos","Poza Rica","Córdoba","Orizaba"],
  "Otro":["Otro municipio"]
};

const vientosMunicipio={
  "Armería":125,"Colima":80,"Comala":80,"Coquimatlán":80,"Cuauhtémoc":80,"Ixtlahuacán":95,"Manzanillo":145,"Minatitlán":95,"Tecomán":135,"Villa de Álvarez":80,
  "Guadalajara":55,"Zapopan":55,"Tlaquepaque":55,"Tonalá":55,"Puerto Vallarta":145,"Autlán de Navarro":70,"Cihuatlán":130,
  "Morelia":50,"Lázaro Cárdenas":135,"Uruapan":60,"Zamora":50,"Apatzingán":55,
  "Tepic":80,"Bahía de Banderas":145,"Compostela":125,
  "León":50,"Guanajuato":50,"Irapuato":50,"Celaya":50,"Salamanca":50,
  "Puebla":50,"Tehuacán":50,"Atlixco":50,"San Martín Texmelucan":50,
  "Querétaro":50,"San Juan del Río":50,"El Marqués":50,"Corregidora":50,
  "Veracruz":145,"Xalapa":75,"Coatzacoalcos":125,"Poza Rica":115,"Córdoba":70,"Orizaba":70,
  "Otro municipio":60
};

function cargarEstados(){
  const e=document.getElementById("estado");
  e.innerHTML=Object.keys(municipios).map(x=>`<option ${x==="Colima"?"selected":""}>${x}</option>`).join("");
  actualizarMunicipios();
}
function actualizarMunicipios(){
  const estado=document.getElementById("estado").value;
  const m=document.getElementById("municipio");
  m.innerHTML=municipios[estado].map(x=>`<option ${x==="Tecomán"?"selected":""}>${x}</option>`).join("");
  if(typeof actualizarVistaCliente==="function") actualizarVistaCliente();
}
cargarEstados();

const E=200000,FY=270,OMEGA=1.67,MAX_SL=200,G=9.80665;
const perfiles=[
  {id:"15-16",nombre:'PTR 1½" × 1½" Cal. 16',B:38.1,t:1.52,peso:1.78,cal:16},
  {id:"15-14",nombre:'PTR 1½" × 1½" Cal. 14',B:38.1,t:1.90,peso:2.20,cal:14},
  {id:"15-11",nombre:'PTR 1½" × 1½" Cal. 11',B:38.1,t:3.05,peso:3.45,cal:11},
  {id:"20-16",nombre:'PTR 2" × 2" Cal. 16',B:50.8,t:1.52,peso:2.35,cal:16},
  {id:"20-14",nombre:'PTR 2" × 2" Cal. 14',B:50.8,t:1.90,peso:2.91,cal:14},
  {id:"20-11",nombre:'PTR 2" × 2" Cal. 11',B:50.8,t:3.05,peso:4.58,cal:11},
  {id:"30-16",nombre:'PTR 3" × 3" Cal. 16',B:76.2,t:1.52,peso:3.82,cal:16},
  {id:"30-14",nombre:'PTR 3" × 3" Cal. 14',B:76.2,t:1.90,peso:4.46,cal:14},
  {id:"30-11",nombre:'PTR 3" × 3" Cal. 11',B:76.2,t:3.05,peso:7.06,cal:11}
].map(p=>{
  const area=p.peso/7850*1e6;
  const bi=p.B-2*p.t;
  const I=(p.B**4-bi**4)/12;
  const r=Math.sqrt(I/area);
  return {...p,area,I,r};
});


function calcularVientoPreliminar(velocidadKmh){
  // q = 0.613 V² en N/m² con V en m/s.
  // Conversión aproximada a kgf/m² y coeficiente neto preliminar Cp = 1.30.
  // Este valor sirve para comparación preliminar; no sustituye el procedimiento completo CFE.
  const velocidadMs=velocidadKmh/3.6;
  const presionDinamicaN=0.613*velocidadMs*velocidadMs;
  const presionDinamicaKg=presionDinamicaN/G;
  const coeficienteNeto=1.30;
  return {
    velocidadKmh,
    presionBase:presionDinamicaKg,
    coeficienteNeto,
    presionDiseno:presionDinamicaKg*coeficienteNeto
  };
}

function num(id){const v=parseFloat(document.getElementById(id).value);return Number.isFinite(v)?v:0}
function fmt(x,d=2){return Number(x).toFixed(d)}
function zeros(n){return Array.from({length:n},()=>Array(n).fill(0))}

function solveGauss(A,b){
  const n=b.length,M=A.map((r,i)=>[...r,b[i]]);
  for(let k=0;k<n;k++){
    let p=k;
    for(let i=k+1;i<n;i++) if(Math.abs(M[i][k])>Math.abs(M[p][k])) p=i;
    [M[k],M[p]]=[M[p],M[k]];
    if(Math.abs(M[k][k])<1e-10) throw Error("Matriz singular");
    for(let i=k+1;i<n;i++){
      const q=M[i][k]/M[k][k];
      for(let j=k;j<=n;j++) M[i][j]-=q*M[k][j];
    }
  }
  const x=Array(n).fill(0);
  for(let i=n-1;i>=0;i--){
    let s=M[i][n];
    for(let j=i+1;j<n;j++) s-=M[i][j]*x[j];
    x[i]=s/M[i][i];
  }
  return x;
}

function crearGeo(L,hEjes,np,areas,hTotal=hEjes){
  // hTotal: peralte exterior de fabricación.
  // hEjes: distancia entre los ejes de los cordones usada en el análisis.
  const a=L/np,nodos=[],barras=[];
  for(let i=0;i<=np;i++){
    nodos.push({x:i*a,y:0,id:`BI-${i+1}`});
    nodos.push({x:i*a,y:hEjes,id:`BS-${i+1}`});
  }
  const bi=i=>2*i,bs=i=>2*i+1;
  for(let i=0;i<np;i++){
    barras.push({i:bi(i),j:bi(i+1),g:"Cordón inferior",A:areas["Cordón inferior"]});
    barras.push({i:bs(i),j:bs(i+1),g:"Cordón superior",A:areas["Cordón superior"]});
  }
  for(let i=0;i<=np;i++) barras.push({i:bi(i),j:bs(i),g:"Montantes",A:areas["Montantes"]});
  for(let i=0;i<np;i++){
    if(i<np/2) barras.push({i:bs(i),j:bi(i+1),g:"Diagonales",A:areas["Diagonales"]});
    else barras.push({i:bi(i),j:bs(i+1),g:"Diagonales",A:areas["Diagonales"]});
  }
  return {L,h:hEjes,hEjes,hTotal,np,a,nodos,barras};
}

function analizar(geo,profiles,carga,separacion,presionViento=0){
  const nd=geo.nodos.length*2,K=zeros(nd);
  const FGrav=Array(nd).fill(0),FLevant=Array(nd).fill(0);

  geo.barras.forEach(m=>{
    const n1=geo.nodos[m.i],n2=geo.nodos[m.j];
    const dx=n2.x-n1.x,dy=n2.y-n1.y,Lm=Math.hypot(dx,dy),c=dx/Lm,s=dy/Lm,k=E*m.A/Lm;
    const ke=[[c*c,c*s,-c*c,-c*s],[c*s,s*s,-c*s,-s*s],[-c*c,-c*s,c*c,c*s],[-c*s,-s*s,c*s,s*s]];
    const d=[2*m.i,2*m.i+1,2*m.j,2*m.j+1];
    for(let a=0;a<4;a++) for(let b=0;b<4;b++) K[d[a]][d[b]]+=k*ke[a][b];
  });

  const peso=geo.barras.reduce((sum,m)=>{
    const a=geo.nodos[m.i],b=geo.nodos[m.j],Lm=Math.hypot(b.x-a.x,b.y-a.y);
    return sum+Lm*profiles[m.g].peso;
  },0);

  const masaExterna=carga*separacion*geo.L;
  const masaTotal=masaExterna+peso;

  const fuerzaGravedadTotal=masaTotal*G;
  const fuerzaVientoTotal=presionViento*separacion*geo.L*G;

  // Caso 1: carga vertical descendente total.
  const panelGrav=fuerzaGravedadTotal/geo.np;

  // Caso 2 preliminar de levantamiento:
  // viento ascendente menos 60 % de la carga gravitacional.
  const panelLevant=(fuerzaVientoTotal-0.60*fuerzaGravedadTotal)/geo.np;

  for(let i=0;i<=geo.np;i++){
    const factor=(i===0||i===geo.np)?0.5:1;
    const dofY=2*(2*i+1)+1;
    FGrav[dofY]-=panelGrav*factor;
    FLevant[dofY]+=panelLevant*factor;
  }

  const fixed=[0,1,2*(2*geo.np)+1];
  const free=[...Array(nd).keys()].filter(i=>!fixed.includes(i));
  const Kr=free.map(i=>free.map(j=>K[i][j]));

  function resolverCaso(F){
    const Fr=free.map(i=>F[i]);
    const ur=solveGauss(Kr,Fr);
    const U=Array(nd).fill(0);
    free.forEach((d,i)=>U[d]=ur[i]);

    const fuerzas=geo.barras.map(m=>{
      const a=geo.nodos[m.i],b=geo.nodos[m.j];
      const dx=b.x-a.x,dy=b.y-a.y,Lm=Math.hypot(dx,dy),c=dx/Lm,s=dy/Lm;
      const du=-c*U[2*m.i]-s*U[2*m.i+1]+c*U[2*m.j]+s*U[2*m.j+1];
      return E*m.A/Lm*du;
    });

    let maxDef=0;
    geo.nodos.forEach((n,i)=>{
      maxDef=Math.max(maxDef,Math.hypot(U[2*i],U[2*i+1]));
    });
    return {U,fuerzas,maxDef};
  }

  const gravedad=resolverCaso(FGrav);
  const levantamiento=resolverCaso(FLevant);

  return {
    peso,
    masaTotal,
    fuerzasGrav:gravedad.fuerzas,
    fuerzasViento:levantamiento.fuerzas,
    maxDef:Math.max(gravedad.maxDef,levantamiento.maxDef),
    maxDefGrav:gravedad.maxDef,
    maxDefLevant:levantamiento.maxDef
  };
}

function revisarPerfil(p,F,Lm){
  if(F>=0){
    const cap=FY*p.area/OMEGA,u=F/cap;
    return {ok:u<=0.70,u,sl:0};
  }
  const sl=Lm*1000/p.r;
  const Fe=Math.PI*Math.PI*E/(sl*sl);
  const Fcr=(FY/Fe<=2.25)?(0.658**(FY/Fe))*FY:0.877*Fe;
  const cap=Fcr*p.area/OMEGA;
  const u=Math.abs(F)/cap;
  return {ok:sl<=MAX_SL&&u<=0.70,u,sl};
}

function evaluar(L,h,np,carga,separacion,lista,presionViento,nivelOpcion=0){
  const soluciones=[];

  // Material 1: ambos cordones.
  // Material 2: montantes y diagonales.
  for(const perfilCordon of lista){
    for(const perfilInterior of lista){
      // Los elementos interiores no pueden ser mayores ni más gruesos que los cordones.
      if(perfilInterior.B>perfilCordon.B) continue;
      if(perfilInterior.B===perfilCordon.B && perfilInterior.t>perfilCordon.t) continue;

      const sel={
        "Cordón superior":perfilCordon,
        "Cordón inferior":perfilCordon,
        "Montantes":perfilInterior,
        "Diagonales":perfilInterior
      };

      const areas={};
      Object.keys(sel).forEach(g=>areas[g]=sel[g].area);

      // El dato h es el peralte exterior total. Como ambos cordones tienen
      // el mismo tamaño, la distancia entre ejes es h menos una altura B.
      const hEjes=h-perfilCordon.B/1000;
      if(hEjes<=0.05) continue;
      const geo=crearGeo(L,hEjes,np,areas,h);
      let res;
      try{
        res=analizar(geo,sel,carga,separacion,presionViento);
      }catch(e){
        continue;
      }

      const checks={};
      let cumple=true;
      let maxu=0;

      for(const g of Object.keys(sel)){
        const p=sel[g];
        let peor=0;

        for(let k=0;k<geo.barras.length;k++){
          const m=geo.barras[k];
          if(m.g!==g) continue;

          const a=geo.nodos[m.i],b=geo.nodos[m.j];
          const Lm=Math.hypot(b.x-a.x,b.y-a.y);
          const r1=revisarPerfil(p,res.fuerzasGrav[k],Lm);
          const r2=revisarPerfil(p,res.fuerzasViento[k],Lm);

          if(!r1.ok||!r2.ok){
            cumple=false;
            break;
          }
          peor=Math.max(peor,r1.u,r2.u);
        }

        if(!cumple) break;
        checks[g]={u:peor};
        maxu=Math.max(maxu,peor);
      }

      const limiteDef=L/240;
      if(!cumple||res.maxDef>limiteDef) continue;

      const cantidadMateriales=perfilCordon.id===perfilInterior.id?1:2;

      // Puntuación práctica: primero peso, después utilización y deflexión.
      // La búsqueda ya compara explícitamente todos los tamaños y espesores.
      const score=
        res.peso +
        maxu*8 +
        (res.maxDef/limiteDef)*4 +
        (cantidadMateriales-1)*0.25;

      soluciones.push({
        geo,res,sel,checks,maxu,score,cantidadMateriales
      });
    }
  }

  if(!soluciones.length) return null;

  soluciones.sort((a,b)=>
    a.score-b.score ||
    a.res.peso-b.res.peso ||
    a.maxu-b.maxu
  );

  return soluciones[Math.min(nivelOpcion,soluciones.length-1)];
}

function buscarCapacidad(sol,L,S,lista,cargaActual,presionViento){
  let bajo=cargaActual,alto=Math.max(cargaActual*2,100);

  for(let i=0;i<16;i++){
    const prueba=evaluar(L,sol.geo.h,sol.geo.np,alto,S,lista,presionViento);
    if(!prueba) break;
    bajo=alto;
    alto*=1.5;
    if(alto>5000) break;
  }

  for(let i=0;i<32;i++){
    const medio=(bajo+alto)/2;
    const prueba=evaluar(L,sol.geo.h,sol.geo.np,medio,S,lista,presionViento);
    if(prueba) bajo=medio;
    else alto=medio;
  }
  return bajo;
}


let opcionesCalculadas=[];
let opcionSeleccionada=0;
let contextoUltimoCalculo=null;

function firmaMateriales(s){
  return Object.keys(s.sel).map(g=>`${g}:${s.sel[g].id}`).join("|")+`|h:${s.geo.hTotal.toFixed(2)}`;
}

function svgCabrilla(g){
  const W=440,H=125,m=20;
  const sx=x=>m+x*(W-2*m)/g.L;
  const sy=y=>H-25-y*(H-48)/g.h;
  const lineas=g.barras.map(b=>{
    const a=g.nodos[b.i],d=g.nodos[b.j];
    const ancho=b.g.includes("Cordón")?4:2;
    const color=b.g.includes("Cordón")?"#166534":"#475569";
    return `<line x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(d.x)}" y2="${sy(d.y)}" stroke="${color}" stroke-width="${ancho}" />`;
  }).join("");
  const nodos=g.nodos.map(n=>`<circle cx="${sx(n.x)}" cy="${sy(n.y)}" r="2.5" fill="#172033"/>`).join("");
  return `<svg class="option-drawing" viewBox="0 0 ${W} ${H}" aria-label="Cabrilla completa">${lineas}${nodos}</svg>`;
}

function etiquetaOpcion(i){
  const modo=document.getElementById("modoPeralte").value;
  if(modo==="manual"){
    return ["Menor peso","Mejor equilibrio","Mayor rigidez"][i]||`Alternativa ${i+1}`;
  }
  return ["Peralte menor","Peralte intermedio","Peralte mayor"][i]||`Alternativa ${i+1}`;
}

function renderizarOpciones(){
  const cont=document.getElementById("opcionesCabrilla");
  cont.innerHTML=opcionesCalculadas.map((o,i)=>{
    const s=o.sol;
    const mats=Object.keys(s.sel).map(g=>`<div><strong>${g}:</strong> ${s.sel[g].nombre}</div>`).join("");
    return `<article class="option-card ${i===opcionSeleccionada?"selected":""}">
      <span class="option-badge">${etiquetaOpcion(i)}</span>
      <h3>Opción ${i+1}</h3>
      ${svgCabrilla(s.geo)}
      <div class="option-stats">
        <div class="option-stat"><span>Peso total</span><strong>${fmt(s.res.peso,1)} kg</strong></div>
        <div class="option-stat"><span>Utilización</span><strong>${fmt(s.maxu*100,1)} %</strong></div>
        <div class="option-stat"><span>Deflexión</span><strong>${fmt(s.res.maxDef*1000,2)} mm</strong></div>
        <div class="option-stat"><span>Peralte total</span><strong>${fmt(s.geo.hTotal,2)} m</strong></div>
        <div class="option-stat"><span>Entre ejes</span><strong>${fmt(s.geo.hEjes,3)} m</strong></div>
        <div class="option-stat"><span>Índice de eficiencia</span><strong>${fmt((1/(s.res.peso*Math.max(s.maxu,0.05)))*1000,2)}</strong></div>
      </div>
      <div class="option-materials"><div><strong>Criterio:</strong> combinación eficiente por elemento</div><div><strong>Regla:</strong> máximo 2 materiales; montantes y diagonales ≤ cordones</div>${mats}</div>
      <button type="button" class="choose-btn" onclick="seleccionarCabrilla(${i})">${i===opcionSeleccionada?"CABRILLA SELECCIONADA":"USAR ESTA CABRILLA"}</button>
    </article>`;
  }).join("");
}

function seleccionarCabrilla(indice){
  if(!opcionesCalculadas[indice]||!contextoUltimoCalculo) return;
  opcionSeleccionada=indice;
  renderizarOpciones();
  const o=opcionesCalculadas[indice];
  mostrar(o.sol,contextoUltimoCalculo.total,o.cargaMax,contextoUltimoCalculo.presionViento);
  document.getElementById("mensaje").innerHTML=
    `<strong>Alternativa seleccionada:</strong> Opción ${indice+1} — ${etiquetaOpcion(indice)}. `+
    `La geometría, la mezcla de perfiles y el PDF corresponden a esta cabrilla completa. La selección combina materiales por elemento para mejorar eficiencia, respetando que montantes y diagonales nunca sean mayores que los cordones.`;
}

function calcular(){
  const L=num("luz"),S=num("separacion"),Q=num("carga");
  const np=parseInt(document.getElementById("paneles").value);
  const minCal=parseInt(document.getElementById("calibre").value);
  const lista=perfiles.filter(p=>p.cal<=minCal).sort((a,b)=>a.peso-b.peso);
  const municipioSel=document.getElementById("municipio").value;
  const modoPeralte=document.getElementById("modoPeralte").value;
  const hManual=num("peralteManual");
  
  const velocidadViento=vientosMunicipio[municipioSel]||60;
  const viento=calcularVientoPreliminar(velocidadViento);
  const presionViento=viento.presionDiseno;

  if(L<3||L>15||S<=0||Q<0||isNaN(np)||np<4){
    alert("Revisa los datos. La luz debe estar entre 3 y 15 m.");
    return;
  }
  if(np%2!==0){
    alert("Por simetría estructural Pratt, el número de paneles debe ser par.");
    return;
  }

  document.getElementById("progress").style.display="block";
  document.getElementById("barra").style.width="20%";
  document.getElementById("textoProgreso").textContent="Procesando ecuaciones matriciales...";

  setTimeout(()=>{
    let candidatas=[],total=0;
    const niveles=[0,1,2];
    const alturas=[];

    if(modoPeralte==="manual"){
      // El peralte escrito por el cliente se mantiene fijo
      // en las tres alternativas. Solo cambian los materiales.
      alturas.push(Math.round(hManual*100)/100);
    }else{
      // En automático se estudia todo el rango recomendado.
      for(let h=L/15;h<=L/6+1e-9;h+=0.05){
        alturas.push(Math.round(h*100)/100);
      }
    }

    for(const h of alturas){
      for(const nivel of niveles){
        total++;
        try{
          const s=evaluar(L,h,np,Q,S,lista,presionViento,nivel);
          if(s) candidatas.push(s);
        }catch(e){}
      }
    }

    const unicas=[];
    const firmas=new Set();
    candidatas
      .sort((a,b)=>a.res.peso-b.res.peso || a.res.maxDef-b.res.maxDef)
      .forEach(s=>{
        const f=firmaMateriales(s);
        if(!firmas.has(f)){firmas.add(f);unicas.push(s);}
      });

    if(!unicas.length){
      mostrarFallo(total);
      return;
    }

    let elegidas=[];

    if(modoPeralte==="manual"){
      // Todas las opciones conservan el mismo peralte.
      // Se eligen combinaciones distintas de materiales.
      const ordenadas=[...unicas].sort((a,b)=>
        a.res.peso-b.res.peso ||
        a.res.maxDef-b.res.maxDef ||
        a.maxu-b.maxu
      );

      for(const s of ordenadas){
        if(elegidas.length>=3) break;
        if(!elegidas.some(x=>firmaMateriales(x)===firmaMateriales(s))){
          elegidas.push(s);
        }
      }
    }else{
      // En automático se muestran tres peraltes diferentes.
      const porPeralte=new Map();
      unicas.forEach(s=>{
        const clave=s.geo.hTotal.toFixed(2);
        const actual=porPeralte.get(clave);
        if(!actual || s.res.peso<actual.res.peso) porPeralte.set(clave,s);
      });

      const grupos=[...porPeralte.values()].sort((a,b)=>a.geo.hTotal-b.geo.hTotal);

      if(grupos.length>=3){
        const baja=grupos[0];
        const media=grupos[Math.floor((grupos.length-1)/2)];
        const alta=grupos[grupos.length-1];
        elegidas=[baja,media,alta];
      }else{
        elegidas=[...grupos];
        for(const s of unicas){
          if(elegidas.length>=3) break;
          if(!elegidas.some(x=>firmaMateriales(x)===firmaMateriales(s))){
            elegidas.push(s);
          }
        }
      }
    }

    elegidas=elegidas.slice(0,3);

    opcionesCalculadas=elegidas.map(sol=>({
      sol,
      cargaMax:buscarCapacidad(sol,L,S,lista,Q,presionViento)
    }));
    opcionSeleccionada=0;
    contextoUltimoCalculo={total,presionViento,viento};
    renderizarOpciones();
    seleccionarCabrilla(0);

    document.getElementById("barra").style.width="100%";
    document.getElementById("textoProgreso").textContent=
      `${opcionesCalculadas.length} cabrillas completas calculadas. Seleccione una opción.`;
  },100);
}

function mostrar(s,total,cargaMax,presionViento){
  document.querySelectorAll(".results").forEach(x=>x.style.display="block");
  const L=num("luz"),S=num("separacion"),Q=num("carga");

  document.getElementById("rEstado").textContent="OPTIMIZADA";
  document.getElementById("rEstado").className="value ok";
  document.getElementById("rPeralte").textContent=fmt(s.geo.h)+" m";
  document.getElementById("rPaneles").textContent=s.geo.np;
  document.getElementById("rPanel").textContent=fmt(s.geo.a)+" m";
  document.getElementById("rPeso").textContent=fmt(s.res.peso,1)+" kg";
  document.getElementById("rMasa").textContent=fmt(s.res.masaTotal,1)+" kg";
  document.getElementById("rUtil").textContent=fmt(s.maxu*100,1)+" %";
  document.getElementById("rDef").textContent=fmt(s.res.maxDef*1000,2)+" mm";
  document.getElementById("rAlt").textContent=total;
  document.getElementById("rCargaMax").textContent=fmt(cargaMax,1)+" kg/m²";
  document.getElementById("rReserva").textContent=fmt(cargaMax-Q,1)+" kg/m²";
  document.getElementById("rCargaTotalMax").textContent=fmt(cargaMax*S*L,1)+" kg";

  document.getElementById("tablaMat").innerHTML=Object.keys(s.sel).map(g=>
    `<tr><td>${g}</td><td>${s.sel[g].nombre}</td><td>${fmt(s.checks[g].u*100,1)}%</td></tr>`
  ).join("");

  document.getElementById("tablaDatos").innerHTML=`
    <tr><td>Luz / Separación</td><td>${L} m / ${S} m</td></tr>
    <tr><td>Ubicación del proyecto</td><td>${document.getElementById("estado").value}, ${document.getElementById("municipio").value}</td></tr>
    <tr><td>Velocidad básica almacenada</td><td>${fmt(vientosMunicipio[document.getElementById("municipio").value]||60,1)} km/h</td></tr>
    <tr><td>Presión preliminar de viento</td><td>${fmt(presionViento,1)} kg/m²</td></tr>
    <tr><td>Referencia técnica</td><td>IMCA 6a Ed. (2022) y referencia de viento CFE 2020. Evaluación preliminar; requiere memoria de cálculo profesional.</td></tr>
  `;

  document.getElementById("mensaje").innerHTML=`<strong>Resultado preliminar:</strong> El peralte indicado se considera exterior total y la geometría se analiza con la distancia real entre ejes de los cordones. La alternativa cumple las verificaciones implementadas de esfuerzo axial, pandeo global y deflexión. Aún deben revisarse pandeo local, soldaduras, conexiones, apoyos, estabilidad fuera del plano y el procedimiento completo de viento antes de fabricar.`;
  dibujar(s.geo);
}

function mostrarFallo(total){
  document.querySelectorAll(".results").forEach(x=>x.style.display="none");
  document.getElementById("resumen").style.display="block";
  document.getElementById("rEstado").textContent="DISEÑO NO APROBADO";
  document.getElementById("rEstado").className="value bad";

  const L=num("luz"),S=num("separacion"),Q=num("carga");
  const h=document.getElementById("modoPeralte").value==="manual"?num("peralteManual"):L/15;
  const limiteDef=(L/240)*1000;
  const causas=[];
  if(h<L/15) causas.push(`El peralte de ${fmt(h,2)} m es menor que la referencia L/15 (${fmt(L/15,2)} m).`);
  if(S>3.50) causas.push(`Las cabrillas están muy separadas: ${fmt(S,2)} m. Esto incrementa el área tributaria y la carga sobre cada cabrilla.`);
  else if(S>2.50) causas.push(`La separación de ${fmt(S,2)} m requiere revisar cuidadosamente los elementos secundarios de la cubierta.`);
  if(Q>150) causas.push(`La carga de ${fmt(Q,1)} kg/m² es elevada para los perfiles disponibles.`);
  causas.push(`Una o más combinaciones excedieron resistencia, pandeo o el límite de deflexión aproximado de ${fmt(limiteDef,1)} mm.`);
  causas.push(`No se encontró una cabrilla completa válida entre ${total} combinaciones.`);

  document.getElementById("mensaje").innerHTML=
    `<strong>¿Por qué falló?</strong><ul>${causas.map(c=>`<li>${c}</li>`).join("")}</ul>`+
    `<strong>Recomendaciones:</strong><ul><li>Aumentar el peralte.</li>`+
    `<li>Reducir la separación entre cabrillas.</li><li>Disminuir la carga de diseño.</li>`+
    `<li>Agregar PTR de mayor tamaño exterior a la base de perfiles.</li><li>Revisar conexiones, soldaduras y estabilidad fuera del plano.</li></ul>`;
}

function dibujar(g){
  const c=document.getElementById("vista"),ctx=c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);

  const estado=document.getElementById("estado").value;
  const municipio=document.getElementById("municipio").value;
  const luz=num("luz");
  const separacion=num("separacion");
  const paneles=parseInt(document.getElementById("paneles").value)||0;
  const carga=num("carga");
  const modo=document.getElementById("modoPeralte").value;
  const peralteManual=num("peralteManual");
  const calibre=document.getElementById("calibre").value;
  const peralteMostrado=modo==="manual"?peralteManual:(g.hTotal||g.h);

  const izq=75,der=45,sup=125,inf=90;
  const ancho=c.width-izq-der;
  const alto=c.height-sup-inf;
  const sx=x=>izq+x*ancho/g.L;
  const sy=y=>c.height-inf-y*alto/g.h;

  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,c.width,c.height);

  ctx.fillStyle="#172033";
  ctx.font="bold 18px Arial";
  ctx.textAlign="left";
  ctx.fillText("Geometría de la cabrilla · Datos del cliente",20,28);

  ctx.font="13px Arial";
  ctx.fillStyle="#475569";
  ctx.fillText(`Ubicación: ${estado}, ${municipio}`,20,52);
  ctx.fillText(`Luz: ${luz} m   |   Separación: ${separacion} m   |   Paneles: ${paneles}`,20,73);
  ctx.fillText(`Carga de diseño: ${carga} kg/m²   |   Peralte total: ${peralteMostrado.toFixed(2)} m   |   Calibre mínimo: Cal. ${calibre}`,20,94);

  ctx.strokeStyle="#e2e8f0";
  ctx.lineWidth=1;
  ctx.beginPath();
  for(let i=0;i<=g.np;i++){
    ctx.moveTo(sx(i*g.a),sy(0)+10);
    ctx.lineTo(sx(i*g.a),sy(g.h)-10);
  }
  ctx.stroke();

  g.barras.forEach(b=>{
    const n1=g.nodos[b.i],n2=g.nodos[b.j];
    ctx.lineWidth=b.g.includes("Cordón")?5:3;
    ctx.strokeStyle=b.g.includes("Cordón")?"#14532d":"#475569";
    ctx.beginPath();
    ctx.moveTo(sx(n1.x),sy(n1.y));
    ctx.lineTo(sx(n2.x),sy(n2.y));
    ctx.stroke();
  });

  g.nodos.forEach((n,i)=>{
    ctx.fillStyle="#1e293b";
    ctx.beginPath();
    ctx.arc(sx(n.x),sy(n.y),4,0,2*Math.PI);
    ctx.fill();
  });

  // Cota horizontal de luz
  const yCota=c.height-48;
  ctx.strokeStyle="#166534";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(sx(0),yCota);
  ctx.lineTo(sx(g.L),yCota);
  ctx.moveTo(sx(0),yCota-7);ctx.lineTo(sx(0),yCota+7);
  ctx.moveTo(sx(g.L),yCota-7);ctx.lineTo(sx(g.L),yCota+7);
  ctx.stroke();
  ctx.fillStyle="#166534";
  ctx.font="bold 13px Arial";
  ctx.textAlign="center";
  ctx.fillText(`Luz total = ${luz.toFixed(2)} m`,(sx(0)+sx(g.L))/2,yCota-8);

  // Cota vertical de peralte
  const xCota=42;
  ctx.beginPath();
  ctx.moveTo(xCota,sy(0));
  ctx.lineTo(xCota,sy(g.h));
  ctx.moveTo(xCota-7,sy(0));ctx.lineTo(xCota+7,sy(0));
  ctx.moveTo(xCota-7,sy(g.h));ctx.lineTo(xCota+7,sy(g.h));
  ctx.stroke();
  ctx.save();
  ctx.translate(25,(sy(0)+sy(g.h))/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(`Peralte = ${peralteMostrado.toFixed(2)} m`,0,0);
  ctx.restore();

  // Longitud de panel
  if(g.np>0){
    ctx.fillStyle="#475569";
    ctx.font="12px Arial";
    ctx.textAlign="center";
    ctx.fillText(`Panel = ${(luz/paneles).toFixed(2)} m`,(sx(0)+sx(g.a))/2,sy(0)+25);
  }

  // Etiquetas de apoyos
  ctx.fillStyle="#991b1b";
  ctx.font="bold 12px Arial";
  ctx.textAlign="center";
  ctx.fillText("Apoyo A",sx(0),sy(0)+48);
  ctx.fillText("Apoyo B",sx(g.L),sy(0)+48);
}



function revisarSeparacionCabrillas(){
  const S=num("separacion");
  const L=num("luz");
  const Q=num("carga");
  const alerta=document.getElementById("alertaSeparacion");
  if(!alerta) return;

  // Criterio preliminar para advertencia al usuario.
  // No sustituye la revisión de la cubierta ni de los elementos secundarios.
  const cargaLineal=Q*S;

  if(S<=2.50){
    alerta.className="spacing-alert ok";
    alerta.innerHTML=`<strong>Separación adecuada:</strong> ${fmt(S,2)} m. La distancia se encuentra en un rango moderado para el análisis preliminar.`;
  }else if(S<=3.50){
    alerta.className="spacing-alert warn";
    alerta.innerHTML=
      `<strong>Atención con la separación:</strong> ${fmt(S,2)} m. `+
      `Cada cabrilla recibirá aproximadamente ${fmt(cargaLineal,1)} kg por metro lineal antes de considerar otros efectos. `+
      `Revise que los elementos de la cubierta entre cabrillas sean suficientes.`;
  }else{
    alerta.className="spacing-alert bad";
    alerta.innerHTML=
      `<strong>Cabrillas muy separadas:</strong> ${fmt(S,2)} m. `+
      `La distancia aumenta considerablemente el área de techo y la carga que recibe cada cabrilla. `+
      `Considere reducir la separación, aumentar la capacidad de la cabrilla o verificar cuidadosamente los elementos secundarios de la cubierta.`;
  }
}

function actualizarVistaCliente(){
  const L=Math.max(num("luz"),3);
  let np=parseInt(document.getElementById("paneles").value)||6;
  if(np<4) np=4;
  if(np%2!==0) np+=1;

  const modo=document.getElementById("modoPeralte").value;
  let h=modo==="manual"?num("peralteManual"):L/10;
  if(h<=0) h=L/10;

  const areas={
    "Cordón superior":100,
    "Cordón inferior":100,
    "Montantes":100,
    "Diagonales":100
  };

  try{
    const hEjes=Math.max(h-0.0508,0.05); // Vista previa con cordón PTR de 2 pulgadas.
    const geo=crearGeo(L,hEjes,np,areas,h);
    dibujar(geo);
  }catch(e){}
}

["estado","municipio","luz","separacion","paneles","carga","modoPeralte","peralteManual","calibre"].forEach(id=>{
  const el=document.getElementById(id);
  if(el){
    el.addEventListener("input",actualizarVistaCliente);
    el.addEventListener("change",actualizarVistaCliente);
    el.addEventListener("input",revisarSeparacionCabrillas);
    el.addEventListener("change",revisarSeparacionCabrillas);
  }
});

setTimeout(()=>{actualizarVistaCliente();revisarSeparacionCabrillas();},0);

function imprimirPDF(){window.print()}


function guardarProyectoLocal(){
  const ids=["estado","municipio","luz","separacion","paneles","carga","modoPeralte","peralteManual","calibre"];
  const datos={};
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el) datos[id]=el.value;
  });
  localStorage.setItem("autocabrillaMX_proyecto",JSON.stringify(datos));
  alert("Proyecto guardado en este navegador.");
}

function cargarProyectoLocal(){
  try{
    const datos=JSON.parse(localStorage.getItem("autocabrillaMX_proyecto")||"null");
    if(!datos) return;
    if(datos.estado){
      document.getElementById("estado").value=datos.estado;
      actualizarMunicipios();
    }
    Object.entries(datos).forEach(([id,valor])=>{
      const el=document.getElementById(id);
      if(el && id!=="estado") el.value=valor;
    });
    if(datos.municipio) document.getElementById("municipio").value=datos.municipio;
    actualizarVistaCliente();
    revisarSeparacionCabrillas();
  }catch(e){}
}

function mostrarAcercaDe(){
  alert(
    "AutoCabrilla MX v0.9 Beta\\n\\n"+
    "Diseño inteligente de cabrillas metálicas Pratt.\\n\\n"+
    "Desarrollado por Grupo García Ingeniería y Construcción\\n"+
    "Ing. José Alejandro García Venegas\\n"+
    "Tecomán, Colima, México\\n\\n"+
    "Herramienta preliminar: la validación final corresponde a un profesional responsable."
  );
}

document.addEventListener("DOMContentLoaded",()=>{
  try{
    cargarProyectoLocal();
  }catch(error){
    console.warn("No se pudieron restaurar los datos guardados:",error);
  }
  try{
    actualizarVistaCliente();
    revisarSeparacionCabrillas();
  }catch(error){
    console.warn("No se pudo actualizar la vista inicial:",error);
  }
});


function cerrarIntro(){
  const intro=document.getElementById("introLogo");
  if(!intro) return;
  intro.classList.add("oculto");
  setTimeout(()=>intro.remove(),450);
}

document.addEventListener("DOMContentLoaded",()=>{
  // Cierre automático; el botón permite entrar antes.
  setTimeout(cerrarIntro,2200);
});
