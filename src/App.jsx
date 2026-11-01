import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        // Check if URL has a slug like /bleach
        const path = window.location.pathname.replace('/', '');
        if (path) {
          const found = data.find((item) => item.slug === path);
          if (found) setSelectedAnime(found);
        }
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  const handleSelect = (anime) => {
    setSelectedAnime(anime);
    window.history.pushState({}, '', `/${anime.slug}`);
  };

  const handleBack = () => {
    setSelectedAnime(null);
    window.history.pushState({}, '', '/');
  };

  const filteredMovies = movies.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container">
      {selectedAnime ? (
        <div>
          <button className="back-btn" onClick={handleBack}>← Back to Catalog</button>
          
          <div className="detail-header" style={{ marginTop: '16px' }}>
            <span className="badge-category">{selectedAnime.category}</span>
            <h1>{selectedAnime.title}</h1>
            <p className="episodes-sub" style={{ color: 'var(--text-muted)' }}>{selectedAnime.episodes} • Tagalog Dubbed</p>
          </div>

          <div className="iframe-container" style={{ margin: '16px 0', borderRadius: '12px', overflow: 'hidden' }}>
            <iframe
              src={selectedAnime.videoUrl}
              title={selectedAnime.title}
              allowFullScreen
              style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
            ></iframe>
          </div>

          <div className="card" style={{ marginTop: '20px', padding: '16px', background: '#1f2833', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Overview</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{selectedAnime.description}</p>
          </div>
        </div>
      ) : (
        <div>
          <header className="header">
            <div className="brand-badge">Tagalog Dubbed Hub</div>
            <h1>TAGALOG ANIME 143</h1>
            <p>Stream free high-quality Tagalog anime series &amp; movies</p>
          </header>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search anime title or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <main className="catalog-grid">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((item) => (
                <article 
                  key={item.id} 
                  className="media-card"
                  onClick={() => handleSelect(item)}
                >
                  <div className="poster-wrapper">
                    <img src={item.poster} alt={item.title} className="poster-img" />
                    <span className="badge-episodes">{item.episodes}</span>
                  </div>
                  <div className="card-info">
                    <span className="badge-category">{item.category}</span>
                    <h3 className="card-title">{item.title}</h3>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-results">No anime found matching "{query}"</p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;