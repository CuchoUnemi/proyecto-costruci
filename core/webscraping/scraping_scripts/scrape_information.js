const { chromium } = require('playwright');
const fs = require('fs').promises;

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Función para leer el archivo JSON de cada modalidad
    async function leerArchivoJson(modalidad) {
        try {
            const data = await fs.readFile(`carreras_${modalidad}.json`, 'utf-8');
            // console.warn(JSON.parse(data))
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error al leer el archivo carreras_${modalidad}.json: ${error.message}`);
            return [];
        }
    }

    // Función para verificar las URLs de las carreras
    async function verificarUrlsCarreras() {
        try {
            // Leer los archivos de carreras de las tres modalidades
            const carrerasPresencial = await leerArchivoJson('presencial');
            const carrerasSemipresencial = await leerArchivoJson('semipresencial');
            const carrerasEnLinea = await leerArchivoJson('en_linea');

            // Unificar todas las carreras en un solo array
            const todasCarreras = [
                ...carrerasPresencial,
                ...carrerasSemipresencial,
                ...carrerasEnLinea
            ];

            const carrerasActualizadas = [];
            const carrerasNoActualizadas = [];

            // Verificar que las URLs contengan los textos actualizados
            for (const carrera of todasCarreras) {
                const { nombre, enlace } = carrera;
                if (
                    enlace.includes('carreras-presencial') ||
                    enlace.includes('carreras-semipresencial') ||
                    enlace.includes('carreras-en-linea')
                ) {
                    // Si la URL está actualizada, agregar al array de carreras actualizadas
                    carrerasActualizadas.push(carrera);
                } else {
                    // Si la URL no está actualizada, agregar al array de carreras no actualizadas
                    carrerasNoActualizadas.push(carrera);
                }
            }

            // Retornar ambas listas
            return {
                carrerasActualizadas,
                carrerasNoActualizadas
            };
        } catch (error) {
            console.error(`Error al verificar las URLs de las carreras: ${error.message}`);
            return {
                carrerasActualizadas: [],
                carrerasNoActualizadas: []
            };
        }
    }

    // Función para extraer información de cada carrera
    async function extraerInformacionCarreras(carrerasActualizadas) {
        const carrerasData = []; // Para las carreras que se procesarán en esta función
        // const carrerasExcluidas = []; // Para las carreras que no contienen el selector 'h1.vc_custom_heading'
    
        for (const carrera of carrerasActualizadas) {
            const { nombre, enlace } = carrera;
    
            try {
                // Navegar a la página de la carrera
                await page.goto(enlace, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
                // Verificar si la página contiene el selector 'h1.vc_custom_heading'
                const contieneCustomHeading = await page.locator('h1.vc_custom_heading').count();
                if (contieneCustomHeading === 0) {
                    continue;
                }
                // Temporizador para buscar cada selector (3 segundos = 3000 ms)
                const tiempoEspera = 3000;
    
                // Extraer el título otorgado
                let tituloOtorgado;
                try {
                    // Usar un selector que capture tanto span como b
                    const tituloElement = await page.locator('div.vc_cta3-content header + div p span, div.vc_cta3-content header + div p b, div.vc_cta3-content header + div h1 span').first();
                    tituloOtorgado = await tituloElement.textContent({ timeout: tiempoEspera });
                    if (!tituloOtorgado) {
                        tituloOtorgado = 'N/A';
                    }
                    console.log(`Título Otorgado: ${tituloOtorgado}`);
                } catch (error) {
                    console.error(`Error al extraer el título otorgado para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    tituloOtorgado = 'N/A'; // Valor por defecto en caso de fallo
                }
    
                // Extraer la duración de la carrera
                let duracion;
                try {
                    // Localizar y obtener los textos de los elementos p o h1 que estén cerca del icono fa-clock
                    const duracionTextos = await page.locator('div.vc_cta3-icons').filter({ has: page.locator('span.fa-clock') }).locator('..').locator('p, h1').allTextContents({ timeout: tiempoEspera });
                    
                    // Unir todos los textos encontrados
                    duracion = duracionTextos.join(' / ').trim(); // Une los textos y elimina espacios adicionales
                    if (!duracion) {
                        duracion = 'N/A';
                    }
                    console.log(`Duración: ${duracion}`);
                } catch (error) {
                    console.error(`Error al extraer la duración para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    duracion = 'N/A'; // Valor por defecto
                }

                // Extraer la modalidad de la carrera
                let modalidad;
                try {
                    modalidad = await page.locator('div.vc_cta3-icons').filter({ has: page.locator('span.fa-video, span.fa-users') }).locator('..').locator('p, h1').textContent({ timeout: tiempoEspera });
                    if (!modalidad) {
                        modalidad = 'N/A';
                    }
                    console.log(`Modalidad: ${modalidad}`);
                } catch (error) {
                    console.error(`Error al extraer la modalidad para la carrera "${nombre}" en ${enlace}: No se encontró el selector 'span.fa-video' en ${tiempoEspera / 1000} segundos.`);
                    modalidad = 'N/A'; // Valor por defecto
                }

                // Extraer la descripción de la carrera
                let descripcion;
                try {
                    const descripciones = await page.locator('div.vc_col-sm-8 div.wpb_text_column p').allTextContents({ timeout: tiempoEspera })
                    descripcion = descripciones.join('\n').trim(); 
                    if (!descripcion) {
                        descripcion = 'N/A';
                    }
                    console.log(`Descripción: ${descripcion}`);
                } catch (error) {
                    console.error(`Error al extraer la descripción para la carrera "${nombre}" en ${enlace}: No se encontró el selector 'div.wpb_text_column p' en ${tiempoEspera / 1000} segundos.`);
                    descripcion = 'N/A'; // Valor por defecto
                }

                // // Extraer los objetivos, misión y visión de la carrera
                let objetivos;
                try {
                    // localizar el div con 'data-vc-full-width="true"' para limitar la búsqueda a ese bloque
                    const objetivosTextos = await page.locator('div[data-vc-full-width="true"] .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    objetivos = objetivosTextos.join('\n').trim();
                    if (!objetivos) {
                        objetivos = 'N/A';
                    }
                    console.log(`Objetivos: ${objetivos}`);
                } catch (error) {
                    console.error(`error al extraer los objetivos para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    objetivos = 'N/A'; // valor por defecto
                }

                // extraer la sección de por qué estudiar la carrera
                let porqueEstudiar;
                try {
                    // localizar el div con el h2 que contiene el texto específico "¿por qué estudiar educación inicial?"
                    const porqueEstudiarTextos = await page.locator('h2:has-text("¿Por qué estudiar") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    porqueEstudiar = porqueEstudiarTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!porqueEstudiar) {
                        porqueEstudiar = 'N/A';
                    }

                    console.log(`¿Por qué estudiar la carrera?: ${porqueEstudiar}`);
                } catch (error) {
                    console.error(`error al extraer la sección de "¿por qué estudiar?" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    porqueEstudiar = 'N/A'; // valor por defecto en caso de error
                }

                // extraer la sección de autoridades
                let autoridades = '';
                try {
                    // seleccionamos todos los párrafos que están dentro de la sección de autoridades
                    const autoridadesLocators = await page.locator('h2:has-text("Autoridades") ~ div .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });

                    // procesar los textos de las autoridades
                    const autoridadesText = autoridadesLocators.map(texto => {
                        // separar nombre y cargo
                        const partes = texto.split('\n').map(linea => linea.trim()).filter(Boolean);
                        return partes.length > 1 ? `${partes[0]} - ${partes[1]}` : partes[0]; // combinar nombre y cargo si hay dos partes
                    }).join('\n'); // unir los textos con salto de línea

                    autoridades = autoridadesText || 'N/A'; // manejar caso de texto vacío
                    console.log(`Autoridades: ${autoridades}`);
                } catch (error) {
                    console.error(`Error al extraer la sección de autoridades: ${error.message}`);
                    autoridades = 'N/A'; // valor por defecto en caso de error
                }

                let perfilIngreso;
                try {
                    // localizar el div con el h2 que contiene el texto específico "Perfil de ingreso"
                    const perfilIngresoTextos = await page.locator('h2:has-text("Perfil de ingreso") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    perfilIngreso = perfilIngresoTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!perfilIngreso) {
                        perfilIngreso = 'N/A';
                    }

                    console.log(`Perfil de ingreso: ${perfilIngreso}`);
                } catch (error) {
                    console.error(`Error al extraer la sección de "perfil de ingreso" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    perfilIngreso = 'N/A'; // valor por defecto en caso de error
                }

                let perfilEgreso;
                try {
                    // localizar el div con el h2 que contiene el texto específico "Perfil de egreso"
                    const perfilEgresoTextos = await page.locator('h2:has-text("Perfil de egreso") + .gt3_spacing + .wpb_text_column .wpb_wrapper, h2:has-text("Perfil de egreso del profesional en Educación Especial") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    perfilEgreso = perfilEgresoTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!perfilEgreso) {
                        perfilEgreso = 'N/A';
                    }

                    console.log(`Perfil de egreso: ${perfilEgreso}`);
                } catch (error) {
                    console.error(`Error al extraer la sección de "perfil de egreso" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    perfilEgreso = 'N/A'; // valor por defecto en caso de error
                }

                let informacionAdicional = '';
                try {
                    // Localizar el h2 que contiene "¿Por qué estudiar?"
                    const porqueEstudiarH2 = await page.locator('h2:has-text("¿Por qué estudiar")');
                
                    // Localizar el div con clase que empieza por 'vc_custom_' subiendo en la jerarquía del DOM
                    const divPadre = await porqueEstudiarH2.locator('xpath=ancestor::div[starts-with(@class, "vc_custom_")]').first({ timeout: tiempoEspera });
                
                    // Localizar los divs que siguen a este div padre
                    const textosAdicionales = await divPadre.locator('~ div:not(:has(h2:has-text("Becas y otras alternativas financieras")), :has(h2:has-text("¿Necesitas asesoría?")), :has(h2:has-text("Programas relacionados que te pueden interesar")), :has(h2:has-text("Perfil de egreso")), :has(h2:has-text("Perfil de ingreso")), :has(h2:has-text("Profesores del grado")), :has(h2:has-text("Autoridades")))').allTextContents({ timeout: tiempoEspera });
                    
                    // Unir todos los textos encontrados con un salto de línea entre ellos
                    informacionAdicional = textosAdicionales.join('\n').trim();
                
                    // Si el texto extraído está vacío, asignar 'N/A'
                    if (!informacionAdicional) {
                        informacionAdicional = 'N/A';
                    }
                
                    console.log(`Información adicional: ${informacionAdicional}`);
                } catch (error) {
                    console.error(`Error al extraer la información adicional para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    informacionAdicional = 'N/A'; // valor por defecto en caso de error
                }

                // Almacenar los datos de la carrera
                carrerasData.push({
                    nombre: nombre,
                    enlace: enlace,
                    tituloOtorgado: tituloOtorgado.trim(),
                    duracion: duracion.trim(),
                    modalidad: modalidad.trim(),
                    descripcion: descripcion.trim(),
                    objetivos: objetivos.trim(),
                    porqueEstudiar: porqueEstudiar.trim(),
                    autoridades: autoridades.trim(),
                    perfilIngreso: perfilIngreso.trim(),
                    perfilEgreso: perfilEgreso.trim(),
                    informacionAdicional: informacionAdicional.trim()
                });
                console.log(`Información extraída para la carrera: ${nombre}`);
            } catch (error) {
                console.error(`Error al extraer información de la carrera "${nombre}" en ${enlace}: ${error.message}`);
            }
        }

        // Guardar los datos en un archivo JSON
        try {
            await fs.writeFile('informacion_carreras.json', JSON.stringify(carrerasData, null, 2));
            console.log('Información de carreras guardada en "informacion_carreras.json".');
        } catch (error) {
            console.error(`Error al guardar la información de las carreras: ${error.message}`);
        }
    }

    // Ejecutar la función y obtener las carreras actualizadas y desactualizadas
    const { carrerasActualizadas, carrerasNoActualizadas } = await verificarUrlsCarreras();
    // const carrerasActualizadas = [
    //     {
    //     nombre: "Contabilidad y Auditoría",
    //     enlace: "https://www.unemi.edu.ec/index.php/carreras-presencial/contabilidad-y-auditoria/"
    //     },
    //     {
    //     nombre: "Pedagogía de la Lengua y Literatura",
    //     enlace: "https://www.unemi.edu.ec/index.php/carreras-presencial/pedagogia-de-la-lengua-y-literatura/"
    //     },
    //     {
    //     nombre: "Pedagogía de los idiomas nacionales y extranjeros",
    //     enlace: "https://www.unemi.edu.ec/index.php/carreras-en-linea/pedagogia-de-los-idiomas-nacionales-y-extranjeros-modalidad-virtual/"
    //     }
    //     // Más carreras...
    // ];
    // Mostrar carreras no actualizadas
    // if (carrerasNoActualizadas.length > 0) {
    //     console.log('Las siguientes carreras tienen URLs desactualizadas:');
    //     carrerasNoActualizadas.forEach(carrera => {
    //         console.log(`- ${carrera.nombre}: ${carrera.enlace}`);
    //     });
    // } else {
    //     console.log('Todas las URLs de las carreras están actualizadas.');
    // }

    // Aquí podrías usar `carrerasActualizadas` para continuar con la extracción de información
    console.log(`Número de carreras actualizadas: ${carrerasActualizadas.length}`);


    // Función para extraer la información de cada carrera
    // Función para extraer información de cada carrera

    // Llamar a la función para extraer la información de las carreras actualizadas
    await extraerInformacionCarreras(carrerasActualizadas);

    // Ejecutar la función para extraer la información de las carreras
    // await extraerInformacionCarreras();
    // await leerArchivoJson('en_linea')
    // Ejecutar la función para verificar las URLs de las carreras
    // await verificarUrlsCarreras();
    await browser.close();
})();
