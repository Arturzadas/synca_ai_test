type Pokemon = {
  name: string;
  sprite: string;
  weight: number;
  height: number;
  base_experience: number;
};

export const PokemonCard = ({
  pokemon,
  onVote,
  disabled,
  votes,
}: {
  pokemon: Pokemon;
  onVote: () => void;
  disabled: boolean;
  votes: number;
}) => (
  <div className="p-4 border rounded text-center">
    <img src={pokemon.sprite} alt={pokemon.name} className="mx-auto" />
    <h2 className="font-bold">{pokemon.name}</h2>
    <p>Weight: {pokemon.weight}</p>
    <p>Height: {pokemon.height}</p>
    <p>Base Exp: {pokemon.base_experience}</p>
    <button
      onClick={onVote}
      disabled={disabled}
      className="mt-2 py-1 px-3 bg-blue-500 text-white rounded disabled:bg-gray-300"
    >
      Vote
    </button>
    <p className="mt-1 font-bold">Votes: {votes}</p>
  </div>
);
