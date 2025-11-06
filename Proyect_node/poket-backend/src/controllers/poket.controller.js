export const getPokemons = async(req, res) =>{
    try {
        const limit = parseInt(req.query.limit) || 15;
        const offset = parseInt(req.query.offset) || 0;
        const {name, id, type} = req.query;

        //Obteniendo la información base de un pokemón
        const fetchPokemon = async (identifier) => {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`);
            if(!response.ok) throw new Error('Pokemon no encontrado');
            const data = await response.json();
            return{
                id: data.id,
                name: data.name,
                // ruta correcta a las sprites en la PokeAPI
                sprite: data.sprites && data.sprites.other && data.sprites.other['official-artwork'] ? data.sprites.other['official-artwork'].front_default : (data.sprites ? data.sprites.front_default : ''),
                types: Array.isArray(data.types) ? data.types.map(t => t.type.name) : [],
                // Campos adicionales para detalle
                stats: Array.isArray(data.stats) ? data.stats.map(s => ({ name: s.stat.name, base: s.base_stat })) : [],
                abilities: Array.isArray(data.abilities) ? data.abilities.map(a => a.ability.name) : [],
                height: data.height || 0,
                weight: data.weight || 0
            };
        }
        //Filtro por id o por nombre
        if (id || name) {
            const query = id || name;
            const pokemon = await fetchPokemon(query);
            return res.json({ok: true, results: [pokemon]})
        }

        //Filtrar por tipo
        if(type){
            const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
            if (!typeRes.ok) throw new Error('Tipo no encontrado');
            const typeData = await typeRes.json();

            const pokemonsSlice = (typeData.pokemon || []).slice(offset, offset + limit);
            const results = await Promise.all(
                pokemonsSlice.map(p => fetchPokemon(p.pokemon.name))
            );

            return res.json({
                ok: true,
                total: (typeData.pokemon || []).length,
                offset,
                limit,
                results
            });
        }
        //Obteniendo los pokemons paginados
        const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const listData = await listRes.json();

        const results = await Promise.all(
            listData.results.map(p => fetchPokemon(p.name))
        )
        return res.json({
            ok: true,
            offset,
            limit,
            total: listData.count,
            next: listData.next,
            previous: listData.previous,
            results
        });
    } catch (error) {
        res.status(500).json({ok: false, message: error.message});
    }
}