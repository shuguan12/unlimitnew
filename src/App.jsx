import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const gridRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setLoading(true);
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <div 
        className="news-grid"
        ref={gridRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {news.map((item, index) => (
          <div 
            key={index}
            className={`news-card ${expandedCard === index ? 'expanded' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="news-card-header">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="news-image"
                />
              )}
              <div>
                <h3>{item.title}</h3>
                <p className="text-sm text-gray-500">{item.publishedAt}</p>
              </div>
            </div>
            {expandedCard === index && (
              <div className="mt-4">
                <p>{item.description}</p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-primary hover:underline"
                >
                  阅读全文 <i className="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;