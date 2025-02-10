const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔹 获取 Pokémon 列表
app.get("/api/pokemon", async (req, res) => {
    try {
        const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=20"); // 获取前 20 个宝可梦
        const pokemonList = response.data.results;

        res.json(
            pokemonList.map((pokemon) => ({
                originalName: pokemon.name,
                url: pokemon.url,
            }))
        );
    } catch (error) {
        console.error("❌ 获取 Pokémon 列表失败:", error.message);
        res.status(500).json({ error: "Unable to fetch Pokémon list" });
    }
});

// 🔹 获取单个 Pokémon 详情（包含基础信息 & 进化链）
app.get("/api/pokemon/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const decodedName = decodeURIComponent(name);

        console.log(`🔍 Fetching Pokémon: ${decodedName}`);

        // 获取 Pokémon 的基本数据
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${decodedName}`);
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${decodedName}`);

        if (!response.data || !speciesRes.data) {
            return res.status(404).json({ error: "Pokémon not found" });
        }

        // 获取进化链
        const evolutionChainUrl = speciesRes.data.evolution_chain?.url;
        let evolutionChain = [];

        if (evolutionChainUrl) {
            const evolutionRes = await axios.get(evolutionChainUrl);
            evolutionChain = extractEvolutionChain(evolutionRes.data.chain);
        }

        res.json({
            originalName: response.data.name,
            id: response.data.id,
            types: response.data.types?.map((t) => t.type.name) || [],
            height: response.data.height || 0,
            weight: response.data.weight || 0,
            base_experience: response.data.base_experience || 0,
            sprites: response.data.sprites || {},
            abilities: response.data.abilities?.map((a) => a.ability.name) || [],
            stats: response.data.stats?.map((s) => ({
                name: s.stat.name,
                value: s.base_stat,
            })) || [],
            moves: response.data.moves?.map((m) => m.move.name) || [],
            egg_groups: speciesRes.data.egg_groups?.map((e) => e.name) || [],
            growth_rate: speciesRes.data.growth_rate?.name || "Unknown",
            capture_rate: speciesRes.data.capture_rate || "Unknown",
            evolution_chain: evolutionChain, // 添加进化链数据
        });
    } catch (error) {
        console.error(`❌ 获取 ${req.params.name} 失败:`, error.message);
        res.status(500).json({ error: `Unable to fetch data for ${req.params.name}` });
    }
});

// 🔹 解析进化链的函数
const extractEvolutionChain = (chain) => {
    let evolutionList = [];
    let currentStage = chain;

    while (currentStage) {
        evolutionList.push(currentStage.species.name);
        if (currentStage.evolves_to.length > 0) {
            currentStage = currentStage.evolves_to[0]; // 取第一种进化形态
        } else {
            break;
        }
    }

    return evolutionList;
};

// ✅ 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});