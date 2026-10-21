const ejemplosArbol = JSON.parse(document.getElementById('datos-arboles').textContent);
const selectorArbol = document.getElementById('ejemplo-arbol');
const svgArbol = document.getElementById('arbol-svg');
let ejemploActual = ejemplosArbol[0], pasoArbol = -1;
const espacioSVG = 'http://www.w3.org/2000/svg';
function elementoSVG(etiqueta, atributos, texto) {
  const elemento = document.createElementNS(espacioSVG, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}
function dibujarArbol() {
  svgArbol.replaceChildren();
  const posiciones = new Map();
  function ubicar(identificador, izquierda, derecha, nivel) {
    const nodo = ejemploActual.nodos[identificador];
    const x = (izquierda + derecha) / 2, y = 50 + nivel * 112;
    posiciones.set(identificador, {x, y});
    const ancho = (derecha - izquierda) / (nodo.hijos.length || 1);
    nodo.hijos.forEach((hijo, indice) => ubicar(hijo, izquierda + indice * ancho, izquierda + (indice + 1) * ancho, nivel + 1));
  }
  ubicar(0, 10, 630, 0);
  const altura = Math.max(...[...posiciones.values()].map(posicion => posicion.y)) + 88;
  svgArbol.setAttribute('viewBox', '0 0 640 ' + altura);
  const resueltos = new Set(ejemploActual.pasos.slice(0, pasoArbol + 1).map(paso => paso.nodo));
  const seleccionado = ejemploActual.pasos[pasoArbol]?.nodo;
  for (const nodo of ejemploActual.nodos) {
    const padre = posiciones.get(nodo.id);
    for (const hijo of nodo.hijos) {
      const posicion = posiciones.get(hijo);
      svgArbol.append(elementoSVG('path', {d:`M ${padre.x} ${padre.y+28} C ${padre.x} ${padre.y+65}, ${posicion.x} ${posicion.y-65}, ${posicion.x} ${posicion.y-28}`,class:'conexion-arbol'}));
    }
  }
  for (const nodo of ejemploActual.nodos) {
    const posicion = posiciones.get(nodo.id);
    const grupo = elementoSVG('g', {class:'nodo-svg' + (resueltos.has(nodo.id) ? ' resuelto' : '') + (seleccionado === nodo.id ? ' actual' : '')});
    grupo.append(elementoSVG('rect',{x:posicion.x-72,y:posicion.y-28,width:144,height:64,rx:8}));
    grupo.append(elementoSVG('text',{x:posicion.x,y:posicion.y-6,'text-anchor':'middle',class:'tipo-nodo'},nodo.titulo));
    grupo.append(elementoSVG('text',{x:posicion.x,y:posicion.y+16,'text-anchor':'middle',class:'valor-nodo'},nodo.texto.length > 19 ? nodo.texto.slice(0,16)+'…' : nodo.texto));
    if (resueltos.has(nodo.id)) grupo.append(elementoSVG('text',{x:posicion.x,y:posicion.y+56,'text-anchor':'middle',class:'resultado-nodo'},'→ ' + nodo.resultado));
    svgArbol.append(grupo);
  }
  document.getElementById('contador-arbol').textContent = 'Paso ' + (pasoArbol + 1) + ' de ' + ejemploActual.pasos.length;
  document.getElementById('titulo-arbol').textContent = ejemploActual.expresion;
  document.getElementById('detalle-arbol').textContent = pasoArbol < 0 ? 'El árbol está preparado. Pulsa Resolver siguiente: se empieza por el primer valor que necesita el nodo raíz.' : ejemploActual.pasos[pasoArbol].detalle;
  document.getElementById('resultado-arbol').textContent = pasoArbol === ejemploActual.pasos.length - 1 ? 'Resultado: ' + ejemploActual.nodos[0].resultado : 'Todavía quedan partes por resolver.';
  document.getElementById('arbol-anterior').disabled = pasoArbol < 0;
  document.getElementById('arbol-siguiente').disabled = pasoArbol === ejemploActual.pasos.length - 1;
}
selectorArbol.onchange = () => { ejemploActual = ejemplosArbol[Number(selectorArbol.value)]; pasoArbol = -1; dibujarArbol(); };
document.getElementById('arbol-anterior').onclick = () => { pasoArbol--; dibujarArbol(); };
document.getElementById('arbol-siguiente').onclick = () => { pasoArbol++; dibujarArbol(); };
document.getElementById('arbol-reiniciar').onclick = () => { pasoArbol = -1; dibujarArbol(); };
dibujarArbol();
