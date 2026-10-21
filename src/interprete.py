import ast
import operator as operadores


def raiz(numero):
    if type(numero) not in (int, float) or numero < 0:
        raise ValueError("La raíz necesita un número no negativo.")
    return numero ** 0.5


def mostrar(valor):
    if type(valor) is bool:
        return "verdadeiro" if valor else "falso"
    return str(valor)


def evaluar(expresion, variables, funciones):
    def resolver(nodo):
        if isinstance(nodo, ast.Constant) and type(nodo.value) in (int, float, str):
            return nodo.value
        if isinstance(nodo, ast.Name):
            return variables[nodo.id]
        if isinstance(nodo, ast.UnaryOp):
            valor = resolver(nodo.operand)
            signos = {ast.UAdd: operadores.pos, ast.USub: operadores.neg, ast.Not: operadores.not_}
            if isinstance(nodo.op, ast.Not) and type(valor) is not bool:
                raise ValueError("nao necesita un booleano.")
            return signos[type(nodo.op)](valor)
        if isinstance(nodo, ast.BinOp):
            izquierda = resolver(nodo.left)
            derecha = resolver(nodo.right)
            if isinstance(nodo.op, ast.Add) and (type(izquierda) is str or type(derecha) is str):
                return mostrar(izquierda) + mostrar(derecha)
            if type(izquierda) not in (int, float) or type(derecha) not in (int, float):
                raise ValueError("La operación necesita números.")
            operaciones = {ast.Add: operadores.add, ast.Sub: operadores.sub,
                           ast.Mult: operadores.mul, ast.Div: operadores.truediv,
                           ast.Mod: operadores.mod, ast.Pow: operadores.pow}
            return operaciones[type(nodo.op)](izquierda, derecha)
        if isinstance(nodo, ast.Compare):
            comparaciones = {ast.Eq: operadores.eq, ast.NotEq: operadores.ne,
                             ast.Lt: operadores.lt, ast.Gt: operadores.gt,
                             ast.LtE: operadores.le, ast.GtE: operadores.ge}
            izquierda = resolver(nodo.left)
            for signo, parte in zip(nodo.ops, nodo.comparators):
                derecha = resolver(parte)
                if not comparaciones[type(signo)](izquierda, derecha):
                    return False
                izquierda = derecha
            return True
        if isinstance(nodo, ast.BoolOp):
            for parte in nodo.values:
                valor = resolver(parte)
                if type(valor) is not bool:
                    raise ValueError("Usa booleanos con e y ou.")
                if isinstance(nodo.op, ast.And) and not valor:
                    return False
                if isinstance(nodo.op, ast.Or) and valor:
                    return True
            return valor
        if isinstance(nodo, ast.Call) and isinstance(nodo.func, ast.Name) and not nodo.keywords:
            nombre = nodo.func.id
            argumentos = [resolver(parte) for parte in nodo.args]
            if nombre == "ler":
                return input(*argumentos)
            if nombre == "raiz":
                return raiz(*argumentos)
            if nombre == "potencia":
                return operadores.pow(*argumentos)
            parametros, cuerpo = funciones[nombre]
            if len(parametros) != len(argumentos):
                raise ValueError("La cantidad de argumentos no coincide.")
            locales = variables.copy()
            locales.update(zip(parametros, argumentos))
            return evaluar(cuerpo, locales, funciones)
        raise ValueError("La expresión no está permitida.")

    return resolver(ast.parse(expresion, mode="eval").body)


def ejecutar(instrucciones):
    variables = {"verdadeiro": True, "falso": False}
    funciones = {}
    tipos = {"numero": (int, float), "texto": (str,), "booleano": (bool,)}
    tipos_variables = {}

    def guardar(nombre, valor, tipo):
        if tipo == "numero" and type(valor) is str:
            valor = float(valor)
        if tipo == "booleano" and type(valor) is str:
            valor = {"verdadeiro": True, "falso": False}[valor.strip()]
        if type(valor) not in tipos[tipo]:
            raise ValueError(f"El valor no es de tipo {tipo}.")
        variables[nombre] = valor
        tipos_variables[nombre] = tipo

    def procesar(bloque):
        for operacion, nombre, datos, expresion in bloque:
            if operacion == "enquanto":
                while evaluar(expresion, variables, funciones):
                    procesar(datos)
            elif operacion == "para":
                desde = evaluar(expresion[0], variables, funciones)
                hasta = evaluar(expresion[1], variables, funciones)
                if type(desde) not in (int, float) or type(hasta) not in (int, float) or desde != int(desde) or hasta != int(hasta):
                    raise ValueError("Los límites de para deben ser enteros.")
                if nombre in funciones or (nombre in tipos_variables and tipos_variables[nombre] != "numero"):
                    raise ValueError("El contador debe ser numérico.")
                for contador in range(int(desde), int(hasta) + 1):
                    guardar(nombre, contador, "numero")
                    procesar(datos)
            elif operacion == "escolha":
                valor = evaluar(expresion, variables, funciones)
                predeterminado = []
                encontrado = False
                for caso, cuerpo in datos:
                    if caso is None:
                        predeterminado = cuerpo
                    elif valor == evaluar(caso, variables, funciones):
                        procesar(cuerpo)
                        encontrado = True
                        break
                if not encontrado:
                    procesar(predeterminado)
            elif operacion == "ler":
                tipo = tipos_variables[nombre]
                guardar(nombre, input(f"{nombre}: "), tipo)
            elif operacion == "funcao":
                if nombre in funciones or nombre in variables:
                    raise ValueError("El nombre ya existe.")
                ast.parse(expresion, mode="eval")
                funciones[nombre] = (datos, expresion)
            elif operacion == "asignar":
                tipo = tipos_variables[nombre]
                guardar(nombre, evaluar(expresion, variables, funciones), tipo)
            elif operacion == "escrever":
                print(mostrar(evaluar(expresion, variables, funciones)))
            else:
                if nombre in variables or nombre in funciones:
                    raise ValueError("El nombre ya existe.")
                guardar(nombre, evaluar(expresion, variables, funciones), operacion)

    procesar(instrucciones)
    return variables
