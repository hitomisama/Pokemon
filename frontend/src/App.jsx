import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PokemonDetails from "./PokemonDetails";
import "./App.css";

const API_URL = "https://pokemon-back-pearl.vercel.app";

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/pokemon`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPokemonList(data);
          fetchPokemonDetails("pikachu"); // **默认加载 Pikachu**
        } else {
          console.error("❌ Invalid API response:", data);
        }
      })
      .catch((error) => console.error("❌ Failed to fetch Pokémon list:", error));
  }, []);

  const fetchPokemonDetails = (name) => {
    fetch(`${API_URL}/api/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => setSelectedPokemon(data))
      .catch((error) => console.error(`❌ Failed to fetch ${name}:`, error));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm) {
      fetchPokemonDetails(searchTerm);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="top">
              <h1 className="ttl">Pokémon Search</h1>

              <div className="search">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Enter Pokémon name"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button type="submit">Search</button>
                </form>
              </div>

              <div className="content">
                <div className="pokemonlist">
                  <h2>Pokémon List</h2>
                  <ul>
                    {pokemonList.map((pokemon, index) => (
                      <li key={index}>
                        <button
                          onClick={() => fetchPokemonDetails(pokemon.originalName)}
                        >
                          {pokemon.originalName}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedPokemon && (
                  <div className="pokemon">
                    <h2>{selectedPokemon.originalName}</h2>
                    <p>Dex Number: {selectedPokemon.id}</p>
                    <p>Type: {selectedPokemon.types?.join(", ")}</p>
                    <img
                      src={selectedPokemon.sprites?.front_default}
                      alt={selectedPokemon.originalName}
                    />
                    <br />
                    {/* 🔗 跳转到详细信息页面 */}
                    <Link to={`/pokemon/${selectedPokemon.originalName}`} className="details-button">
                      View More Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          }
        />
        <Route path="/pokemon/:name" element={<PokemonDetails />} />
      </Routes>
    </Router>
  );
}

export default App;