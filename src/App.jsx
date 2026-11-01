import React, { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import './App.css';

function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  // 1. Load anime.db via WebAssembly
  useEffect(() => {
    async function loadDatabase() {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`,
        });

        // Fetch anime.db directly from GitHub raw link or local route
        const dbUrl = 'https://raw.githubusercontent.com/allanzamora/tagalog-anime-app/main/public/anime.db';
        const response = await fetch(dbUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to download database: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));

        setDb(database);

        // Fetch initial list table
        const res = database.exec('SELECT id, title, track FROM list');
        if (res.length > 0) {
          const rows = res[0].values.map((row) => ({
            id: row[0],
            title: row[1],
            track: row[2],
          }));
          setAnimeList(rows);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading SQLite DB:', err);
        setLoading(false);
      }
    }

    loadDatabase();
  }, []);

  // 2. Query episodes where track matches selected anime track
  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    window.history.pushState({}, '', `/${anime.track}`);

    if (db) {
      const stmt = db.prepare('SELECT id, track, title, url FROM episode WHERE track = :track');
      stmt.bind({ ':track': anime.track });

      const epList = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        epList.push(row);
      }
      stmt.free();

      setEpisodes(epList);
      if (epList.length > 0 && epList[0].url) {
        setActiveVideo(epList[0]);
      } else {
        setActiveVideo(null);
      }
    }
  };

  const handleBack = () => {
    setSelectedAnime(null);
    setEpisodes([]);
    setActiveVideo(null);
    window.history.pushState({}, '', '/');
  };

  // Filter list by title search
  const filteredList = animeList.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading Database...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      {selectedAnime ? (
        <div>
          <button className="back-btn" onClick={handleBack}>
            ← Back to Anime List
          </button>

          <div className="detail-header" style={{ marginTop: '16px' }}>
            <span className="badge-category">Track: {selectedAnime.track}</span>
            <h1>{selectedAnime.title}</h1>
          </div>

          {/* Active Episode Video Player */}
          {activeVideo && activeVideo.url ? (
            <div className="iframe-container" style={{ margin: '16px 0', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                src={activeVideo.url}
                title={activeVideo.title}
                allowFullScreen
                style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
              ></iframe>
            </div>
          ) : (
            <div className="card" style={{ padding: '20px', textAlign: 'center', margin: '16px 0' }}>
              <p>Select an episode below to start streaming.</p>
            </div>
          )}

          {/* Episode List matching track */}
          <h3>Episodes ({episodes.length})</h3>
          <div className="episodes-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="card"
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  border: activeVideo?.id === ep.id ? '1px solid #3b82f6' : '1px solid #27272a',
                }}
                onClick={() => setActiveVideo(ep)}
              >
                <span>{ep.title}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <header className="header">
            <div className="brand-badge">SQLite WebAssembly Engine</div>
            <h1>TAGALOG ANIME 143</h1>
            <p>Select an anime to load series episodes from anime.db</p>
          </header>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search anime title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <main className="catalog-grid">
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <article
                  key={item.id}
                  className="media-card"
                  onClick={() => handleSelectAnime(item)}
                  style={{ padding: '16px', cursor: 'pointer' }}
                >
                  <span className="badge-category">{item.track}</span>
                  <h3 className="card-title" style={{ marginTop: '8px' }}>
                    {item.title}
                  </h3>
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