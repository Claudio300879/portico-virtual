// COMPLETÁ ACÁ: Pegá tu URL de Google Apps Script entre las comillas (la que termina en /exec)
const URL_API = "https://script.google.com/macros/s/AKfycbyYMbGl-Ia3sWz52wblMt-yrq5xsitScRlNZETcQ1R4ZOEExuRAU4x5lh81kJ1zoXSEQg/exec"; 

let datosLotes = []; // Array global para guardar los lotes del croquis

async function cargarDatos() {
    try {
        const respuesta = await fetch(URL_API);
        const datos = await respuesta.json();
        
        console.log("Datos recibidos de Google:", datos);

        // 1. PROCESAR CONFIGURACIÓN
        if (datos.configuracion && datos.configuracion.length > 0) {
            datos.configuracion.forEach(item => {
                let clave = item.Clave ? item.Clave.toLowerCase().trim() : "";
                const valor = item.Valor ? item.Valor.trim() : "";

                if (clave.includes("nombre") || clave.includes("barrio")) {
                    const el = document.getElementById('nombre-barrio');
                    if (el) el.innerText = valor;
                }
                if (clave.includes("telefono") || clave.includes("guardia")) {
                    const el = document.getElementById('btn-llamar');
                    if (el && valor) el.href = `tel:${valor.replace(/\s+/g, '')}`;
                }
                if (clave === "reglamento") { 
                    const el = document.getElementById('btn-reglamento');
                    if (el && valor) el.href = valor;
                }
                if (clave.includes("horario")) { 
                    const el = document.getElementById('horario-ingreso');
                    if (el) el.innerHTML = `<strong>Horario de ingreso:</strong> ${valor}`;
                }
                if (clave.includes("aviso") || clave.includes("importante")) {
                    const elAlerta = document.getElementById('alerta-aviso');
                    const elTexto = document.getElementById('texto-aviso');
                    if (elAlerta && elTexto && valor) {
                        elTexto.innerText = valor;
                        elAlerta.style.display = 'block';
                    }
                }
            });
        }

        // 2. PROCESAR Y GUARDAR LOTES
        if (datos.lotes && datos.lotes.length > 0) {
            datosLotes = datos.lotes;
            console.log("Lotes cargados exitosamente:", datosLotes.length);
        }

    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
        const elBarrio = document.getElementById('nombre-barrio');
        if (elBarrio) elBarrio.innerText = "Urbanización Potreros de Quijano";
        const elHorario = document.getElementById('horario-ingreso');
        if (elHorario) elHorario.innerHTML = "<strong>Horario de ingreso:</strong> No disponible.";
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
        
        // Tolerancia a mayúsculas/minúsculas de las propiedades del Sheets
        const mza = lote.Manzana || lote.manzana || '';
        const calle = lote.Calle || lote.calle || '';
        const est = lote.Estado || lote.estado || 'Disponible';
        const rutaUrl = lote.Ruta || lote.ruta || '';
        
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

    // Filtramos soportando propiedades tanto en mayúsculas como en minúsculas
    const filtrados = datosLotes.filter(lote => {
        const calleLote = (lote.Calle || lote.calle || '').toLowerCase();
        const mzaLote = (lote.Manzana || lote.manzana || '').toLowerCase();
        return calleLote.includes(termino) || mzaLote.includes(termino);
    });
    
    renderizarLotes(filtrados);

    // Si hay un único resultado y presionan Enter, abre la ruta de Google Maps
    if (filtrados.length === 1) {
        const r = filtrados[0].Ruta || filtrados[0].ruta;
        if (r && r !== "https://maps.google.com/") {
            window.open(r, '_blank');
        }
    }
}

// Inicialización de escuchadores globales
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();

    const input = document.getElementById('search-input');
    const botonLupa = document.getElementById('search-button');

    // Escucha en tiempo real mientras se escribe
    input?.addEventListener('input', ejecutarBusqueda);
    
    // Escucha la tecla Enter
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    // Escucha el clic en el botón de la lupa
    botonLupa?.addEventListener('click', ejecutarBusqueda);
});
