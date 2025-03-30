import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());
const PORT = 3002;

// 处理前端路由
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
const GNEWS_KEY = process.env.GNEWS_KEY || 'your_activated_api_key_here';

if (!GNEWS_KEY) {
  console.error('请设置GNEWS_KEY环境变量');
  process.exit(1);
}

app.get('/api/news', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const { search, max } = req.query;
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        token: GNEWS_KEY,
        lang: 'zh',
        country: 'cn',
        topic: 'technology',
        q: search || '科技',
        max: max || 10
      }
    });
    
    if (response.data.errors) {
      console.error('GNews API错误:', response.data.errors);
      return res.status(403).json({ 
        error: 'API密钥无效或请求受限',
        details: response.data.errors 
      });
    }
    
    res.json(response.data.articles);
  } catch (error) {
    console.error('GNews请求失败:', error.response?.data || error.message);
    res.status(500).json({ 
      error: '新闻获取失败',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});