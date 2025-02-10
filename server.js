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

        // 获取每个宝可梦的日文名字
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

        // 获取基本信息
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${name}`);

        console.log("📝 获取的 speciesRes 数据:", speciesRes.data.names);

        // 查找日文名字
        const japaneseNameEntry = speciesRes.data.names.find(n => n.language.name === "ja");
        const japaneseName = japaneseNameEntry ? japaneseNameEntry.name : response.data.name;

        res.json({
            name: japaneseName, // 日文名字
            originalName: response.data.name, // 英文名字
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