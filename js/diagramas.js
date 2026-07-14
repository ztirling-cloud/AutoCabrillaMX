/* AutoCabrilla MX — actualización de paneles pares y catálogo ampliado
   Cargar DESPUÉS del script principal del programa.
*/
(function () {
  'use strict';

  const ESPESORES = {
    18: 1.21,
    16: 1.52,
    14: 1.90,
    12: 2.66,
    11: 3.05
  };

  function crearPerfil(pulgadas, calibre) {
    const B = pulgadas * 25.4;
    const t = ESPESORES[calibre];
    const bi = B - 2 * t;
    const area = B * B - bi * bi;
    const I = (Math.pow(B, 4) - Math.pow(bi, 4)) / 12;
    const r = Math.sqrt(I / area);
    const peso = area * 7850 / 1e6;
    const etiqueta = Number.isInteger(pulgadas)
      ? String(pulgadas)
      : ({1.25: '1¼', 1.5: '1½', 2.5: '2½'}[pulgadas] || String(pulgadas));

    return {
      id: `ptr-${String(pulgadas).replace('.', '-')}-${calibre}`,
      nombre: `PTR ${etiqueta}\" × ${etiqueta}\" Cal. ${calibre}`,
      B,
      t,
      peso: Number(peso.toFixed(3)),
      cal: calibre,
      area,
      I,
      r
    };
  }

  function ampliarCatalogo() {
    if (typeof perfiles === 'undefined' || !Array.isArray(perfiles)) {
      console.error('No se encontró el catálogo original de perfiles.');
      return;
    }

    const medidas = [1, 1.25, 1.5, 2, 2.5, 3, 4];
    const calibresPorMedida = {
      1: [16, 14, 11],
      1.25: [16, 14, 11],
      1.5: [16, 14, 11],
      2: [16, 14, 11],
      2.5: [16, 14, 11],
      3: [16, 14, 11],
      4: [16, 14, 11]
    };

    const existentes = new Set(perfiles.map(p => `${p.B.toFixed(2)}-${p.cal}`));
    for (const medida of medidas) {
      for (const calibre of calibresPorMedida[medida]) {
        const candidato = crearPerfil(medida, calibre);
        const clave = `${candidato.B.toFixed(2)}-${candidato.cal}`;
        if (!existentes.has(clave)) {
          perfiles.push(candidato);
          existentes.add(clave);
        }
      }
    }

    perfiles.sort((a, b) => a.peso - b.peso || a.B - b.B || b.cal - a.cal);
    console.info(`Catálogo ampliado: ${perfiles.length} perfiles disponibles.`);
  }

  function ampliarSelectorCalibre() {
    const selector = document.getElementById('calibre');
    if (!selector) return;
    const valorActual = selector.value;
    selector.innerHTML = [
      '<option value="16">Cal. 16</option>',
      '<option value="14">Cal. 14</option>',
      '<option value="11">Cal. 11</option>'
    ].join('');
    selector.value = ['16', '14', '11'].includes(valorActual) ? valorActual : '14';
  }

  function mostrarAjustePaneles(original, ajustado, luz) {
    const caja = document.getElementById('alertaSeparacion');
    if (!caja) return;
    const longitud = luz > 0 ? luz / ajustado : 0;
    caja.style.display = 'block';
    caja.innerHTML = `<strong>Paneles ajustados automáticamente:</strong> ` +
      `${original} era impar; se utilizarán ${ajustado} paneles iguales de ` +
      `${longitud.toFixed(3)} m para conservar la simetría Pratt.`;
  }

  function instalarAjusteAutomatico() {
    if (typeof calcular !== 'function') {
      console.error('No se encontró la función calcular() original.');
      return;
    }

    const calcularOriginal = calcular;
    calcular = function () {
      const entrada = document.getElementById('paneles');
      const luzEntrada = document.getElementById('luz');
      if (entrada) {
        const original = parseInt(entrada.value, 10);
        if (Number.isFinite(original) && original >= 4 && original % 2 !== 0) {
          const ajustado = original + 1;
          entrada.value = String(ajustado);
          mostrarAjustePaneles(original, ajustado, parseFloat(luzEntrada?.value || '0'));
        }
      }
      return calcularOriginal.apply(this, arguments);
    };

    const entrada = document.getElementById('paneles');
    if (entrada) {
      entrada.addEventListener('change', function () {
        const original = parseInt(this.value, 10);
        if (Number.isFinite(original) && original >= 4 && original % 2 !== 0) {
          const ajustado = original + 1;
          this.value = String(ajustado);
          mostrarAjustePaneles(original, ajustado, parseFloat(document.getElementById('luz')?.value || '0'));
          if (typeof actualizarVistaCliente === 'function') actualizarVistaCliente();
        }
      });
    }
  }

  function actualizarAyuda() {
    if (typeof ayudasProyecto !== 'undefined' && ayudasProyecto.paneles) {
      ayudasProyecto.paneles.texto = 'El programa utiliza un número par de paneles para mantener la geometría simétrica de la cabrilla Pratt. Si se escribe un número impar, se ajusta automáticamente al siguiente número par.';
      ayudasProyecto.paneles.ejemplo = 'Ejemplo: 15 paneles se ajustan a 16. Para una luz de 6.00 m, cada panel mide 0.375 m.';
    }
    if (typeof ayudasProyecto !== 'undefined' && ayudasProyecto.calibre) {
      ayudasProyecto.calibre.texto = 'Define el calibre más delgado que el programa puede considerar. El catálogo incluye PTR cuadrados desde 1\" hasta 4\" y calibres 18, 16, 14, 12 y 11, según la medida.';
    }
  }

  ampliarCatalogo();
  ampliarSelectorCalibre();
  instalarAjusteAutomatico();
  actualizarAyuda();
})();
