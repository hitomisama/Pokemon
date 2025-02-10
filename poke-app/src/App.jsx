import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; // 兼容本地 & 线上

function App() {
  const [pokemonList, setPokemonList] = useState([]); // 存储宝可梦名字列表
  const [selectedPokemon, setSelectedPokemon] = useState(null); // 存储选中的宝可梦详情
  const [searchTerm, setSearchTerm] = useState(""); // 搜索框输入

  // 🔹 获取宝可梦列表（首页）
  useEffect(() => {
    fetch(`${API_URL}/api/pokemon`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPokemonList(data);
        } else {
          console.error("❌ API 数据格式错误:", data);
        }
      })
      .catch((error) => console.error("❌ 获取宝可梦列表失败:", error));
  }, []);

  // 🔹 点击名字或搜索时，获取宝可梦详情
  const fetchPokemonDetails = (name) => {
    fetch(`${API_URL}/api/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => setSelectedPokemon(data))
      .catch((error) => console.error(`❌ 获取 ${name} 详情失败:`, error));
  };

  // 🔹 处理搜索框输入
  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // 🔹 执行搜索（回车或按钮）
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchTerm) {
      fetchPokemonDetails(searchTerm);
    }
  };

  return (
    <div className="top">
      <h1 className="ttl">ポケモン検索</h1>
      {/* 🔹 搜索功能 */}
      <div className="search">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="ポケモンの名前を入力"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button type="submit">検索</button>
        </form>
      </div>

      <div className="content">
        {/* 🔹 显示宝可梦列表 */}
        <div className="pokemonlist">
          <h2>ポケモンリスト</h2>
          <ul>
            {pokemonList.map((pokemon, index) => (
              <li key={index}>
                <button onClick={() => fetchPokemonDetails(pokemon.originalName)}>
                  {pokemon.name} ({pokemon.originalName})
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* 🔹 显示宝可梦详情 */}
        {selectedPokemon && (
          <div className="pokemon">
            <h2>{selectedPokemon.name} ({selectedPokemon.originalName})</h2>
            <p>図鑑番号: {selectedPokemon.id}</p>
            <p>
              タイプ: {selectedPokemon.types.join(", ")}
            </p>
            <img
              src={selectedPokemon.sprites?.front_default}
              alt={selectedPokemon.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;