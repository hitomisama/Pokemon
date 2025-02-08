import { useEffect, useState } from "react";

function App() {
  const [pokemonList, setPokemonList] = useState([]); // 存储宝可梦名字列表
  const [selectedPokemon, setSelectedPokemon] = useState(null); // 存储选中的宝可梦详情
  const [searchTerm, setSearchTerm] = useState(""); // 搜索框输入

  // 🔹 获取宝可梦列表（首页）
  useEffect(() => {
    fetch("http://localhost:3000/api/pokemon") // 获取前 10 个宝可梦
      .then(response => response.json())
      .then(data => setPokemonList(data)) // API 返回 { name, url } 列表
      .catch(error => console.error("❌ 获取宝可梦列表失败:", error));
  }, []);

  // 🔹 点击名字或搜索时，获取宝可梦详情
  const fetchPokemonDetails = (name) => {
    fetch(`http://localhost:3000/api/pokemon/${name}`)
      .then(response => response.json())
      .then(data => setSelectedPokemon(data))
      .catch(error => console.error(`❌ 获取 ${name} 详情失败:`, error));
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
    <div>
      <h1>PokéAPI 宝可梦查询</h1>

      {/* 🔹 搜索功能 */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="输入宝可梦名字"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button type="submit">搜索</button>
      </form>

      {/* 🔹 显示宝可梦列表 */}
      <h2>宝可梦列表</h2>
      <ul>
        {pokemonList.map((pokemon, index) => (
          <li key={index}>
            <button onClick={() => fetchPokemonDetails(pokemon.name)}>
              {pokemon.name}
            </button>
          </li>
        ))}
      </ul>

      {/* 🔹 显示宝可梦详情 */}
      {selectedPokemon && (
        <div>
          <h2>{selectedPokemon.name}</h2>
          <p>编号: {selectedPokemon.id}</p>
          <p>类型: {selectedPokemon.types.map(t => t.type.name).join(", ")}</p>
          <img src={selectedPokemon.sprites?.front_default} alt={selectedPokemon.name} />
        </div>
      )}
    </div>
  );
}

export default App;