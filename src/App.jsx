import React, { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import './App.css';

function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  // 1. Load anime.db and sql.js locally
  useEffect(() => {
    async function loadDatabase() {
      try {
        // Load WASM locally from the public folder
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });

        const response = await fetch('/anime.db');
        if (!response.ok) {
          throw new Error(`Failed to fetch anime.db (Status: ${response.status})`);
        }

        const buffer = await response.arrayBuffer();
        const database = new SQL.Database(new Uint8Array(buffer));
        setDb(database);

        // Fetch list table
        const res = database.exec('SELECT id, title, track FROM list');
        if (res.length > 0 && res[0].values) {
          const rows = res[0].values.map((row) => ({
            id: row[0],
            title: row[1],
            track: row[2],
          }));
          setAnimeList(rows);
        } else {
          setDbError("Table 'list' is empty or not found in anime.db");
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading local SQLite DB:', err);
        setDbError(err.message);
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
      try {
        const stmt = db.prepare('SELECT id, track, title, url FROM episode WHERE track = :track');
        stmt.bind({ ':track': anime.track });

        const epList = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          epList.push(row);
        }
        stmt.free();

        setEpisodes(epList);
        if (epList.length > 0) {
          setActiveVideo(epList[0]);
        } else {
          setActiveVideo(null);
        }
      } catch (e) {
        console.error('Error querying episodes:', e);
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
    item.title && item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#09090b', color: '#f4f4f5', minHeight: '100vh' }}>
        <h2>Loading Local Database...</h2>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '16px', background: '#09090b', color: '#f4f4f5' }}>
      {dbError && (
        <div style={{ background: '#7f1d1d', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>DB Error:</strong> {dbError}
        </div>
      )}

      {selectedAnime ? (
        <div>
          <button 
            onClick={handleBack} 
            style={{ background: '#27272a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px' }}
          >
            ← Back to Anime List
          </button>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
              Track: {selectedAnime.track}
            </span>
            <h1 style={{ fontSize: '24px', marginTop: '8px' }}>{selectedAnime.title}</h1>
          </div>

          {/* Active Episode Video Player */}
          {activeVideo ? (
            <div style={{ margin: '16px 0', borderRadius: '12px', overflow: 'hidden', background: '#18181b' }}>
              {activeVideo.url && activeVideo.url !== '(null)' ? (
                <iframe
                  src={activeVideo.url}
                  title={activeVideo.title}
                  allowFullScreen
                  style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
                ></iframe>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center' }}>
                  <h3>Now Playing: {activeVideo.title}</h3>
                  <p style={{ color: '#a1a1aa', marginTop: '8px' }}>Video URL is currently placeholder.</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Episode List */}
          <h3 style={{ margin: '20px 0 10px 0' }}>Episodes ({episodes.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => setActiveVideo(ep)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: activeVideo?.id === ep.id ? '#27272a' : '#18181b',
                  border: 'none',
                }}
              >
                <span>{ep.title}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <header style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Local SQLite WebAssembly
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>TAGALOG ANIME 143</h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>
              Select an anime to load series episodes from anime.db
            </p>
          </header>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search anime title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                background: '#18181b',
                color: '#fff',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
              }}
            />
          </div>

          <main style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <article
                  key={item.id}
                  onClick={() => handleSelectAnime(item)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    background: '#18181b',
                    border: 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#38bdf8', background: '#09090b', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.track}
                  </span>
                  <h3 style={{ fontSize: '16px', marginTop: '6px' }}>{item.title}</h3>
                </article>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#a1a1aa', marginTop: '40px' }}>
                No anime found matching "{query}" (Total loaded: {animeList.length})
              </p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;