import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { RecommendationFeed } from './components/RecommendationFeed';
import { MovieSearch } from './components/MovieSearch';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { PlayerProvider } from './context/PlayerContext';
import { PlayerBar } from './components/PlayerBar';

const pageStyle = { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '32px 24px 100px', fontFamily: 'sans-serif' };

function App() {
    return <BrowserRouter><PlayerProvider><div style={pageStyle}>
        <header style={{ marginBottom: 32 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}><h1 style={{ margin: 0, fontSize: 28 }}>🎬 MovieMusic (Muse)</h1></Link>
            <nav style={{ display: 'flex', gap: 12 }}><Link to="/" style={{ color: '#fff', textDecoration: 'none', padding: '8px 12px', background: '#141414', borderRadius: 6 }}>Discover</Link><Link to="/search" style={{ color: '#fff', textDecoration: 'none', padding: '8px 12px', background: '#141414', borderRadius: 6 }}>Search</Link></nav>
        </div></header>
        <Routes><Route path="/" element={<RecommendationFeed />} /><Route path="/search" element={<MovieSearch />} /><Route path="/playlist/:id" element={<PlaylistDetailPage />} /></Routes>
        <PlayerBar />
    </div></PlayerProvider></BrowserRouter>;
}
export default App;
