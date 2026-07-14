
"use strict";

const PTR_POSTES = [
  {name:'PTR 1½" × 1½" cal. 14',b:38.1,t:1.90},
  {name:'PTR 2" × 2" cal. 14',b:50.8,t:1.90},
  {name:'PTR 2" × 2" cal. 11',b:50.8,t:3.04},
  {name:'PTR 2½" × 2½" cal. 14',b:63.5,t:1.90},
  {name:'PTR 2½" × 2½" cal. 11',b:63.5,t:3.04},
  {name:'PTR 3" × 3" cal. 14',b:76.2,t:1.90},
  {name:'PTR 3" × 3" cal. 11',b:76.2,t:3.04},
  {name:'PTR 4" × 4" cal. 14',b:101.6,t:1.90},
  {name:'PTR 4" × 4" cal. 11',b:101.6,t:3.04},
  {name:'PTR 4" × 4" × 1/4"',b:101.6,t:6.35}
];

function propiedadesPTR(p){
  const bi=p.b-2*p.t;
  if(bi<=0) return null;
  const A=p.b*p.b-bi*bi;                         // mm²
  const I=(Math.pow(p.b,4)-Math.pow(bi,4))/12;  // mm⁴
  const r=Math.sqrt(I/A);                        // mm
  return {A,I,r,peso:A*0.00785};                 // kg/m
}

function resistenciaCompresionPTR(p,Lm,K,Fy){
  const E=200000, prop=propiedadesPTR(p);
  const KLr=(K*Lm*1000)/prop.r;
  const Fe=Math.PI*Math.PI*E/(KLr*KLr);
  const limite=4.71*Math.sqrt(E/Fy);
  const Fcr=KLr<=limite ? Math.pow(0.658,Fy/Fe)*Fy : 0.877*Fe;
  const phiPn=0.90*Fcr*prop.A/9.80665; // kgf
  return {...prop,KLr,Fe,Fcr,capacidadKg:phiPn};
}

function solucionSeleccionada(){
  if(typeof opcionesCalculadas==="undefined" || !opcionesCalculadas.length) return null;
  return opcionesCalculadas[opcionSeleccionada]?.sol || null;
}

function recomendarPTR(cargaKg,Lm,K,Fy){
  const candidatos=PTR_POSTES.map(p=>({p,r:resistenciaCompresionPTR(p,Lm,K,Fy)}));
  const elegido=candidatos.find(x=>x.r.KLr<=200 && x.r.capacidadKg>=cargaKg);
  return {elegido,candidatos};
}

function ponerResultado(idNombre,idDetalle,res,cargaKg){
  const n=document.getElementById(idNombre),d=document.getElementById(idDetalle);
  if(!res.elegido){
    n.textContent="No se encontró un PTR";
    n.className="value bad";
    d.textContent="Aumente la sección, reduzca la altura libre o agregue arriostramiento.";
    return;
  }
  const {p,r}=res.elegido,util=cargaKg/r.capacidadKg;
  n.textContent=p.name;
  n.className="value ok";
  d.textContent=`Capacidad axial preliminar: ${r.capacidadKg.toFixed(0)} kg · KL/r: ${r.KLr.toFixed(1)} · utilización: ${(util*100).toFixed(1)} % · peso teórico: ${r.peso.toFixed(2)} kg/m`;
}

window.calcularPostes=function(){
  const sol=solucionSeleccionada();
  if(!sol){
    alert("Primero presione CALCULAR CABRILLA y seleccione una alternativa.");
    return;
  }
  const L=Number(sol.geo?.L || document.getElementById("luz").value);
  const masaTotal=Number(sol.res?.masaTotal || 0);
  const altura=Number(document.getElementById("alturaPoste").value);
  const K=Number(document.getElementById("factorK").value);
  const Fy=Number(document.getElementById("fyPoste").value);
  if(!(masaTotal>0 && L>0 && altura>0)){
    alert("Revise la carga calculada, la luz y la altura del poste.");
    return;
  }

  // Para carga distribuida uniforme y geometría/apoyos simétricos:
  const W=masaTotal;
  const RA=W/2, RB=W/2;
  document.getElementById("apCargaTotal").textContent=`${W.toFixed(1)} kg`;
  document.getElementById("apRA").textContent=`${RA.toFixed(1)} kg`;
  document.getElementById("apRB").textContent=`${RB.toFixed(1)} kg`;

  document.getElementById("operacionesApoyos").innerHTML=`
    <strong>1. Carga distribuida uniforme sobre una cabrilla</strong>
    <span class="formula">W = ${W.toFixed(2)} kg</span>
    <strong>2. Equilibrio de momentos respecto al apoyo A</strong>
    <span class="formula">ΣM<sub>A</sub> = 0 → R<sub>B</sub>(${L.toFixed(2)}) − W(${(L/2).toFixed(2)}) = 0</span>
    <span class="formula">R<sub>B</sub> = [${W.toFixed(2)} × ${(L/2).toFixed(2)}] / ${L.toFixed(2)} = ${RB.toFixed(2)} kg</span>
    <strong>3. Equilibrio vertical</strong>
    <span class="formula">ΣF<sub>y</sub> = 0 → R<sub>A</sub> + R<sub>B</sub> − W = 0</span>
    <span class="formula">R<sub>A</sub> = ${W.toFixed(2)} − ${RB.toFixed(2)} = ${RA.toFixed(2)} kg</span>
    <span class="result-line">Comprobación: ${RA.toFixed(2)} + ${RB.toFixed(2)} = ${W.toFixed(2)} kg ✔</span>
    <strong>4. Revisión preliminar del poste</strong>
    <span class="formula">L<sub>e</sub> = K·L = ${K.toFixed(2)} × ${altura.toFixed(2)} = ${(K*altura).toFixed(2)} m</span>
    <span class="formula">Se prueba cada PTR por área, radio de giro, esbeltez KL/r y resistencia axial de pandeo.</span>
  `;

  ponerResultado("ptrA","ptrADetalle",recomendarPTR(RA,altura,K,Fy),RA);
  ponerResultado("ptrB","ptrBDetalle",recomendarPTR(RB,altura,K,Fy),RB);
};

document.addEventListener("DOMContentLoaded",()=>{
  const originalCalcular=window.calcular;
  if(typeof originalCalcular==="function"){
    window.calcular=function(){
      const r=originalCalcular.apply(this,arguments);
      setTimeout(()=>{ if(solucionSeleccionada()) calcularPostes(); },750);
      return r;
    };
  }
  const originalSeleccionar=window.seleccionarCabrilla;
  if(typeof originalSeleccionar==="function"){
    window.seleccionarCabrilla=function(){
      const r=originalSeleccionar.apply(this,arguments);
      setTimeout(()=>{ if(solucionSeleccionada()) calcularPostes(); },50);
      return r;
    };
  }
});
