const lienzoBits = document.getElementById('lluvia-bits');
const contextoBits = lienzoBits.getContext('2d');
const botonBits = document.getElementById('bits-boton');
const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
let bits = [], animacionBits = null, ultimaPintura = 0, activoBits = !movimientoReducido.matches;
function ajustarBits() {
  const escala = Math.min(devicePixelRatio || 1, 2);
  lienzoBits.width = innerWidth * escala; lienzoBits.height = innerHeight * escala;
  contextoBits.setTransform(escala, 0, 0, escala, 0, 0);
  bits = Array.from({length:Math.min(85,Math.floor(innerWidth / 18))}, () => ({
    x:Math.random()*innerWidth, y:Math.random()*innerHeight,
    velocidad:12+Math.random()*28, caracter:Math.random()>.5?'1':'0', opacidad:.08+Math.random()*.16
  }));
  pintarBits(0);
}
function pintarBits(segundos) {
  contextoBits.clearRect(0,0,innerWidth,innerHeight);
  contextoBits.font = '15px Consolas, monospace';
  for (const bit of bits) {
    bit.y += bit.velocidad * segundos;
    if (bit.y > innerHeight+20) { bit.y=-20; bit.x=Math.random()*innerWidth; }
    contextoBits.fillStyle = `rgba(12,99,157,${bit.opacidad})`;
    contextoBits.fillText(bit.caracter,bit.x,bit.y);
  }
}
function cuadroBits(tiempo) {
  if (!activoBits || document.hidden) { animacionBits=null; return; }
  if (tiempo-ultimaPintura>=50) {
    pintarBits(ultimaPintura ? Math.min((tiempo-ultimaPintura)/1000,.1) : 0);
    ultimaPintura=tiempo;
  }
  animacionBits=requestAnimationFrame(cuadroBits);
}
function sincronizarBits() {
  if (animacionBits!==null) cancelAnimationFrame(animacionBits);
  animacionBits=null; ultimaPintura=0;
  botonBits.textContent=activoBits?'Pausar bits':'Activar bits';
  botonBits.setAttribute('aria-pressed',String(activoBits));
  botonBits.disabled=movimientoReducido.matches;
  if (movimientoReducido.matches) botonBits.textContent='Bits sin movimiento';
  if (activoBits && !document.hidden) animacionBits=requestAnimationFrame(cuadroBits);
}
botonBits.onclick=()=>{activoBits=!activoBits;sincronizarBits();};
movimientoReducido.addEventListener('change',()=>{activoBits=!movimientoReducido.matches;sincronizarBits();});
document.addEventListener('visibilitychange',sincronizarBits);
addEventListener('resize',ajustarBits);
ajustarBits();sincronizarBits();
