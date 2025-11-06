const container = document.getElementById('pokemon-container');

//botones de pagina
const firsBtn = document.getElementById('first'); 
const prevBtn = document.getElementById('prev'); 
const nextBtn = document.getElementById('next'); 
const lastBtn = document.getElementById('last');

//Filtros
const nameInput  = document.getElementById('nameFilter');
const idInput  = document.getElementById('idFilter');
const typeSelec  = document.getElementById('typeFilter');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

let offset = 0;
const limit = 15;
let totalPokemons = 0;

async function getPokemons() {
    try {
    let url = `http://localhost:3000/api/pokemons?offset=${offset}&limit=${limit}`;

        // Validar inputs (usar .value en lugar de ariaValueMax)
        if (nameInput && nameInput.value && nameInput.value.trim()) url +=  `&name=${encodeURIComponent(nameInput.value.trim().toLowerCase())}`;
        if (idInput && idInput.value && idInput.value.trim()) url += `&id=${encodeURIComponent(idInput.value.trim())}`;
        if (typeSelec && typeSelec.value) url += `&type=${encodeURIComponent(typeSelec.value)}`;

        const res = await fetch(url);
        const data = await res.json();

        if(!data.ok) throw new Error('Error al obtener el pokemon');
        totalPokemons = data.total || 0;

        if (!container) {
            console.error('Contenedor de pokemons no encontrado. Verifica que el id en index.html sea "pokemon-container"');
            return;
        }

        container.innerHTML = '';

        // El backend devuelve `results` (ver poket-backend). Usar fallback a array vacío.
        (data.results || []).forEach(p => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-lg rounded-2xl p-4 text-center hover:scale-105 transform';
            card.innerHTML = `
                <img src="${p.sprite || ''}" class="mx-auto w-32 h-32">
                <h2 class="text-xl font-semibold capitalize mt-2">${p.name || ''}</h2>
                <p class="text-gray-600">Tipo: ${Array.isArray(p.types) ? p.types.join(', ') : (p.types || '')}</p>
            `;
            // Guardar nombre para la acción de detalle y añadir listener
            card.dataset.name = p.name || '';
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                fetchPokemonDetails(card.dataset.name);
            });

            container.appendChild(card);
        });

        //Funciones para detalle de pokemon
        async function fetchPokemonDetails(name) {
            if (!name) return;
            try {
                const url = `http://localhost:3000/api/pokemons?name=${encodeURIComponent(name)}`;
                const res = await fetch(url);
                const data = await res.json();
                if (!data.ok) throw new Error(data.message || 'No se pudo obtener detalle');
                const p = (data.results || [])[0];
                if (p) showPokemonModal(p);
            } catch (err) {
                console.error('Error al obtener detalle', err);
                alert('No se pudo obtener los detalles. Revisa la consola.');
            }
        }

        function showPokemonModal(p) {
            // Eliminar modal anterior si existe
            const existing = document.getElementById('pokemon-detail-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'pokemon-detail-modal';
            modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';

            const box = document.createElement('div');
            box.className = 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full';

            box.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="${p.sprite || ''}" alt="${p.name}" class="w-24 h-24 object-contain">
                    <div>
                        <h2 class="text-2xl font-bold capitalize">${p.name} <span class="text-gray-500">#${p.id}</span></h2>
                        <p class="text-sm text-gray-600">Tipos: ${Array.isArray(p.types) ? p.types.join(', ') : ''}</p>
                        <p class="text-sm text-gray-600">Altura: ${p.height} | Peso: ${p.weight}</p>
                        <p class="text-sm text-gray-600">Habilidades: ${Array.isArray(p.abilities) ? p.abilities.join(', ') : ''}</p>
                    </div>
                </div>
                <hr class="my-4">
                <div>
                    <h3 class="text-lg font-semibold mb-2">Stats</h3>
                    <div class="space-y-2">
                        ${Array.isArray(p.stats) ? p.stats.map(s => `
                            <div class="flex justify-between text-sm">
                                <span class="capitalize text-gray-700">${s.name}</span>
                                <span class="font-medium">${s.base}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
                <div class="mt-4 text-right">
                    <button id="close-pokemon-modal" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Cerrar</button>
                </div>
            `;

            modal.appendChild(box);
            document.body.appendChild(modal);

            // Cerrar al hacer click fuera del box
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            const closeBtn = document.getElementById('close-pokemon-modal');
            if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
        }

        // Deshabilitar/activar botones fuera del bucle
        prevBtn.disabled = offset === 0;
        nextBtn.disabled = offset + limit >= totalPokemons;
        firsBtn.disabled = offset === 0;
        lastBtn.disabled = offset + limit >= totalPokemons;
    } catch (error) {
        console.error('Error al obtener datos' + error);
    }
}

prevBtn.addEventListener('click', () =>{
    if(offset >= limit){
        offset -= limit;
        getPokemons();
    }
});

nextBtn.addEventListener('click', () =>{
    offset += limit;
    getPokemons();
});

firsBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

lastBtn.addEventListener('click', () => {
    //calculo offset para la ultima página
    offset = Math.floor((totalPokemons -1) / limit) * limit;
    getPokemons();
});

searchBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

clearBtn.addEventListener('click', () =>{
    if (nameInput) nameInput.value = '';
    if (idInput) idInput.value = '';
    if (typeSelec) typeSelec.value = '';
    offset = 0;
    getPokemons();
});

getPokemons();