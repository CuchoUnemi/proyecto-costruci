# UNEMI-IA: Asistente Virtual Universitario

**UNEMI-IA** es un asistente virtual diseñado para ayudar a los estudiantes de la Universidad Estatal de Milagro (UNEMI) en la selección de carreras universitarias. Este sistema incluye un chatbot inteligente, un sistema de autenticación de usuarios, y un panel administrativo que visualiza las carreras más consultadas a través de gráficos interactivos.

## Tabla de Contenidos
- [Características principales](#características-principales)
- [Instalación](#instalación)
  - [Requisitos previos](#requisitos-previos)
  - [Clonar el repositorio](#clonar-el-repositorio)
  - [Crear y activar un entorno virtual](#crear-y-activar-un-entorno-virtual)
  - [Instalar las dependencias](#instalar-las-dependencias)
  - [Configurar la base de datos](#configurar-la-base-de-datos)
  - [Aplicar migraciones y crear un superusuario](#aplicar-migraciones-y-crear-un-superusuario)
  - [Ejecutar el servidor](#ejecutar-el-servidor)
  - [Configurar la API de OpenAI](#configurar-la-api-de-openai)
- [Flujo del Sistema](#flujo-del-sistema)
- [Guía de Usuario](#guía-de-usuario)
  - [Registro e inicio de sesión](#registro-e-inicio-de-sesión)
  - [Uso del Chatbot](#uso-del-chatbot)
  - [Panel de Administración](#panel-de-administración)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Licencia](#licencia)

## Características principales
- **Inicio de sesión y registro de usuarios**: Autenticación segura utilizando correo electrónico y contraseña.
- **Chatbot de carreras universitarias**: Responde a preguntas frecuentes sobre carreras e información básica de la universidad mediante procesamiento de lenguaje natural (NLP) con la API de OpenAI.
- **Panel administrativo**: Gráficos interactivos con estadísticas de las carreras más consultadas.

## Instalación

### Requisitos previos
Asegúrate de contar con los siguientes componentes instalados en tu sistema:
- Python 3.8+
- Django 4.0+
- PostgreSQL (Amazon RDS o base de datos local para pruebas)
- Virtualenv

### Clonar el repositorio
Clona el repositorio del proyecto a tu máquina local:

`git clone https://github.com/CuchoUnemi/proyecto-costruci-n.git`

`cd unemi-ia`

### Crear y activar un entorno virtual
Crea y activa un entorno virtual para aislar las dependencias del proyecto:

`python -m venv venv`

`source venv/bin/activate`  (En Windows usa `venv\Scripts\activate`)

### Instalar las dependencias
Instala las dependencias necesarias desde el archivo `requirements.txt`:

`pip install -r requirements.txt`

### Configurar la base de datos
Configura la base de datos (puede ser Amazon RDS o localmente). Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables de entorno:

`DB_ENGINE=django.db.backends.postgresql`

`DB_DATABASE=nombre_de_la_base_de_datos`

`DB_USERNAME=tu_usuario`

`DB_PASSWORD=tu_contraseña`

`DB_HOST=rds_endpoint_amazon`

`DB_PORT=5432`


### Aplicar migraciones y crear un superusuario
Ejecuta las migraciones para crear las tablas de la base de datos y configura un superusuario para acceder al panel administrativo:

`python manage.py migrate`

`python manage.py createsuperuser`

### Ejecutar el servidor
Inicia el servidor de desarrollo de Django:

`python manage.py runserver`

El servidor estará disponible en [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

## Flujo del Sistema

### Registro e inicio de sesión
- Los usuarios pueden registrarse proporcionando su correo electrónico y una contraseña.
- Una vez registrados, pueden iniciar sesión con sus credenciales para acceder a las funcionalidades del sistema.

### Interacción con el chatbot
- Los usuarios pueden hacer preguntas relacionadas con las carreras universitarias.
- El chatbot utiliza la API de OpenAI para ofrecer respuestas personalizadas e informacion institucional basica.

### Panel administrativo
- Los administradores pueden acceder al panel administrativo .
- En el panel, se presentan gráficos interactivos que muestran las carreras más consultadas por los estudiantes.

## Guía de Usuario

### Registro e inicio de sesión
- Los nuevos usuarios deben registrarse con su correo electrónico y una contraseña.
- Luego, inician sesión para acceder a todas las funcionalidades del sistema.

### Uso del Chatbot
- Accede a la sección de chatbot desde la barra de navegación.
- Escribe una pregunta relacionada con las carreras universitarias y el chatbot responderá automáticamente.

### Panel de Administración
- Solo los administradores pueden acceder al panel administrativo.
- Inicia sesión como superusuario y dirígete a `/admin` para visualizar las estadísticas.

## Tecnologías Utilizadas
- **Django**: Framework principal para el desarrollo del sistema web.
- **PostgreSQL (Amazon RDS)**: Base de datos para almacenar información de usuarios, consultas y estadísticas.
- **Scikit-learn**: Biblioteca de machine learning para el análisis de datos en el panel administrativo.
- **API de OpenAI**: Para el procesamiento de lenguaje natural (NLP) en el chatbot.
- **Apexchart**:  Libreria usada para la generación de gráficos en el panel administrativo.

## Licencia
Este proyecto está licenciado bajo la CUCHO-STORE. 
<h2>Video Tutorial</h2>

### Video Tutorial

Mira este video para aprender a utilizar UNEMI-IA:

[![Video Tutorial](https://img.youtube.com/vi/3cwR6D-fUp4/maxresdefault.jpg)](https://youtu.be/3cwR6D-fUp4?si=s9NTWqddV-579Rqe)




