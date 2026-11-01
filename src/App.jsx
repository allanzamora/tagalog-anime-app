import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState([]);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);

  // Load catalog data and check URL path on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/anime.json');
        if (!response.ok) throw new Error(`Failed to load catalog`);
        const data = await response.json();
        
        const list = data.list || [];
        const episodesList = data.episodes || [];
        
        setAnimeList(list);
        setAllEpisodes(episodesList);

        // Check if current URL path matches any anime track (e.g. /naruto -> naruto)
        const currentPath = window.location.pathname.replace('/', '').trim();
        if (currentPath) {
          const matchedAnime = list.find((item) => item.track.toLowerCase() === currentPath.toLowerCase());
          if (matchedAnime) {
            // Automatically select the anime and load its episodes
            setSelectedAnime(matchedAnime);
            const matchedEpisodes = episodesList.filter((ep) => ep.track === matchedAnime.track);
            setEpisodes(matchedEpisodes);
            if (matchedEpisodes.length > 0) {
              setActiveVideo(matchedEpisodes[0]);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    window.history.pushState({}, '', `/${anime.track}`);

    const matched = allEpisodes.filter((ep) => ep.track === anime.track);
    setEpisodes(matched);
    if (matched.length > 0) {
      setActiveVideo(matched[0]);
    } else {
      setActiveVideo(null);
    }
  };

  const handleBack = () => {
    setSelectedAnime(null);
    setEpisodes([]);
    setActiveVideo(null);
    window.history.pushState({}, '', '/');
  };

  const filteredList = animeList.filter((item) =>
    item.title && item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#09090b', color: '#f4f4f5', minHeight: '100vh' }}>
        <h2>Loading Catalog...</h2>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '16px', background: '#09090b', color: '#f4f4f5', boxSizing: 'border-box' }}>
      {error && (
        <div style={{ background: '#7f1d1d', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
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

          {activeVideo ? (
            <div style={{ margin: '16px 0', borderRadius: '12px', overflow: 'hidden', background: '#18181b' }}>
              <iframe
                src={activeVideo.url}
                title={activeVideo.title}
                allowFullScreen
                style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
              ></iframe>
            </div>
          ) : null}

          <h3 style={{ margin: '20px 0 10px 0' }}>Episodes ({episodes.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {episodes.map((ep, index) => (
              <div
                key={index} // Use index or ep.title since id is removed
                onClick={() => setActiveVideo(ep)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  background: activeVideo?.title === ep.title ? '#27272a' : '#18181b',
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
              Tagalog Anime Streamer
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>TAGALOG ANIME 143</h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>
              Select an anime to stream episodes
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
                  key={item.track} // Use track as unique key instead of id
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