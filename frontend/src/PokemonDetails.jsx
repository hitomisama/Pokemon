import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./PokemonDetails.css";

const API_URL = "https://pokeapi.co/api/v2";

function PokemonDetails() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]); // 存储进化链数据

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        // **1. 获取基本 Pokémon 详情**
        const response = await fetch(`${API_URL}/pokemon/${name}`);
        const pokemonData = await response.json();

        // **2. 获取 species 数据**
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();

        // **3. 获取 evolution_chain.url 并请求进化链**
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        const parsedEvolutionChain = parseEvolutionChain(evolutionData.chain);

        setPokemon(pokemonData);
        setEvolutionChain(parsedEvolutionChain); // 存储进化链数据
      } catch (error) {
        console.error(`❌ Failed to fetch ${name}:`, error);
      }
    };

    fetchPokemonData();
  }, [name]);

  // **解析进化链**
  const parseEvolutionChain = (chain) => {
    let chainList = [];
    let currentStage = chain;

    while (currentStage) {
      chainList.push(currentStage.species.name);
      if (currentStage.evolves_to.length > 0) {
        currentStage = currentStage.evolves_to[0]; // 只取第一条进化路径
      } else {
        break;
      }
    }

    return chainList;
  };

  if (!pokemon) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pokemon-details-container">
      <h1>{pokemon.name}</h1>
      <p>Dex Number: {pokemon.id}</p>
      <p>
        Type:
        {pokemon.types.map((item, key) => (
          <span key={key}>{item.type.name}{key < pokemon.types.length - 1 ? ", " : ""}</span>
        ))}
      </p>

      <p>Height: {pokemon.height / 10} m</p>
      <p>Weight: {pokemon.weight / 10} kg</p>
      <p>
        Abilities:{" "}
        {pokemon.abilities.map((item, key) => (
          <span key={key}>{item.ability.name}{key < pokemon.abilities.length - 1 ? ", " : ""}</span>
        ))}
      </p>

      <img src={pokemon.sprites?.front_default} alt={pokemon.name} />

      {/* 🔹 显示进化链 */}
      <div className="evolution-section">
        <h2>Evolution Chain</h2>
        <div className="evolution-chain">
          {evolutionChain.length > 0 ? (
            evolutionChain.map((evo, index) => (
              <span key={index} className="evolution-item">
                {evo}
                {index !== evolutionChain.length - 1 && " → "}
              </span>
            ))
          ) : (
            <p>No evolution available</p>
          )}
        </div>
      </div>
      
      <Link to="/" className="back-button">
        Back to Search
      </Link>
    </div>
  );
}

export default PokemonDetails;