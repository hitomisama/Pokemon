const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// 🔹 获取随机 10 个 Pokémon
app.get("/api/pokemon", async (req, res) => {
    try {
        const allPokemonResponse = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1000"); // 获取全部 Pokémon
        const allPokemon = allPokemonResponse.data.results;

        // **随机选择 10 个 Pokémon**
        const randomPokemon = [];
        while (randomPokemon.length < 10) {
            const randomIndex = Math.floor(Math.random() * allPokemon.length);
            const pokemon = allPokemon[randomIndex];
            if (!randomPokemon.some(p => p.originalName === pokemon.name)) {
                randomPokemon.push({
                    originalName: pokemon.name,
                    url: pokemon.url,
                });
            }
        }

        res.json(randomPokemon);
    } catch (error) {
        console.error("❌ 获取 Pokémon 列表失败:", error.message);
        res.status(500).json({ error: "Unable to fetch Pokémon list" });
    }
});

// 🔹 获取单个 Pokémon 详情，包括进化信息
app.get("/api/pokemon/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const decodedName = decodeURIComponent(name);

        console.log(`🔍 Fetching Pokémon: ${decodedName}`);

        // 获取 Pokémon 基础信息
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${decodedName}`);
        const speciesRes = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${decodedName}`);

        if (!response.data || !speciesRes.data) {
            return res.status(404).json({ error: "Pokémon not found" });
        }

        // 🔹 获取进化链
        const evolutionChainUrl = speciesRes.data.evolution_chain.url;
        const evolutionChainRes = await axios.get(evolutionChainUrl);
        const evolutionChain = parseEvolutionChain(evolutionChainRes.data.chain);

        // 🔹 获取进化触发条件
        const evolutionTriggers = await getEvolutionTriggers(evolutionChainRes.data.chain);

        const abilities = response.data.abilities?.map(a => a.ability.name) || [];
        const stats = response.data.stats?.map(s => ({
            name: s.stat.name,
            value: s.base_stat,
        })) || [];
        const moves = response.data.moves?.map(m => m.move.name) || [];
        const eggGroups = speciesRes.data.egg_groups?.map(e => e.name) || [];
        const growthRate = speciesRes.data.growth_rate?.name || "Unknown";
        const captureRate = speciesRes.data.capture_rate || "Unknown";

        res.json({
            originalName: response.data.name,
            id: response.data.id,
            types: response.data.types?.map(t => t.type.name) || [],
            height: response.data.height || 0,
            weight: response.data.weight || 0,
            base_experience: response.data.base_experience || 0,
            sprites: response.data.sprites || {},
            abilities: abilities,
            stats: stats,
            moves: moves,
            egg_groups: eggGroups,
            growth_rate: growthRate,
            capture_rate: captureRate,
            evolutionChain: evolutionChain,
            evolutionTriggers: evolutionTriggers, // 进化触发条件
        });
    } catch (error) {
        console.error(`❌ 获取 ${req.params.name} 失败:`, error.message);
        res.status(500).json({ error: `Unable to fetch data for ${req.params.name}` });
    }
});

// 🔹 解析进化链
function parseEvolutionChain(chain) {
    let evolutionChain = [];
    let currentStage = chain;

    while (currentStage) {
        evolutionChain.push(currentStage.species.name);
        if (currentStage.evolves_to.length > 0) {
            currentStage = currentStage.evolves_to[0];
        } else {
            break;
        }
    }

    return evolutionChain;
}

// 🔹 获取进化触发条件
async function getEvolutionTriggers(chain) {
    let evolutionTriggers = [];

    if (chain.evolves_to.length > 0) {
        for (let evo of chain.evolves_to) {
            if (evo.evolution_details.length > 0) {
                let triggerId = evo.evolution_details[0].trigger.url.split("/").slice(-2, -1)[0]; // 获取 ID
                let triggerRes = await axios.get(`https://pokeapi.co/api/v2/evolution-trigger/${triggerId}`);
                evolutionTriggers.push(triggerRes.data.name);
            }
        }
    }

    return evolutionTriggers;
}

// ✅ 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});