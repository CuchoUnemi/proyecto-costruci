import subprocess
from django.http import JsonResponse
import os
import json

def actualizar_chatbot(request):
    try:
        # ejecutar el script de scraping de carreras
        resultado_carreras = subprocess.run(['node', 'core/webscraping/scraping_scripts/scrape_careers.js'], check=True, capture_output=True, text=True)
        # print('RESULTADO CARRERAS',resultado_carreras)
        # ejecutar el script de scraping de información institucional
        resultado_informacion = subprocess.run(['node', 'core/webscraping/scraping_scripts/scrape_information.js'], check=True, capture_output=True, text=True)
        # # print('RESULTADO INFORMACIÓN',resultado_informacion)
        return JsonResponse({'message': 'chatbot actualizado exitosamente', 'output_carreras': resultado_carreras.stdout, 'output_informacion': resultado_informacion.stdout})
    except subprocess.CalledProcessError as e:
        return JsonResponse({'message': 'error al actualizar el chatbot', 'error': str(e), 'html': e.output}, status=500)

def graph_info(request):
    # Construir la ruta completa del archivo JSON
    json_path = os.path.join(os.path.dirname(__file__), 'scraping_scripts', 'graphinfo.json')

    # Cargar los datos del archivo
    with open(json_path, 'r') as json_file:
        data = json.load(json_file)

    # Devolver los datos como respuesta JSON
    return JsonResponse(data)
