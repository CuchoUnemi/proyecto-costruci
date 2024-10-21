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
    async function unificarCarreras() {
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

            return {
                todasCarreras
            };
        } catch (error) {
            console.error(`Error al verificar las URLs de las carreras: ${error.message}`);
            return {
                todasCarreras
            };
        }
    }

    // Función para extraer información de cada carrera
    async function extraerInformacionCarreras(carrerasActualizadas) {
        const carrerasData = []; // Para las carreras que se procesarán en esta función
        // const carrerasExcluidas = []; // Para las carreras que no contienen el selector 'h1.vc_custom_heading'
    
        for (const carrera of carrerasActualizadas) {
            const { nombre, enlace, modalidad } = carrera;
            console.log(modalidad)
            try {
                // Navegar a la página de la carrera
                await page.goto(enlace, { waitUntil: 'domcontentloaded', timeout: 60000 });
                let tituloOtorgado, duracion, modalidadInfo, descripcion, objetivos, porqueEstudiar, perfilIngreso, perfilEgreso
                let autoridades = '';
                let informacionAdicional = '';
                // Verificar si la página contiene el selector 'h1.vc_custom_heading'
                const contieneCustomHeading = await page.locator('h1.vc_custom_heading').count();
                if (contieneCustomHeading === 0) {
                    carrerasData.push({
                        nombre: nombre,
                        enlace: enlace,
                        tituloOtorgado: 'N/A',
                        duracion: 'N/A',
                        modalidad: modalidad,
                        descripcion: 'N/A',
                        objetivos: 'N/A',
                        porqueEstudiar: 'N/A',
                        autoridades: 'N/A',
                        perfilIngreso: 'N/A',
                        perfilEgreso: 'N/A',
                        informacionAdicional: 'N/A',
                    });
                    console.log(`Información extraída para la carrera: ${nombre}`);
                    continue;
                }
                // Temporizador para buscar cada selector (3 segundos = 3000 ms)
                const tiempoEspera = 3000;
    
                // Extraer el título otorgado
                try {
                    // Usar un selector que capture tanto span como b
                    const tituloElement = await page.locator('div.vc_cta3-content header + div p span, div.vc_cta3-content header + div p b, div.vc_cta3-content header + div h1 span').first();
                    tituloOtorgado = await tituloElement.textContent({ timeout: tiempoEspera });
                    if (!tituloOtorgado) {
                        tituloOtorgado = 'N/A';
                    }
                } catch (error) {
                    console.error(`Error al extraer el título otorgado para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    tituloOtorgado = 'N/A'; // Valor por defecto en caso de fallo
                }
    
                // Extraer la duración de la carrera

                try {
                    // Localizar y obtener los textos de los elementos p o h1 que estén cerca del icono fa-clock
                    const duracionTextos = await page.locator('div.vc_cta3-icons').filter({ has: page.locator('span.fa-clock') }).locator('..').locator('p, h1').allTextContents({ timeout: tiempoEspera });
                    
                    // Unir todos los textos encontrados
                    duracion = duracionTextos.join(' / ').trim(); // Une los textos y elimina espacios adicionales
                    if (!duracion) {
                        duracion = 'N/A';
                    }
                } catch (error) {
                    console.error(`Error al extraer la duración para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    duracion = 'N/A'; // Valor por defecto
                }

                // Extraer la modalidad de la carrera

                try {
                    modalidadInfo = await page.locator('div.vc_cta3-icons').filter({ has: page.locator('span.fa-video, span.fa-users') }).locator('..').locator('p, h1').textContent({ timeout: tiempoEspera });
                    if (!modalidadInfo) {
                        modalidadInfo = 'N/A';
                    }
                } catch (error) {
                    console.error(`Error al extraer la modalidad para la carrera "${nombre}" en ${enlace}: No se encontró el selector 'span.fa-video' en ${tiempoEspera / 1000} segundos.`);
                    modalidadInfo = 'N/A'; // Valor por defecto
                }

                // Extraer la descripción de la carrera

                try {
                    const descripciones = await page.locator('div.vc_col-sm-8 div.wpb_text_column p').allTextContents({ timeout: tiempoEspera })
                    descripcion = descripciones.join('\n').trim(); 
                    if (!descripcion) {
                        descripcion = 'N/A';
                    }
                } catch (error) {
                    console.error(`Error al extraer la descripción para la carrera "${nombre}" en ${enlace}: No se encontró el selector 'div.wpb_text_column p' en ${tiempoEspera / 1000} segundos.`);
                    descripcion = 'N/A'; // Valor por defecto
                }

                // // Extraer los objetivos, misión y visión de la carrera

                try {
                    // localizar el div con 'data-vc-full-width="true"' para limitar la búsqueda a ese bloque
                    const objetivosTextos = await page.locator('div[data-vc-full-width="true"] .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    objetivos = objetivosTextos.join('\n').trim();
                    if (!objetivos) {
                        objetivos = 'N/A';
                    }
                } catch (error) {
                    console.error(`error al extraer los objetivos para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    objetivos = 'N/A'; // valor por defecto
                }

                // extraer la sección de por qué estudiar la carrera

                try {
                    // localizar el div con el h2 que contiene el texto específico "¿por qué estudiar educación inicial?"
                    const porqueEstudiarTextos = await page.locator('h2:has-text("¿Por qué estudiar") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    porqueEstudiar = porqueEstudiarTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!porqueEstudiar) {
                        porqueEstudiar = 'N/A';
                    }

                } catch (error) {
                    console.error(`error al extraer la sección de "¿por qué estudiar?" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    porqueEstudiar = 'N/A'; // valor por defecto en caso de error
                }

                // extraer la sección de autoridades

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
                } catch (error) {
                    console.error(`Error al extraer la sección de autoridades: ${error.message}`);
                    autoridades = 'N/A'; // valor por defecto en caso de error
                }

                try {
                    // localizar el div con el h2 que contiene el texto específico "Perfil de ingreso"
                    const perfilIngresoTextos = await page.locator('h2:has-text("Perfil de ingreso") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    perfilIngreso = perfilIngresoTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!perfilIngreso) {
                        perfilIngreso = 'N/A';
                    }

                } catch (error) {
                    console.error(`Error al extraer la sección de "perfil de ingreso" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    perfilIngreso = 'N/A'; // valor por defecto en caso de error
                }


                try {
                    // localizar el div con el h2 que contiene el texto específico "Perfil de egreso"
                    const perfilEgresoTextos = await page.locator('h2:has-text("Perfil de egreso") + .gt3_spacing + .wpb_text_column .wpb_wrapper, h2:has-text("Perfil de egreso del profesional en Educación Especial") + .gt3_spacing + .wpb_text_column .wpb_wrapper').allTextContents({ timeout: tiempoEspera });
                    
                    // unir todos los textos encontrados con un salto de línea entre ellos
                    perfilEgreso = perfilEgresoTextos.join('\n').trim();

                    // si el texto extraído está vacío, asignar 'N/A'
                    if (!perfilEgreso) {
                        perfilEgreso = 'N/A';
                    }

                } catch (error) {
                    console.error(`Error al extraer la sección de "perfil de egreso" para la carrera "${nombre}" en ${enlace}: ${error.message}`);
                    perfilEgreso = 'N/A'; // valor por defecto en caso de error
                }

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
                    modalidad: modalidadInfo.trim(),
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

    async function informacionInstitucional() {
        const principalPage = 'https://www.unemi.edu.ec/';
        const autoritiesPage = 'https://www.unemi.edu.ec/index.php/autoridades-principales/';
        const historyPage = 'https://www.unemi.edu.ec/index.php/historia/'
        
        const datosInstitucionales = {
            numeroEstudiantes: 'N/A',
            numeroCarreras: 'N/A',
            direccion: 'N/A',
            codigoPostal: 'N/A',
            autoridadesPrincipales: [],
            historia: 'N/A' // Inicializamos como un arreglo
        };
    
        try {
            // Navegar a la página institucional
            await page.goto(principalPage, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
            // Extraer el número de estudiantes
            try {
                const estudiantesElement = await page.locator('div.stat_count_wrapper:has-text("Estudiantes") .count_value');
                datosInstitucionales.numeroEstudiantes = await estudiantesElement.textContent({ timeout: 5000 });
                datosInstitucionales.numeroEstudiantes = datosInstitucionales.numeroEstudiantes.trim();
            } catch (error) {
                console.error(`Error al extraer el número de estudiantes: ${error.message}`);
            }
    
            // Extraer el número de carreras
            try {
                const carrerasElement = await page.locator('div.stat_count_wrapper:has-text("Carreras") .count_value');
                datosInstitucionales.numeroCarreras = await carrerasElement.textContent({ timeout: 5000 });
                datosInstitucionales.numeroCarreras = datosInstitucionales.numeroCarreras.trim();
            } catch (error) {
                console.error(`Error al extraer el número de carreras: ${error.message}`);
            }
    
            // Extraer la dirección de la universidad
            try {
                const direccionElement = await page.locator('div.gt3_widget.widget_text .textwidget a[href^="https://goo.gl/maps"]');
                datosInstitucionales.direccion = await direccionElement.textContent({ timeout: 5000 });
                datosInstitucionales.direccion = datosInstitucionales.direccion.trim();
            } catch (error) {
                console.error(`Error al extraer la dirección: ${error.message}`);
            }
    
            // Extraer el código postal
            try {
                const codigoPostalElement = await page.locator('div.gt3_widget.widget_text .textwidget strong:has-text("Código Postal") + span');
                datosInstitucionales.codigoPostal = await codigoPostalElement.textContent({ timeout: 5000 });
                datosInstitucionales.codigoPostal = datosInstitucionales.codigoPostal.trim();
            } catch (error) {
                console.error(`Error al extraer el código postal: ${error.message}`);
            }
    
            // Navegar a la página de autoridades
            try {
                await page.goto(autoritiesPage, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
                // Extraer la lista de autoridades
                const items = await page.locator('li.item-team-member.autoridades-principales');
    
                for (let i = 0; i < await items.count(); i++) {
                    const nombre = await items.nth(i).locator('h3 a').textContent();
                    const cargo = await items.nth(i).locator('.team-positions span').textContent();
                    datosInstitucionales.autoridadesPrincipales.push({ nombre: nombre.trim(), cargo: cargo.trim() });
                }
    
            } catch (error) {
                console.error(`Error al extraer las autoridades principales: ${error.message}`);
            }

            // Extraer la historia de la universidad
            try {
                await page.goto(historyPage, { waitUntil: 'domcontentloaded', timeout: 60000 });

                const historiaElement = await page.locator('div.wpb_text_column.wpb_content_element > div.wpb_wrapper');
                datosInstitucionales.historia = await historiaElement.textContent({ timeout: 5000 });
                datosInstitucionales.historia = datosInstitucionales.historia.trim();
            } catch (error) {
                console.error(`Error al extraer la historia de la universidad: ${error.message}`);
            }

            // Guardar los datos en un archivo JSON
            try {
                await fs.writeFile('informacion_institucional.json', JSON.stringify(datosInstitucionales, null, 2));
                console.log('Información institucional guardada en "informacion_institucional.json".');
            } catch (error) {
                console.error(`Error al guardar la información institucional: ${error.message}`);
            }
    
        } catch (error) {
            console.error(`Error al navegar a la página institucional: ${error.message}`);
        }
    }
    
    

    // Ejecutar la función y obtener las carreras actualizadas y desactualizadas

    // Aquí podrías usar `carrerasActualizadas` para continuar con la extracción de información
    // console.log(`Número de carreras actualizadas: ${todasCarreras.length}`);

    // Llamar a la función para extraer la información de las carreras actualizadas
    const { todasCarreras} = await unificarCarreras();

    await extraerInformacionCarreras(todasCarreras);
    await informacionInstitucional();

    await browser.close();
})();
