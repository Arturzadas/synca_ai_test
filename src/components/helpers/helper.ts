export const fetchPokemon = async (id: number | string) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default,
    weight: data.weight,
    height: data.height,
    base_experience: data.base_experience,
    types: data.types?.map((t: any) => t.type.name) || [],
    abilities: data.abilities?.map((a: any) => a.ability.name) || [],
  };
};
