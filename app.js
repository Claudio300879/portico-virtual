// COMPLETÁ ACÁ: Pegá tu URL de Google Apps Script entre las comillas (la que termina en /exec)
const URL_API = "TU_URL_DE_APPS_SCRIPT_AQUÍ"; 

let datosLotes = []; // Array global para guardar los lotes del croquis

async function cargarDatos() {
    try {
        const respuesta = await fetch(URL_API);
        const datos = await respuesta.json();
        
        console.log("Datos recibidos de Google:", datos);

        // 1. PROCESAR CONFIGURACIÓN
        if (datos.configuracion && datos.configuracion.length > 0) {
            datos.configuracion.forEach(item => {
                const clave = item.Clave ? item.Clave.toLowerCase().trim() : "";
                const valor = item.Valor ? item.Valor.trim() : "";

                if (clave === "nombre_barrio" || clave === "nombre") {
                    const el = document.getElementById('nombre-barrio');
                    if (el) el.innerText = valor;
                }
                if (clave === "telefono_guardia" || clave === "telefono") {
                    const el = document.getElementById('btn-llamar');
                    if (el && valor) el.href = `tel:${valor.replace(/\s+/g, '')}`;
                }
                if (clave === "link_reglamento" || clave === "reglamento") {
                    const el = document.getElementById('btn-reglamento');
                    if (el && valor) el.href = valor;
                }
                if (clave === "horario_ingreso" || clave === "horario") {
                    const el = document.getElementById('horario-ingreso');
                    if (el) el.innerHTML = `<strong>Horario de ingreso:</strong> ${valor}`;
                }
                if (clave === "aviso_importante" || clave === "aviso") {
                    const elAlerta = document.getElementById('alerta-aviso');
                    const elTexto = document.getElementById('texto-aviso');
                    if (elAlerta && elTexto && valor) {
                        elTexto.innerText = valor;
                        elAlerta.style.display = 'block';
                    }
                }
            });
        }

        // 2. PROCESAR Y GUARDAR LOTES EN LA VARIABLE GLOBAL
        if (datos.lotes) {
            datosLotes = datos.lotes;
        }

    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
        // Salvavidas por si falla la conexión
        const elBarrio = document.getElementById('nombre-barrio');
        if (elBarrio) elBarrio.innerText = "Urbanización Potreros de Quijano";
        const elHorario = document.getElementById('horario-ingreso');
        if (elHorario) elHorario.innerHTML = "<strong>Horario de ingreso:</strong> No disponible por el momento.";
    }
}

function renderizarLotes(lista) {
    const contenedor = document.getElementById('resultados-lotes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (!lista || lista.length === 0) {
        return;
    }

    lista.forEach(lote => {
        const div = document.createElement('div');
        div.className = 'tarjeta-lote';
        
        const mza = lote.Manzana || '';
        const calle = lote.Calle || '';
        const est = lote.Estado || 'Disponible';
        const rutaUrl = lote.Ruta || '';
        
        div.innerHTML = `
            <div style="text-align: left;">
                <h4 style="margin:0 0 5px 0; color: #1a365d;">${mza}</h4>
                <p style="margin:0; font-size:14px; color: #4a5568;"><strong>Ubicación:</strong> ${calle}</p>
                <p style="margin:0; font-size:14px; color: #4a5568;"><strong>Estado:</strong> ${est}</p>
            </div>
            ${rutaUrl && rutaUrl !== "https://maps.google.com/" ? 
                `<a href="${rutaUrl}" target="_blank" class="btn-ruta" style="background-color: #007bff; color: white; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">🗺️ Ver Ruta</a>` 
                : ''
            }
        `;
        contenedor.appendChild(div);
    });
}

function ejecutarBusqueda() {
    const input = document.getElementById('search-input');
    const termino = input ? input.value.toLowerCase().trim() : '';
    
    if (termino === '') {
        renderizarLotes([]);
        return;
    }

    const filtrados = datosLotes.filter(lote => {
        const calleLote = (lote.Calle || '').toLowerCase();
        const mzaLote = (lote.Manzana || '').toLowerCase();
        return calleLote.includes(termino) || mzaLote.includes(termino);
    });
    
    renderizarLotes(filtrados);

    // Si da Enter con un solo resultado válido, abre su mapa
    if (filtrados.length === 1 && filtrados[0].Ruta && filtrados[0].Ruta !== "https://maps.google.com/") {
        window.open(filtrados[0].Ruta, '_blank');
    }
}

// Escuchadores al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Disparar la carga inicial de datos desde Google
    cargarDatos();

    const input = document.getElementById('search-input');
    const botonLupa = document.getElementById('search-button');

    input?.addEventListener('input', ejecutarBusqueda);
    
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    botonLupa?.addEventListener('click', ejecutarBusqueda);
});
