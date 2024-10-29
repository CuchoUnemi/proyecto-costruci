import os
import json
import spacy
import unidecode
from fuzzywuzzy import process
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
import re
import random  # Para seleccionar respuestas al azar

# Cargar el modelo de spaCy en español
nlp = spacy.load('es_core_news_md')

script_dir = os.path.dirname(__file__)

# Ruta a la carpeta 'scraping_scripts' dentro de 'webscraping'
scraping_dir = os.path.join(script_dir, '..', 'webscraping', 'scraping_scripts')

# Cargar los archivos JSON con la información de las carreras y el banco de respuestas
file_path = os.path.join(scraping_dir, 'informacion_carreras.json')
with open(file_path, 'r', encoding='utf-8') as f:
    carreras_data = json.load(f)

banco_respuestas_path = os.path.join(scraping_dir, 'banco_respuestas.json')
with open(banco_respuestas_path, 'r', encoding='utf-8') as f:
    banco_respuestas = json.load(f)

# Cargar el archivo JSON con la información institucional
institucional_path = os.path.join(scraping_dir, 'informacion_institucional.json')
with open(institucional_path, 'r', encoding='utf-8') as f:
    institucional_data = json.load(f)

# Leer o inicializar el archivo 'graphinfo.json' para almacenar el conteo de carreras
graphinfo_path = os.path.join(scraping_dir, 'graphinfo.json')

# Verificar si el archivo existe y no está vacío antes de cargarlo
if os.path.exists(graphinfo_path):
    try:
        with open(graphinfo_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()  # Leer el contenido del archivo y quitar espacios en blanco
            if content:  # Si el archivo no está vacío
                graphinfo = json.loads(content)  # Cargar el contenido JSON
            else:
                graphinfo = {}  # Inicializar un diccionario vacío si el archivo está vacío
    except json.JSONDecodeError:
        # Si hay un error al cargar el JSON, inicializar como un diccionario vacío
        graphinfo = {}
else:
    graphinfo = {}  # Si el archivo no existe, inicializar un diccionario vacío

# Frases comunes para manejar interacciones no relacionadas con carreras
frases_comunes = {
    'hola': '¡Hola! ¿En qué puedo ayudarte hoy? Si tienes preguntas sobre las carreras universitarias o sobre la institución, estoy aquí para ayudarte.',
    'adios': '¡Hasta luego! Si necesitas más información, no dudes en regresar.',
    'gracias': '¡De nada! Estoy aquí para ayudar en lo que necesites.',
    'salir': '¡Hasta pronto! Espero volver a verte.'
}

# Sinónimos para palabras clave sobre carreras e información institucional
sinonimos = {
    'duracion': ['duración', 'dura', 'tiempo', 'periodo'],
    'titulo': ['titulo', 'graduación', 'otorgado', 'graduo', 'mi título', 'título', 'otorgado'],
    'modalidad': ['modalidad', 'tipo', 'formato'],
    'descripcion': ['descripcion', 'detalles', 'informacion', 'caracteristicas', 'resumen'],
    'objetivos': ['objetivos', 'metas', 'finalidades'],
    'porque estudiar': ['por que estudiar', 'razones para estudiar', 'motivos para estudiar'],
    'autoridades': ['autoridades', 'dirigentes', 'responsables', 'gestores'],
    'perfilIngreso': ['perfil de ingreso', 'requisitos de ingreso', 'condiciones de ingreso'],
    'perfilEgreso': ['perfil de egreso', 'requisitos de egreso', 'condiciones de egreso'],
    'informacionAdicional': ['información adicional', 'datos adicionales', 'más información'],
    'director': ['director', 'jefe', 'responsable', 'directora'],
    'decano': ['decano', 'decana', 'jefe de facultad', 'responsable de facultad'],
    'numeroEstudiantes': ['estudiantes', 'cantidad de estudiantes', 'poblacion', 'estudiantil'],
    'numeroCarreras': ['numero de carreras', 'cantidad de carreras', 'carreras ofertadas', 'carreras'],
    'direccion': ['direccion', 'ubicacion', 'sede', 'donde queda', 'direccion física'],
    'codigoPostal': ['código postal', 'postal', 'zipcode'],
    'historia': ['historia', 'trayectoria', 'orígenes'],
    'autoridadesPrincipales': ['autoridades', 'rector', 'vicerrector', 'autoridades principales']
}

# Función para seleccionar una respuesta aleatoria
def seleccionar_respuesta_aleatoria(clave_respuesta, **kwargs):
    respuestas = banco_respuestas.get(clave_respuesta, [])
    if respuestas:
        respuesta = random.choice(respuestas)  # Seleccionar una respuesta aleatoria
        return respuesta.format(**kwargs)  # Rellenar con los datos proporcionados
    return "Lo siento, no tengo información sobre eso."

# Función para limpiar el texto
def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

# Función para resumir texto usando TF-IDF y KMeans
def summarize_text(text, num_sentences=3):
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
    if len(sentences) <= num_sentences:
        return text
    
    vectorizer = TfidfVectorizer(max_df=0.8, max_features=10000)
    sentence_vectors = vectorizer.fit_transform(sentences)
    kmeans = KMeans(n_clusters=num_sentences, random_state=0)
    kmeans.fit(sentence_vectors)
    centroids = kmeans.cluster_centers_
    avg = np.mean(centroids, axis=0)
    closest = np.argsort(np.sum((centroids - avg)**2, axis=1))
    summarized_sentences = [sentences[i] for i in closest[:num_sentences]]
    
    return ' '.join(summarized_sentences)

# Normalización de texto para eliminar tildes y convertir a minúsculas
def normalizar_texto(texto):
    texto_normalizado = unidecode.unidecode(texto)
    return texto_normalizado.lower().strip()

# Función para actualizar el conteo de consultas por carrera
def actualizar_grafico(carrera_nombre):
    carrera_nombre = carrera_nombre.lower().strip()
    if carrera_nombre in graphinfo:
        graphinfo[carrera_nombre] += 1
    else:
        graphinfo[carrera_nombre] = 1
    
    # Guardar el archivo actualizado
    with open(graphinfo_path, 'w', encoding='utf-8') as f:
        json.dump(graphinfo, f, ensure_ascii=False, indent=4)

# Función para analizar la consulta
def analizar_pregunta(consulta):
    doc = nlp(consulta)
    palabras_clave = [token.lemma_ for token in doc if token.pos_ in ['NOUN', 'VERB', 'PROPN']]
    return ' '.join(palabras_clave)

# Obtener los nombres de las carreras
carreras_nombres = [carrera['nombre'] for carrera in carreras_data]

# Crear un vectorizador TF-IDF y ajustar con los nombres de las carreras
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(carreras_nombres)

# Función para encontrar la carrera más cercana
def encontrar_carrera(consulta, carrera_actual=None):
    consulta_procesada = analizar_pregunta(consulta)
    consulta_normalizada = normalizar_texto(consulta_procesada)

    # Mantener la carrera actual si el usuario sigue preguntando sobre ella
    if carrera_actual and consulta_normalizada in normalizar_texto(carrera_actual['nombre']):
        return carrera_actual

    for carrera in carreras_data:
        if consulta_normalizada in normalizar_texto(carrera['nombre']):
            return carrera
    
    # Si no se encuentra una coincidencia exacta, usar fuzzy matching
    mejor_coincidencia, puntaje = process.extractOne(consulta_normalizada, carreras_nombres)
    
    # Definir un umbral de puntaje más alto para evitar cambios irrelevantes de carrera
    if puntaje > 80:  # Puedes ajustar este umbral para más precisión
        indice = carreras_nombres.index(mejor_coincidencia)
        # Solo actualizar si es diferente de la carrera actual
        if carrera_actual is None or carrera_actual['nombre'] != carreras_nombres[indice]:
            return carreras_data[indice]

    return carrera_actual  # Mantener la carrera actual si no se encuentra una mejor coincidencia

# Función para verificar si una consulta incluye sinónimos
def contiene_sinonimo(consulta, tipo, sinonimos_tipo):
    consulta = consulta.lower()
    return any(sin in consulta for sin in sinonimos_tipo[tipo])

# Función para extraer información relevante de una carrera
def extraer_informacion(carrera, consulta):
    campos_info = {
        'duracion': 'duracion',
        'titulo': 'tituloOtorgado',
        'modalidad': 'modalidad',
        'descripcion': 'descripcion',
        'objetivos': 'objetivos',
        'porque estudiar': 'porqueEstudiar',  
        'autoridades': 'autoridades',
        'perfilIngreso': 'perfilIngreso',
        'perfilEgreso': 'perfilEgreso',
        'informacionAdicional': 'informacionAdicional'
    }

    # Si ya hay una carrera seleccionada, verificar si el director es de la carrera
    if contiene_sinonimo(consulta, 'director', sinonimos):
        autoridades = carrera.get('autoridades', 'No disponible').split('\n') if carrera.get('autoridades') else []
        director = next((a for a in autoridades if 'Directora' in a or 'Director' in a), 'No disponible')
        return director if director != 'No disponible' else 'No se encontró información sobre el director de la carrera.'

    if contiene_sinonimo(consulta, 'decano', sinonimos):
        autoridades = carrera.get('autoridades', 'No disponible').split('\n') if carrera.get('autoridades') else []
        decano = next((a for a in autoridades if 'Decana' in a or 'Decano' in a), 'No disponible')
        return decano if decano != 'No disponible' else 'No se encontró información sobre el decano de la carrera.'

    for clave, campo in campos_info.items():
        if contiene_sinonimo(consulta, clave, sinonimos):
            valor = carrera.get(campo, 'No disponible')
            if valor == "N/A":
                return f"Lo siento, no tengo información sobre {clave}."
            
            if campo in ['descripcion', 'objetivos', 'porqueEstudiar', 'perfilEgreso', 'informacionAdicional']:
                valor = clean_text(valor)
                valor = summarize_text(valor, num_sentences=3)
            
            respuestas = banco_respuestas.get(clave, [])
            if respuestas:
                return seleccionar_respuesta_aleatoria(clave, nombre=carrera['nombre'], **{clave: valor})
            else:
                return valor

    return "Lo siento, no puedo responder esa pregunta. Si tienes otra consulta, no dudes en preguntar."

# Función para extraer información institucional con respuestas aleatorias
def extraer_informacion_institucional(consulta):
    campos_institucionales = {
        'numeroEstudiantes': 'numeroEstudiantes',
        'numeroCarreras': 'numeroCarreras',
        'direccion': 'direccion',
        'codigoPostal': 'codigoPostal',
        'autoridadesPrincipales': 'autoridadesPrincipales',
        'historia': 'historia'
    }

    for clave, campo in campos_institucionales.items():
        if contiene_sinonimo(consulta, clave, sinonimos):  # Ahora usa 'sinonimos'
            valor = institucional_data.get(campo, 'No disponible')
            if campo == 'historia':
                valor = summarize_text(valor, num_sentences=3)

            respuestas = banco_respuestas.get(clave, [])
            if respuestas:
                return seleccionar_respuesta_aleatoria(clave, **{clave: valor})
            else:
                return valor

    return "Lo siento, no puedo responder esa pregunta sobre la institución."

# Función para analizar si la consulta es institucional
def es_informacion_institucional(consulta):
    palabras_clave_institucional = ['unemi', 'universidad', 'institución', 'código postal', 'sede', 'ubicación', 'dirección']
    consulta_normalizada = normalizar_texto(consulta)
    return any(palabra in consulta_normalizada for palabra in palabras_clave_institucional)

# Función para manejar frases comunes
def manejar_frase_comun(consulta):
    consulta_limpia = consulta.lower().strip()
    for frase, respuesta in frases_comunes.items():
        if frase in consulta_limpia:
            return respuesta
    return None

# Función principal del chatbot
def interactuar_con_usuario(msg):
    print("Bienvenido al chatbot de carreras universitarias e información institucional. ¿En qué puedo ayudarte hoy?")
    carrera_actual = None

    consulta = msg.strip()

    # Verificar si la consulta está vacía
    if not consulta:
        print("Chatbot: Por favor, ingresa una pregunta.")

    # Verificar frases comunes
    respuesta_comun = manejar_frase_comun(consulta)
    if respuesta_comun:
        print(f"Chatbot: {respuesta_comun}")

    # Si la consulta es institucional, priorizar la respuesta institucional
    if es_informacion_institucional(consulta):
        respuesta_institucional = extraer_informacion_institucional(consulta)
        if respuesta_institucional:
            return(f"{respuesta_institucional}")

    # Buscar si la consulta está relacionada con una nueva carrera
    nueva_carrera = encontrar_carrera(consulta, carrera_actual)

    # Si se menciona explícitamente una nueva carrera, actualizar el contexto y sumar al gráfico
    if nueva_carrera and (carrera_actual is None or nueva_carrera['nombre'] != carrera_actual['nombre']):
        carrera_actual = nueva_carrera
        actualizar_grafico(carrera_actual['nombre'])  # Actualizar el gráfico de consultas

    # Si hay una carrera seleccionada y la consulta no es institucional, priorizar la respuesta sobre la carrera
    if carrera_actual:
        respuesta_info = extraer_informacion(carrera_actual, consulta)
        if respuesta_info:
            return(f"{respuesta_info}")

    # Si ninguna opción coincide
    return("Lo siento, no pude entender tu pregunta. ¿Puedes intentar de nuevo?")

# # Iniciar la interacción
# if __name__ == "__main__":
#     interactuar_con_usuario()
