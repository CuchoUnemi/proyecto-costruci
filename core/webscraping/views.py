import subprocess
from django.http import JsonResponse

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
