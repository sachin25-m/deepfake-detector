import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
