const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔹 获取前 10 个宝可梦
app.get('/api/pokemon', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10');
        res.json(response.data.results); // 返回 { name, url }
    } catch (error) {
        console.error('❌ 获取宝可梦列表失败:', error.message);
        res.status(500).json({ error: '无法获取宝可梦列表' });
    }
});

// 🔹 获取单个宝可梦详情
app.get('/api/pokemon/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        res.json(response.data);
    } catch (error) {
        console.error(`❌ 获取 ${name} 失败:`, error.message);
        res.status(500).json({ error: `无法获取 ${name} 的数据` });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});