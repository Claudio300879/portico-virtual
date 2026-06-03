// Conexión directa con tu API de Google Sheets
const API_URL = "https://script.google.com/macros/s/AKfycbxi-xZv-PnSC3qIsLtSwNcCLSKSWL5niWHpOj6QAb63dY1Yv-XSj1QbaLMLGTZCWU1kHw/exec";

let datosLotes = []; 

async function cargarDatos() {
    try {
        const respuesta = await fetch(API_URL);
        const data = await respuesta.json();

        const config = {};
        
        // Buscamos la sección de configuración de forma flexible
        const configData = data.configuracion || data.Configuracion || data.config || [];
        
        if (Array.isArray(configData)) {
            configData.forEach(item => {
                // Buscamos la columna de la izquierda (Clave / clave) y la de la derecha (Valor / valor)
                const claveOriginal = item.Clave || item.clave || item.CLAVE || '';
                const valorOriginal = item.Valor || item.valor || item.VALOR || '';
                
                if (claveOriginal) {
                    // Limpiamos espacios y pasamos a minúsculas para que combine siempre
                    const claveLimpia = claveOriginal.toString().trim().toLowerCase();
                    config[claveLimpia] = valorOriginal;
                }
            });
        }

        // 1. Inyectar datos dinámicos en el HTML (usando nombres en minúsculas)
        const barrioNombre = document.getElementById('barrio-nombre');
        if (barrioNombre) {
            barrioNombre.innerText = config['nombre_barrio'] || 'Urbanización Ruta 36';
        }

        const infoHorario = document.getElementById('info-horario');
        if (infoHorario) {
            infoHorario.innerText = config['horario_ingreso_obras'] || '';
        }

        const linkGuardia = document.getElementById('link-guardia');
        if (linkGuardia && config['telefono_guardia']) {
            linkGuardia.href = `tel:${config['telefono_guardia'].toString().replace(/\s+/g, '')}`;
        }

        const linkReglamento = document.getElementById('link-reglamento');
        if (linkReglamento) {
            linkReglamento.href = config['reglamento'] || '#';
        }

        // 2. Mostrar alerta importante
        const alerta = document.getElementById('alerta-importante');
        if (alerta) {
            const textoAviso = config['aviso_importante'] || config['aviso_important'] || '';
            if (textoAviso) {
                alerta.innerText = textoAviso;
                alerta.style.display = 'block';
            } else {
                alerta.style.display = 'none';
            }
        }

        // 3. Guardar la lista de lotes para el buscador
        const listaLotes = data.lotes || data.Lotes || [];
        if (listaLotes) {
            datosLotes = listaLotes;
            renderizarLotes(datosLotes);
        }

    } catch (error) {
        console.error("Error al conectar con la API:", error);
        const barrioNombre = document.getElementById('barrio-nombre');
        if (barrioNombre) barrioNombre.innerText = "Error de conexión";
    }
}

function renderizarLotes(lista) {
    const contenedor = document.getElementById('resultados-lotes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="no-results">No se encontraron manzanas o calles.</p>';
        return;
    }

    lista.forEach(lote => {
        const div = document.createElement('div');
        div.className = 'tarjeta-lote';
        
        const mza = lote.Manzana || lote.manzana || lote.Mza || lote.mza || '';
        const calle = lote.Calle || lote.calle || '';
        const est = lote.Estado || lote.estado || 'Disponible';
        
        div.innerHTML = `
            <h4>${mza} - ${calle}</h4>
            <p><strong>Estado:</strong> ${est}</p>
        `;
        contenedor.appendChild(div);
    });
}

document.getElementById('search-input')?.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim();
    const filtrados = datosLotes.filter(lote => {
        const calle = (lote.Calle || lote.calle || '').toLowerCase();
        const manzana = (lote.Manzana || lote.manzana || lote.Mza || lote.mza || '').toLowerCase();
        return calle.includes(termino) || manzana.includes(termino);
    });
    renderizarLotes(filtrados);
});

document.addEventListener('DOMContentLoaded', cargarDatos);
