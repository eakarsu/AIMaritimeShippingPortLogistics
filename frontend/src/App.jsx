import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIHistory from './pages/AIHistory';
import AIToolsPage from './pages/AIToolsPage';
import Layout from './components/Layout';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/containers" element={<FeaturePage feature="containers" />} />
        <Route path="/berths" element={<FeaturePage feature="berths" />} />
        <Route path="/vessels" element={<FeaturePage feature="vessels" />} />
        <Route path="/customs" element={<FeaturePage feature="customs" />} />
        <Route path="/fuel" element={<FeaturePage feature="fuel" />} />
        <Route path="/cargo" element={<FeaturePage feature="cargo" />} />
        <Route path="/port-traffic" element={<FeaturePage feature="port-traffic" />} />
        <Route path="/weather" element={<FeaturePage feature="weather" />} />
        <Route path="/crew" element={<FeaturePage feature="crew" />} />
        <Route path="/equipment" element={<FeaturePage feature="equipment" />} />
        <Route path="/invoices" element={<FeaturePage feature="invoices" />} />
        <Route path="/incidents" element={<FeaturePage feature="incidents" />} />
        <Route path="/inspections" element={<FeaturePage feature="inspections" />} />
        <Route path="/warehouse" element={<FeaturePage feature="warehouse" />} />
        <Route path="/voyages" element={<FeaturePage feature="voyages" />} />
        <Route path="/shipping-lines" element={<FeaturePage feature="shipping-lines" />} />
        <Route path="/documents" element={<FeaturePage feature="documents" />} />
        <Route path="/tariffs" element={<FeaturePage feature="tariffs" />} />
        <Route path="/tides" element={<FeaturePage feature="tides" />} />
        <Route path="/notices" element={<FeaturePage feature="notices" />} />
        <Route path="/ai-history" element={<AIHistory />} />
        <Route path="/ai-tools" element={<AIToolsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
