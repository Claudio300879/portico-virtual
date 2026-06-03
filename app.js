// Conexión directa con tu API de Google Sheets
const API_URL = "PEGAR_ACA_TU_URL_DE_APPS_SCRIPT";

let datosLotes = []; // Matriz donde guardaremos las manzanas para el buscador

// Función principal para traer los datos mediante FETCH y JSON
async function cargarDatos() {
    try {
        const respuesta = await fetch(API_URL);
        const data = await respuesta.json();
        
        // 1. Inyectar datos de la pestaña 'Configuracion' en el HTML
        document.getElementById('barrio-nombre').innerText = data.configuracion.nombre_barrio;
        document.getElementById('info-horario').innerText = data.configuracion.horario_ingreso_obras;
        document.getElementById('link-guardia').href = `tel:${data.configuracion.telefono_guardia}`;
        document.getElementById('link-reglamento').href = data.configuracion.reglamento_pdf;
        
        // Mostrar alerta importante si el administrador escribió algo
        if (data.configuracion.aviso_importante) {
            const alerta = document.getElementById('aviso-alerta');
            alerta.innerText = data.configuracion.aviso_importante;
            alerta.style.display = 'block';
        }
        
        // 2. Guardar el array de lotes para el buscador dinámico
        datosLotes = data.lotes;
        
    } catch (error) {
        console.error("Error al conectar con la API de Google Sheets:", error);
        document.getElementById('barrio-nombre').innerText = "Error al cargar datos del servidor";
    }
}

// Lógica de filtrado en tiempo real para el buscador
document.getElementById('buscador').addEventListener('input', function(e) {
    const busqueda = e.target.value.trim().toLowerCase();
    const tarjetaResultado = document.getElementById('resultado');
    
    // Si el buscador está vacío, escondemos la tarjeta de información
    if (busqueda === "") {
        tarjetaResultado.style.display = 'none';
        return;
    }
    
    // Filtramos el JSON buscando coincidencias exactas o parciales por Manzana o Calle
    const encontrado = datosLotes.find(item => 
        item.Manzana.toString().toLowerCase() === busqueda || 
        item.Manzana.toString().toLowerCase().includes(busqueda) ||
        item.Calle_Principal.toLowerCase().includes(busqueda)
    );
    
    // Si encontramos la manzana/calle, renderizamos los datos en caliente
    if (encontrado) {
        document.getElementById('res-mza').innerText = `Manzana ${encontrado.Manzana}`;
        document.getElementById('res-calle').innerText = encontrado.Calle_Principal;
        document.getElementById('res-ref').innerText = encontrado.Ubicacion_Referencia;
        
        const divEstado = document.getElementById('res-estado');
        divEstado.innerText = encontrado.Estado;
        
        // Cambiamos el estilo visual de la etiqueta según el estado de la obra
        divEstado.className = 'status'; 
        if (encontrado.Estado.toLowerCase() === 'en obra') {
            divEstado.classList.add('status-obra');
        } else if (encontrado.Estado.toLowerCase() === 'consolidado') {
            divEstado.classList.add('status-listo');
        } else {
            divEstado.classList.add('status-vacio');
        }
        
        tarjetaResultado.style.display = 'block'; // Mostramos el bloque con los datos
    } else {
        tarjetaResultado.style.display = 'none'; // Si no hay coincidencias, se oculta
    }
});

// Inicializar la carga cuando el DOM esté completamente listo
window.addEventListener('DOMContentLoaded', cargarDatos);
