import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/containers', icon: '📦', label: 'Container Yard' },
  { path: '/berths', icon: '🏗️', label: 'Berth Scheduling' },
  { path: '/vessels', icon: '🚢', label: 'Vessel Routes' },
  { path: '/customs', icon: '📋', label: 'Customs Pre-clearance' },
  { path: '/fuel', icon: '⛽', label: 'Fuel Consumption' },
  { path: '/cargo', icon: '📍', label: 'Cargo Tracking' },
  { path: '/port-traffic', icon: '🚦', label: 'Port Traffic' },
  { path: '/weather', icon: '🌊', label: 'Weather Impact' },
  { path: '/crew', icon: '👥', label: 'Crew Management' },
  { path: '/equipment', icon: '🏭', label: 'Port Equipment' },
  { path: '/invoices', icon: '💰', label: 'Invoices & Billing' },
  { path: '/incidents', icon: '⚠️', label: 'Incident Reports' },
  { path: '/inspections', icon: '🔍', label: 'Dock Inspections' },
  { path: '/warehouse', icon: '🏪', label: 'Warehouse Mgmt' },
  { path: '/voyages', icon: '🗺️', label: 'Voyage Planning' },
  { path: '/shipping-lines', icon: '🏢', label: 'Shipping Lines' },
  { path: '/documents', icon: '📄', label: 'Documents' },
  { path: '/tariffs', icon: '💲', label: 'Port Tariffs' },
  { path: '/tides', icon: '🌊', label: 'Tide Schedules' },
  { path: '/notices', icon: '📢', label: 'Port Notices' },
  { path: '/ai-history', icon: '📋', label: 'AI History' },
  { path: '/ai-tools', icon: '🧠', label: 'AI Tools' },
];

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Maritime AI</div>
        <div className="sidebar-subtitle">Port Logistics Platform</div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0] || 'A'}</div>
            <div>
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-role">{user?.role || 'admin'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
