import sys
from pathlib import Path as Ruta

from lexico import analizar as analizar_lexico
from sintactico import analizar as analizar_sintaxis
from interprete import ejecutar


def principal():
    archivo = Ruta(sys.argv[1]) if len(sys.argv) > 1 else Ruta(__file__).resolve().parent.parent / "programas" / "01HolaMundo.az"
    try:
        codigo = archivo.read_text(encoding="utf-8-sig")
        instrucciones = analizar_sintaxis(analizar_lexico(codigo))
        ejecutar(instrucciones)
    except OSError:
        print(f"Error: no se pudo leer el archivo '{archivo}'. Comprueba la ruta.", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nPrograma detenido.")
        return 130
    except (ValueError, TypeError, SyntaxError, KeyError, IndexError, ZeroDivisionError,
            OverflowError, RecursionError, EOFError):
        print("Error: revisa las instrucciones, los nombres y los valores.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(principal())
