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

  const updateMetaTags = (title, description, canonicalPath) => {
    document.title = title;
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://tagalogmoviehub.vercel.app${canonicalPath}`;
  };

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    window.history.pushState({}, '', `/${anime.track}`);

    updateMetaTags(
      `${anime.title} Dubbed - TagalogMovieHub`,
      `Watch and stream ${anime.title} with Tagalog audio and episodes online for free.`,
      `/${anime.track}`
    );

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

    updateMetaTags(
      'Tagalog Anime 143 - Watch Tagalog Dubbed Anime Online',
      'Stream your favorite Tagalog-dubbed anime series and episodes online for free.',
      '/'
    );
  };

  const filteredList = animeList.filter((item) =>
    item.title && item.title.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'left', padding: '60px 20px', background: '#09090b', color: '#f4f4f5', minHeight: '100vh' }}>
        <h2>Loading Catalog...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {error && (
        <div style={{ background: '#7f1d1d', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {selectedAnime ? (
        <div>
          {/* Horizontal Flex Container for Back Button and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleBack} 
              style={{ 
                background: '#27272a', 
                color: '#fff', 
                border: 'none', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: '22px', margin: 0, color: '#ffffff', fontWeight: '700' }}>
              {selectedAnime.title}
            </h1>
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
          
          {/* Grid View Container for Episodes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {episodes.map((ep, index) => (
              <div
                key={index}
                onClick={() => setActiveVideo(ep)}
                style={{
                  padding: '14px 12px',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  background: activeVideo?.title === ep.title ? '#27272a' : '#18181b',
                  border: 'none',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{ep.title}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <header style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Tagalog Movie Hub</h1>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px' }}>
              Stream your favorite Tagalog-dubbed movies, series and episodes online for free.
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

          <main style={{ display: 'flex', flexDirection: 'column', gap: '12px' , textAlign: 'left'}}>
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <article
                  key={item.track}
                  onClick={() => handleSelectAnime(item)}
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    background: '#18181b',
                    border: 'none',
                  }}
                >
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ffffff', margin: 0 }}>{item.title}</h3>
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