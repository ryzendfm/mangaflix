import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/manga/:id" element={<Layout><MangaDetail /></Layout>} />
        <Route path="/read/:chapterId" element={<Reader />} />
      </Routes>
    </Router>
  );
};

export default App;
