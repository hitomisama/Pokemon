const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔹 获取前 10 个宝可梦的日文名字
app.get('/api/pokemon', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10');
        const pokemonList = response.data.results;

        const updatedPokemonList = await Promise.all(
            pokemonList.map(async (pokemon) => {
                const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
                const japaneseNameEntry = speciesRes.data.names.find(n => n.language.name === "ja");

                return {
                    name: japaneseNameEntry ? japaneseNameEntry.name : pokemon.name,
                    originalName: pokemon.name,
                    url: pokemon.url
                };
            })
        );

        res.json(updatedPokemonList);
    } catch (error) {
        console.error('❌ 获取宝可梦列表失败:', error.message);
        res.status(500).json({ error: '无法获取宝可梦列表' });
    }
});

// 🔹 获取单个宝可梦详情（包含日文名）
app.get('/api/pokemon/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const decodedName = decodeURIComponent(name); // 🔹 解码 URL 编码的日文字符

        console.log(`🔍 请求宝可梦: ${decodedName}`);

        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${decodedName}`);
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${decodedName}`);

        console.log("📝 API 返回的数据:", speciesRes.data); // 🔹 打印 JSON，检查 `names` 是否存在

        const japaneseNameEntry = speciesRes.data.names.find(n => n.language.name === "ja");
        const japaneseName = japaneseNameEntry ? japaneseNameEntry.name : response.data.name;

        res.json({
            name: japaneseName,
            originalName: response.data.name,
            id: response.data.id,
            types: response.data.types.map(t => t.type.name),
            sprites: response.data.sprites
        });
    } catch (error) {
        console.error(`❌ 获取 ${req.params.name} 失败:`, error.message);
        res.status(500).json({ error: `无法获取 ${req.params.name} 的数据` });
    }
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});