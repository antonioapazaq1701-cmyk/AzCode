const datos = JSON.parse(document.getElementById('datos-codigo').textContent);
let archivoActual = datos[0], lineasVisibles = [], posicionActual = 0;
const contenedor = document.getElementById('codigo');
const buscador = document.getElementById('buscar');
function seleccionarLinea(indice, desplazar = false) {
  if (!lineasVisibles.length) return;
  posicionActual = Math.max(0, Math.min(indice, lineasVisibles.length - 1));
  const linea = lineasVisibles[posicionActual];
  contenedor.querySelectorAll('.linea').forEach(boton => {
    const seleccionada = Number(boton.dataset.numero) === linea.numero;
    boton.classList.toggle('seleccionada', seleccionada);
    boton.setAttribute('aria-pressed', String(seleccionada));
  });
  document.getElementById('numero-nota').textContent = 'Línea ' + linea.numero;
  document.getElementById('texto-nota').textContent = linea.nota;
  const detalles = document.getElementById('detalles-linea');
  detalles.replaceChildren();
  for (const detalle of linea.detalles || []) {
    const seccion = document.createElement('section');
    const titulo = document.createElement('h3'); titulo.textContent = detalle.titulo;
    const explicacion = document.createElement('p'); explicacion.textContent = detalle.explicacion;
    seccion.append(titulo, explicacion); detalles.append(seccion);
  }
  document.getElementById('fragmento').textContent = linea.codigo;
  document.getElementById('estado-linea').textContent = archivoActual.nombre + ' · Línea ' + linea.numero;
  document.getElementById('anterior-linea').disabled = posicionActual === 0;
  document.getElementById('siguiente-linea').disabled = posicionActual === lineasVisibles.length - 1;
  if (desplazar) contenedor.querySelector('.seleccionada')?.scrollIntoView({block: 'nearest', inline: 'nearest'});
}
function dibujarLineas() {
  const consulta = buscador.value.toLocaleLowerCase('es');
  lineasVisibles = archivoActual.lineas.filter(linea => (linea.codigo + ' ' + linea.nota + ' ' + JSON.stringify(linea.detalles || [])).toLocaleLowerCase('es').includes(consulta));
  contenedor.replaceChildren();
  for (const [indice, linea] of lineasVisibles.entries()) {
    const boton = document.createElement('button');
    boton.className = 'linea'; boton.dataset.numero = linea.numero;
    boton.setAttribute('aria-label', 'Explicar línea ' + linea.numero);
    const numero = document.createElement('span'); numero.className = 'numero'; numero.textContent = linea.numero;
    const codigo = document.createElement('code'); codigo.innerHTML = linea.coloreado;
    boton.append(numero, codigo); boton.onclick = () => seleccionarLinea(indice); contenedor.append(boton);
  }
  document.getElementById('cantidad').textContent = lineasVisibles.length + (lineasVisibles.length === 1 ? ' línea con código' : ' líneas con código');
  document.getElementById('sin-resultados').hidden = lineasVisibles.length > 0;
  document.getElementById('nota').hidden = !lineasVisibles.length;
  seleccionarLinea(0);
}
function abrirArchivo(nombre) {
  archivoActual = datos.find(archivo => archivo.nombre === nombre);
  buscador.value = '';
  document.querySelectorAll('[data-archivo]').forEach(boton => {
    const activo = boton.dataset.archivo === nombre;
    boton.classList.toggle('activo', activo);
    if (boton.getAttribute('role') === 'tab') boton.setAttribute('aria-selected', String(activo));
  });
  contenedor.setAttribute('aria-labelledby', 'pestana-' + nombre);
  dibujarLineas(); contenedor.scrollTop = 0;
}
document.querySelectorAll('[data-archivo]').forEach(boton => boton.onclick = () => abrirArchivo(boton.dataset.archivo));
document.getElementById('anterior-linea').onclick = () => seleccionarLinea(posicionActual - 1, true);
document.getElementById('siguiente-linea').onclick = () => seleccionarLinea(posicionActual + 1, true);
buscador.oninput = dibujarLineas;
document.querySelector('.pestanas').addEventListener('keydown', evento => {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(evento.key)) return;
  evento.preventDefault();
  let indice = datos.indexOf(archivoActual);
  if (evento.key === 'Home') indice = 0;
  else if (evento.key === 'End') indice = datos.length - 1;
  else indice = (indice + (evento.key === 'ArrowRight' ? 1 : -1) + datos.length) % datos.length;
  abrirArchivo(datos[indice].nombre); document.getElementById('pestana-' + archivoActual.nombre).focus();
});
abrirArchivo(datos[0].nombre);
