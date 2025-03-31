import { useState, useEffect, useRef } from 'react';
import './App.css';

import { newsData } from './newsData';

// 转换newsData格式以匹配现有逻辑
const processedNewsData = newsData.map((news, index) => ({
  id: index + 1,
  title: news.title,
  summary: news.description,
  content: news.description + ' (详细内容请查看完整报道)',
  time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  relevance: Math.random().toFixed(1),
  category: ['科技', '政治', '经济', '娱乐'][Math.floor(Math.random() * 4)],
  imageUrl: news.imageUrl
}));

function App() {
  const [expandedId, setExpandedId] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // 计算新闻位置
  const calculatePosition = (news) => {
    const x = (1 - news.relevance) * 2000 - 1000; // 横向：相关度 (0-1 → 右到左)
    const y = ((new Date() - news.time) / (1000 * 60 * 60 * 24)) * 50; // 纵向：天数 (上到下)
    
    return {
      x: x + position.x,
      y: y + position.y,
      scale: expandedId === news.id ? 1.5 : 1,
      zIndex: expandedId === news.id ? 100 : 1
    };
  };

  // 拖拽交互
  const handleMouseDown = (e) => {
    if (e.target === containerRef.current) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !expandedId) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 展开/收起新闻
  const toggleNews = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div
      ref={containerRef}
      className="news-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 操作指引 */}
      <div className="controls">
        <h3>无限新闻 · 操作指南</h3>
        <p>←→ 横向滑动：浏览相关度不同的新闻</p>
        <p>↑↓ 纵向滑动：查看时间线</p>
        <p>点击新闻：展开/收起详情</p>
      </div>

      {/* 新闻卡片 */}
      {newsData.map((news) => {
        const pos = calculatePosition(news);
        
        return (
          <div
            key={news.id}
            className={`news-card ${expandedId === news.id ? 'expanded' : ''}`}
            onClick={() => toggleNews(news.id)}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
              zIndex: pos.zIndex,
              backgroundColor: expandedId === news.id ? '#fff' : getCategoryColor(news.category)
            }}
          >
            <div className="news-header">
              <span className="time">{formatTime(news.time)}</span>
              <span className="relevance">相关度: {(news.relevance * 100).toFixed(0)}%</span>
            </div>
            <h3>{news.title}</h3>
            
            {expandedId === news.id ? (
              <div className="expanded-content">
                <img src={news.imageUrl} alt={news.title} />
                <p>{news.content}</p>
                <div className="related">相关新闻: 3条</div>
              </div>
            ) : (
              <p className="summary">{news.summary}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 辅助函数
function formatTime(date) {
  const days = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
  return `${days}天前`;
}

function getCategoryColor(category) {
  const colors = {
    '科技': '#e3f2fd',
    '政治': '#ffebee',
    '经济': '#e8f5e9',
    '娱乐': '#f3e5f5'
  };
  return colors[category] || '#f5f5f5';
}

export default App;