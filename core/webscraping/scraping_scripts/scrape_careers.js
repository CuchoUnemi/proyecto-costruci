const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Función para extraer carreras y generar archivo JSON para la modalidad presencial
    async function extraerCarrerasPresencial() {
        try {
            const url = 'https://www.unemi.edu.ec/index.php/carreras-presencial/';
            const selectorCarreras = '.vc_row .vc_inner .wpb_column .wpb_text_column'; // Ajustar el selector adecuado

            // Navegar a la página de modalidad presencial
            await page.goto(url);
            
            // Esperar a que el contenedor de carreras esté visible
            await page.waitForSelector(selectorCarreras);

            // Extraer todas las carreras con sus enlaces, solo seleccionando la primera etiqueta <a> dentro de cada <li>
            const carreras = await page.$$eval(`${selectorCarreras} ul.gt3_list_check_circle li`, items => {
                return items.map(li => {
                    const link = li.querySelector('a'); // Seleccionar solo la primera etiqueta <a>
                    return link ? {
                        nombre: link.textContent.trim(),
                        enlace: link.href,
                        modalidad: 'Presencial'
                    } : null;
                }).filter(carrera => carrera !== null); // Filtrar elementos nulos
            });

            // Verificar si se obtuvieron carreras
            if (carreras.length === 0) {
                throw new Error('No se encontraron carreras en la página de modalidad presencial.');
            }

            // Guardar la información en un archivo JSON
            const fileName = 'core/webscraping/scraping_scripts/carreras_presencial.json';
            fs.writeFileSync(fileName, JSON.stringify(carreras, null, 2));
            console.log(`Datos guardados en carreras_presencial.json`);
        } catch (error) {
            console.error(`Error al extraer carreras de la modalidad presencial: ${error.message}`);
        }
    }

    // Función para extraer carreras de la modalidad semipresencial
    async function extraerCarrerasSemipresencial() {
        try {
            // Navegar a la página de carreras semipresencial
            await page.goto('https://www.unemi.edu.ec/index.php/carreras-semipresencial/');

            // Esperar que el contenedor principal de las carreras esté visible
            await page.waitForSelector('.vc_row.vc_row-fluid');

            // Extraer los nombres de las carreras y sus enlaces
            const carreras = await page.$$eval('.vc_column_container.vc_col-sm-4', containers => {
                return containers.map(container => {
                    const nombreCarrera = container.querySelector('h2')?.textContent.trim() || null;
                    const enlaceCarrera = container.querySelector('a')?.href || null;

                    if (nombreCarrera && enlaceCarrera) {
                        return {
                            nombre: nombreCarrera,
                            enlace: enlaceCarrera,
                            modalidad: 'Semipresencial'
                        };
                    }
                }).filter(Boolean); // Filtrar los valores nulos o no definidos
            });

            if (carreras.length === 0) {
                throw new Error('No se encontraron carreras en la página de modalidad semipresencial.');
            }

            // Guardar los datos en un archivo JSON
            fs.writeFileSync('core/webscraping/scraping_scripts/carreras_semipresencial.json', JSON.stringify(carreras, null, 2));
            console.log('Datos guardados en carreras_semipresencial.json');
        } catch (error) {
            console.error('Error al extraer carreras de modalidad semipresencial:', error);
        }
    }

    async function extraerCarrerasEnLinea() {
        try {
            // Navegar a la página de carreras en línea
            await page.goto('https://www.unemi.edu.ec/index.php/carreras-en-linea/');
    
            // Esperar que el contenedor principal esté visible
            await page.waitForSelector('#main_content > section.vc_section.vc_custom_1703624691505.vc_section-has-fill');
    
            // Extraer los nombres de las carreras, modalidad, duración, titulación y sus enlaces dentro del selector específico
            const carrerasEnLinea = await page.$$eval('#main_content > section.vc_section.vc_custom_1703624691505.vc_section-has-fill .vc_column_container.vc_col-sm-4', containers => {
                return containers.map(container => {
                    const nombreCarrera = container.querySelector('h2')?.textContent.trim() || null;
                    const enlaceCarrera = container.querySelector('a')?.href || null;
                    if (nombreCarrera && enlaceCarrera) {
                        return {
                            nombre: nombreCarrera,
                            enlace: enlaceCarrera,
                            modalidad: 'En Línea'
                        };
                    }
                }).filter(Boolean); // Filtrar los valores nulos o no definidos
            });
    
            if (carrerasEnLinea.length === 0) {
                throw new Error('No se encontraron carreras en la página de modalidad en línea.');
            }

            // Guardar los datos en un archivo JSON
            fs.writeFileSync('core/webscraping/scraping_scripts/carreras_en_linea.json', JSON.stringify(carrerasEnLinea, null, 2));
            console.log('Datos guardados en carreras_en_linea.json');
        } catch (error) {
            console.error('Error al extraer carreras de modalidad en línea:', error);
        }
    }

    // Llamar a la función de la modalidad presencial
    await extraerCarrerasPresencial();
    await extraerCarrerasSemipresencial();
    await extraerCarrerasEnLinea();

    await browser.close();
})();
