import re

def analizar(codigo):
    patron = r'\s+|#[^\n]*|"(?:\\.|[^"\\\n])*"|\d+(?:\.\d+)?|[^\W\d]\w*|==|!=|<=|>=|\*\*|[+\-*/%=<>(),;{}:]'
    elementos = []
    posicion = 0
    linea = 1
    while posicion < len(codigo):
        coincidencia = re.match(patron, codigo[posicion:])
        if not coincidencia:
            raise ValueError(f"Línea {linea}: carácter no válido {codigo[posicion]!r}.")
        elemento = coincidencia.group()
        if not elemento.isspace() and not elemento.startswith("#"):
            elementos.append((elemento, linea))
        linea += elemento.count("\n")
        posicion += len(elemento)
    return elementos
