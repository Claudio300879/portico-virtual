// Conexión directa con tu API de Google Sheets
const API_URL = "https://script.google.com/macros/s/AKfycbxakF-OVT8cu5w5FIS_bidraVzLt1utf85nzEyghkIQ4P0c8IXCLgpqAsjyyMm0b7oGkw/exec";

let datosLotes = []; // Matriz donde guardaremos las manzanas para el buscador

// Función principal para traer los datos mediante FETCH y JSON
async function cargarDatos() {
    try {
        const respuesta = await fetch(API_URL);
        const data = await respuesta.json();

        // Convertimos tu lista vertical (Clave y Valor) en un objeto fácil de leer
        const config = {};
        if (data.configuracion && Array.isArray(data.configuracion)) {
            data.configuracion.forEach(item => {
                if (item.Clave) {
                    config[item.Clave.trim()] = item.Valor;
                }
            });
        }

        // 1. Inyectar datos de la configuración vertical en el HTML
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
            linkGuardia.href = `tel:${config['telefono_guardia'].replace(/\s+/g, '')}`;
        }

        const linkReglamento = document.getElementById('link-reglamento');
        if (linkReglamento) {
            linkReglamento.href = config['Reglamento'] || '#';
        }

        // 2. Mostrar alerta importante (ej: restricción de camiones por lluvia)
        const alerta = document.getElementById('alerta-importante');
        if (alerta) {
            const textoAviso = config['aviso_importante'] || config['aviso_important'] || '';
            if (textoAviso) {
                alerta.innerText = textoAviso;
                alerta.style.display = 'block'; // Muestra el cartel si hay texto
            } else {
                alerta.style.display = 'none'; // Lo oculta si está vacío
            }
        }

        // 3. Guardar la lista de lotes para el buscador dinámico
        if (data.lotes) {
            datosLotes = data.lotes;
            renderizarLotes(datosLotes);
        }

    } catch (error) {
        console.error("Error al conectar con la API:", error);
        const banner = document.getElementById('status-banner');
        if (banner) {
            banner.innerText = "Error al cargar datos del servidor";
            banner.style.display = 'block';
        }
    }
}

// Función para mostrar los lotes en pantalla al buscar
function renderizarLotes(lista) {
    const contenedor = document.getElementById('resultados-lotes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="no-results">No se encontraron manzanas o calles con ese nombre.</p>';
        return;
    }

    lista.forEach(lote => {
        const div = document.createElement('div');
        div.className = 'tarjeta-lote';
        div.innerHTML = `
            <h4>${lote.Manzana || lote.manzana || ''} - ${lote.Calle || lote.calle || ''}</h4>
            <p><strong>Estado:</strong> ${lote.Estado || lote.estado || 'Disponible'}</p>
        `;
        contenedor.appendChild(div);
    });
}

// Escuchar lo que escribe el usuario en la barra de búsqueda
document.getElementById('search-input')?.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase().trim();
    const filtrados = datosLotes.filter(lote => {
        const calle = (lote.Calle || lote.calle || '').toLowerCase();
        const manzana = (lote.Manzana || lote.manzana || '').toLowerCase();
        return calle.includes(termino) || manzana.includes(termino);
    });
    renderizarLotes(filtrados);
});

// Iniciar la carga al abrir la página
document.addEventListener('DOMContentLoaded', cargarDatos);
