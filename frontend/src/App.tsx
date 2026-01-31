import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Decisions from './pages/Decisions';
import Chat from './pages/Chat';
import './styles/globals.css';

// Placeholder for Health page
const Health = () => <div className="text-2xl font-bold">Health Page (Coming Soon)</div>;

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
