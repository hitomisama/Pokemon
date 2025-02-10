import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./PokemonDetails.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PokemonDetails() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => setPokemon(data))
      .catch((error) => console.error(`❌ Failed to fetch ${name}:`, error));
  }, [name]);

  if (!pokemon) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pokemon-details-container">
      <h1>{pokemon.originalName}</h1>
      <p>Dex Number: {pokemon.id}</p>
      <p>Type: {pokemon.types?.join(", ")}</p>
      <p>Height: {pokemon.height / 10} m</p>
      <p>Weight: {pokemon.weight / 10} kg</p>
      <p>Abilities: {pokemon.abilities?.join(", ")}</p>
      <img src={pokemon.sprites?.front_default} alt={pokemon.originalName} />

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
