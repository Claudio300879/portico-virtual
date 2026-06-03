function renderizarLotes(lista) {
    const contenedor = document.getElementById('resultados-lotes');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    // Si no hay nada escrito o la lista está vacía, no mostramos nada
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
            ${rutaUrl ? `<a href="${rutaUrl}" target="_blank" class="btn-ruta" style="background-color: #007bff; color: white; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 5px;">🗺️ Ver Ruta</a>` : ''}
        `;
        contenedor.appendChild(div);
    });
}

function ejecutarBusqueda() {
    const input = document.getElementById('search-input');
    const termino = input ? input.value.toLowerCase().trim() : '';
    
    // Si borró el texto, limpiamos la pantalla
    if (termino === '') {
        renderizarLotes([]);
        return;
    }

    // Filtramos sobre el array global de datos que viene de Google Sheets
    const filtrados = datosLotes.filter(lote => {
        const calleLote = (lote.Calle || '').toLowerCase();
        const mzaLote = (lote.Manzana || '').toLowerCase();
        return calleLote.includes(termino) || mzaLote.includes(termino);
    });
    
    renderizarLotes(filtrados);

    // Si le dio a Enter y hay una coincidencia exacta única, abre la ruta directo
    if (filtrados.length === 1 && filtrados[0].Ruta) {
        window.open(filtrados[0].Ruta, '_blank');
    }
}

// Escuchadores globales
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const botonLupa = document.getElementById('search-button');

    // Busca automáticamente mientras escribe
    input?.addEventListener('input', ejecutarBusqueda);
    
    // Busca al presionar Enter
    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ejecutarBusqueda();
        }
    });

    // Busca al hacer clic en la lupa
    botonLupa?.addEventListener('click', ejecutarBusqueda);
});
