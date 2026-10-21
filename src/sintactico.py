import re


def analizar(elementos):
    posicion = 0
    reservadas = set("programa inicio fim numero texto booleano escrever ler funcao verdadeiro falso e ou nao potencia raiz enquanto para de ate escolha caso padrao".split())

    def ver():
        return elementos[posicion][0] if posicion < len(elementos) else ""

    def tomar(esperado=None):
        nonlocal posicion
        elemento = ver()
        if not elemento:
            raise ValueError("El programa está incompleto.")
        if esperado is not None and elemento != esperado:
            raise ValueError(f"Falta '{esperado}'.")
        posicion += 1
        return elemento

    def nombre(identificador=None):
        identificador = tomar() if identificador is None else identificador
        if not re.fullmatch(r'[^\W\d]\w*', identificador) or identificador in reservadas:
            raise ValueError("El nombre no es válido.")
        return identificador

    def expresion(hasta):
        partes = []
        nivel = 0
        traducciones = {"e": "and", "ou": "or", "nao": "not"}
        while ver() != hasta or nivel != 0:
            parte = tomar()
            if parte == "(":
                nivel += 1
            elif parte == ")":
                nivel -= 1
            if nivel < 0:
                raise ValueError("Revisa los paréntesis.")
            partes.append(traducciones.get(parte, parte))
        if not partes:
            raise ValueError("Falta un valor.")
        return " ".join(partes)

    def bloque(finales):
        instrucciones = []
        while ver() not in finales:
            operacion = tomar()
            identificador = None
            datos = []
            if operacion == "enquanto":
                condicion = expresion("{")
                tomar("{")
                cuerpo = bloque({"}"})
                tomar("}")
                instrucciones.append((operacion, None, cuerpo, condicion))
                continue
            if operacion == "para":
                identificador = nombre()
                tomar("de")
                desde = expresion("ate")
                tomar("ate")
                hasta = expresion("{")
                tomar("{")
                cuerpo = bloque({"}"})
                tomar("}")
                instrucciones.append((operacion, identificador, cuerpo, (desde, hasta)))
                continue
            if operacion == "escolha":
                selector = expresion("{")
                tomar("{")
                predeterminado = False
                while ver() != "}":
                    opcion = tomar()
                    if opcion == "caso":
                        valor = expresion(":")
                    elif opcion == "padrao" and not predeterminado:
                        valor = None
                        predeterminado = True
                    else:
                        raise ValueError("Usa caso o un solo padrao dentro de escolha.")
                    tomar(":")
                    datos.append((valor, bloque({"caso", "padrao", "}"})))
                tomar("}")
                instrucciones.append((operacion, None, datos, selector))
                continue
            if operacion in ("numero", "texto", "booleano", "funcao"):
                identificador = nombre()
                if operacion != "funcao" and ver() == ";":
                    tomar(";")
                    inicial = {"numero": "0", "texto": '""', "booleano": "falso"}[operacion]
                    instrucciones.append((operacion, identificador, [], inicial))
                    continue
                if operacion == "funcao":
                    tomar("(")
                    if ver() != ")":
                        datos.append(nombre())
                        while ver() == ",":
                            tomar(",")
                            datos.append(nombre())
                    tomar(")")
                    if len(datos) != len(set(datos)):
                        raise ValueError("Hay parámetros repetidos.")
                tomar("=")
            elif operacion == "ler":
                tomar("(")
                identificador = nombre()
                tomar(")")
                tomar(";")
                instrucciones.append((operacion, identificador, [], ""))
                continue
            elif operacion == "escrever":
                tomar("(")
                valor = expresion(")")
                tomar(")")
                tomar(";")
                instrucciones.append((operacion, None, [], valor))
                continue
            else:
                identificador = nombre(operacion)
                tomar("=")
                operacion = "asignar"
            valor = expresion(";")
            tomar(";")
            instrucciones.append((operacion, identificador, datos, valor))
        return instrucciones

    tomar("programa")
    nombre()
    tomar(";")
    tomar("inicio")
    instrucciones = bloque({"fim"})
    tomar("fim")
    if ver():
        raise ValueError("Hay código después de fim.")
    return instrucciones
