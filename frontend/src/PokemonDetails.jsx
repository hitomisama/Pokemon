import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./PokemonDetails.css";

const API_URL = "https://pokeapi.co/api/v2";

function PokemonDetails() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => setPokemon(data))
      .catch((error) => console.error(`❌ Failed to fetch ${name}:`, error));
  }, [name]);

  if (!pokemon) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pokemon-details-container">
      <h1>{pokemon.name}</h1>
      <p>Dex Number: {pokemon.id}</p>
      <p>
        Type:
        {pokemon.types.map((iteam, key) => (
          <span key={key}>{iteam.type.name}</span>
        ))}
      </p>

      <p>Height: {pokemon.height / 10} m</p>
      <p>Weight: {pokemon.weight / 10} kg</p>
      <p>Abilities: 
        {pokemon.abilities.map((item,key)=>(
          <p key={key}>
            {item.ability.name}
          </p>
        ))}
      </p>
      {/* 方案一 */}
      {/* <p>
        Type:{selectedPokemon.types.map((iteam) => iteam.type.name).join(",")}
        把原始对象数组转换成字符串数组，用jion
      </p> */}
      {/* 方案二 */}
      {/* <p>
        Type:
        {selectedPokemon.types.map((iteam, key) => (
          <span key={key}>{iteam.type.name}</span>
        ))}
      </p> */}
      <img src={pokemon.sprites?.front_default} alt={pokemon.name} />

      {/* 🔹 显示进化链 */}
      <div className="evolution-section">
        <h2>Evolution Chain</h2>
        <div className="evolution-chain">
          {pokemon.evolutionChain?.length > 0 ? (
            pokemon.evolutionChain.map((evo, index) => (
              <span key={index} className="evolution-item">
                {evo}
                {index !== pokemon.evolutionChain.length - 1 && " → "}
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
