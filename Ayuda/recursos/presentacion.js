const diapositivas = [...document.querySelectorAll('.diapositiva')];
let actual = 0, temporizador = null;
const indice = document.getElementById('indice');
const notas = document.getElementById('notas');
function mostrar(numero) {
  actual = Math.max(0, Math.min(numero, diapositivas.length - 1));
  clearInterval(temporizador); temporizador = null;
  document.getElementById('animar-ruta').disabled = false;
  diapositivas.forEach((diapositiva, posicion) => {
    const activa = posicion === actual;
    diapositiva.classList.toggle('activa', activa); diapositiva.hidden = !activa;
    if (activa) diapositiva.scrollTop = 0;
  });
  indice.value = actual;
  document.getElementById('contador').textContent = (actual + 1) + ' / ' + diapositivas.length;
  document.getElementById('avance').style.width = (actual + 1) / diapositivas.length * 100 + '%';
  document.getElementById('anterior').disabled = actual === 0;
  document.getElementById('siguiente').disabled = actual === diapositivas.length - 1;
  document.getElementById('texto-notas').textContent = diapositivas[actual].dataset.nota;
}
document.getElementById('anterior').onclick = () => mostrar(actual - 1);
document.getElementById('siguiente').onclick = () => mostrar(actual + 1);
indice.onchange = () => mostrar(Number(indice.value));
function cerrarNotas() { notas.hidden = true; document.getElementById('notas-boton').setAttribute('aria-expanded', 'false'); }
document.getElementById('notas-boton').onclick = () => {
  notas.hidden = !notas.hidden;
  document.getElementById('notas-boton').setAttribute('aria-expanded', String(!notas.hidden));
};
document.getElementById('cerrar-notas').onclick = cerrarNotas;
document.getElementById('pantalla').onclick = async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { document.getElementById('pantalla').title = 'Este navegador no permite pantalla completa.'; }
};
document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape') { cerrarNotas(); return; }
  if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(document.activeElement.tagName)) return;
  if (evento.key.toLowerCase() === 'n') { document.getElementById('notas-boton').click(); return; }
  if (evento.key.toLowerCase() === 'f') { document.getElementById('pantalla').click(); return; }
  if (evento.key.toLowerCase() === 'm') { indice.focus(); return; }
  if (!notas.hidden) return;
  if (['ArrowRight', 'PageDown', ' '].includes(evento.key)) { evento.preventDefault(); mostrar(actual + 1); }
  if (['ArrowLeft', 'PageUp'].includes(evento.key)) { evento.preventDefault(); mostrar(actual - 1); }
  if (evento.key === 'Home') mostrar(0);
  if (evento.key === 'End') mostrar(diapositivas.length - 1);
});
let inicioToque = null;
document.getElementById('diapositivas').addEventListener('touchstart', evento => {
  if (!evento.target.closest('input, button, a, select') && evento.touches.length === 1) inicioToque = [evento.touches[0].clientX, evento.touches[0].clientY];
}, {passive:true});
document.getElementById('diapositivas').addEventListener('touchend', evento => {
  if (!inicioToque) return;
  const horizontal = evento.changedTouches[0].clientX - inicioToque[0];
  const vertical = evento.changedTouches[0].clientY - inicioToque[1];
  if (Math.abs(horizontal) > 90 && Math.abs(horizontal) > Math.abs(vertical) * 1.5) mostrar(actual + (horizontal < 0 ? 1 : -1));
  inicioToque = null;
}, {passive:true});
const estaciones = [...document.querySelectorAll('.estacion')];
const detalles = ['main.py abre el archivo y lee su texto.', 'lexico.py reconoce palabras, números y signos.', 'sintactico.py comprueba y prepara las instrucciones.', 'interprete.py calcula, guarda datos y muestra el resultado.'];
document.getElementById('animar-ruta').onclick = () => {
  clearInterval(temporizador);
  let paso = 0;
  const boton = document.getElementById('animar-ruta'); boton.disabled = true;
  function avanzar() {
    estaciones.forEach((estacion, posicion) => estacion.classList.toggle('activa', posicion === paso));
    document.getElementById('detalle-ruta').textContent = detalles[paso];
    paso++;
    if (paso === estaciones.length) { clearInterval(temporizador); temporizador = null; boton.disabled = false; }
  }
  temporizador = setInterval(avanzar, 1200); avanzar();
};
const pasos = [
  {codigo:'Inicio de ejecutar',detalle:'Los booleanos ya están disponibles. Todavía no hay variables del ejemplo.',memoria:[['verdadeiro','verdadeiro'],['falso','falso']],salida:'Todavía no hay salida.'},
  {codigo:'numero a = 17;',detalle:'Guarda el número 17 con el nombre a.',memoria:[['a','17']],salida:'Todavía no hay salida.'},
  {codigo:'numero b = 5;',detalle:'Añade el número 5 con el nombre b.',memoria:[['a','17'],['b','5']],salida:'Todavía no hay salida.'},
  {codigo:'numero suma = a + b;',detalle:'Busca a y b, suma 17 + 5 y guarda 22.',memoria:[['a','17'],['b','5'],['suma','22']],salida:'Todavía no hay salida.'},
  {codigo:'escrever("Suma: " + suma);',detalle:'Une el texto con el valor de suma y lo muestra.',memoria:[['a','17'],['b','5'],['suma','22']],salida:'Suma: 22'}
];
let pasoMemoria = 0;
function dibujarMemoria() {
  const paso = pasos[pasoMemoria];
  document.getElementById('titulo-memoria').textContent = 'Paso ' + (pasoMemoria + 1) + ' de ' + pasos.length;
  document.getElementById('codigo-memoria').textContent = paso.codigo;
  document.getElementById('detalle-memoria').textContent = paso.detalle;
  document.getElementById('salida-memoria').textContent = paso.salida;
  const cuerpo = document.getElementById('datos-memoria'); cuerpo.replaceChildren();
  const entradas = pasoMemoria === 0 ? paso.memoria : [...pasos[0].memoria, ...paso.memoria];
  for (const [nombre, valor] of entradas) {
    const fila = document.createElement('tr');
    for (const texto of [nombre, valor]) { const celda = document.createElement('td'); celda.textContent = texto; fila.append(celda); }
    cuerpo.append(fila);
  }
  document.getElementById('memoria-anterior').disabled = pasoMemoria === 0;
  document.getElementById('memoria-siguiente').disabled = pasoMemoria === pasos.length - 1;
}
document.getElementById('memoria-anterior').onclick = () => { pasoMemoria--; dibujarMemoria(); };
document.getElementById('memoria-siguiente').onclick = () => { pasoMemoria++; dibujarMemoria(); };
document.getElementById('memoria-reiniciar').onclick = () => { pasoMemoria = 0; dibujarMemoria(); };
document.getElementById('saludar-demo').onclick = () => {
  document.getElementById('saludo-demo').textContent = 'Hola, ' + document.getElementById('nombre-demo').value;
};
document.getElementById('doble-demo').onclick = () => {
  const valor = document.getElementById('numero-demo').valueAsNumber;
  document.getElementById('resultado-demo').textContent = Number.isFinite(valor) ? 'doble(' + valor + ') → ' + valor * 2 : 'Escribe un número válido.';
};
dibujarMemoria(); mostrar(0);
