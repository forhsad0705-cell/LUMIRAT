import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { SongList } from './pages/SongList';
import { SongEditor } from './pages/SongEditor';
import AuthGuard from './components/AuthGuard';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/songs" element={
          <AuthGuard>
            <SongList />
          </AuthGuard>
        } />

        <Route path="/songs/:id" element={
          <AuthGuard>
            <SongEditor />
          </AuthGuard>
        } />

        {/* Redirect root to songs (will trigger login if needed) */}
        <Route path="/" element={<Navigate to="/songs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
