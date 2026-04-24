import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const features = [
  {
    key: 'containers',
    path: '/containers',
    icon: '📦',
    color: '#0ea5e9',
    title: 'Container Yard Optimization',
    desc: 'AI-powered container stacking, retrieval optimization, and yard layout management',
    resource: 'containers',
  },
  {
    key: 'berths',
    path: '/berths',
    icon: '🏗️',
    color: '#8b5cf6',
    title: 'Berth Scheduling',
    desc: 'Intelligent berth allocation, vessel scheduling, and turnaround time optimization',
    resource: 'berths',
  },
  {
    key: 'vessels',
    path: '/vessels',
    icon: '🚢',
    color: '#10b981',
    title: 'Vessel Route Optimization',
    desc: 'AI route planning considering weather, fuel efficiency, and port congestion',
    resource: 'vessels',
  },
  {
    key: 'customs',
    path: '/customs',
    icon: '📋',
    color: '#f59e0b',
    title: 'Customs Pre-clearance',
    desc: 'Automated risk assessment, document validation, and pre-clearance processing',
    resource: 'customs',
  },
  {
    key: 'fuel',
    path: '/fuel',
    icon: '⛽',
    color: '#ef4444',
    title: 'Fuel Consumption Modeling',
    desc: 'Predictive fuel analytics, emissions tracking, and consumption optimization',
    resource: 'fuel',
  },
  {
    key: 'cargo',
    path: '/cargo',
    icon: '📍',
    color: '#06b6d4',
    title: 'Cargo Tracking',
    desc: 'Real-time cargo visibility, delivery prediction, and supply chain intelligence',
    resource: 'cargo',
  },
  {
    key: 'port-traffic',
    path: '/port-traffic',
    icon: '🚦',
    color: '#84cc16',
    title: 'Port Traffic Management',
    desc: 'Channel traffic optimization, pilot/tug scheduling, and congestion management',
    resource: 'port-traffic',
  },
  {
    key: 'weather',
    path: '/weather',
    icon: '🌊',
    color: '#6366f1',
    title: 'Weather Impact Analysis',
    desc: 'Weather forecasting impact on operations, safety advisories, and contingency planning',
    resource: 'weather',
  },
  {
    key: 'crew',
    path: '/crew',
    icon: '👥',
    color: '#ec4899',
    title: 'Crew Management',
    desc: 'AI crew scheduling, certification tracking, workload optimization, and compliance monitoring',
    resource: 'crew',
  },
  {
    key: 'equipment',
    path: '/equipment',
    icon: '🏭',
    color: '#14b8a6',
    title: 'Port Equipment Management',
    desc: 'Equipment utilization, predictive maintenance, downtime prevention, and capacity planning',
    resource: 'equipment',
  },
  {
    key: 'invoices',
    path: '/invoices',
    icon: '💰',
    color: '#f97316',
    title: 'Invoices & Billing',
    desc: 'Revenue analytics, payment tracking, receivables management, and client profitability',
    resource: 'invoices',
  },
  {
    key: 'incidents',
    path: '/incidents',
    icon: '⚠️',
    color: '#dc2626',
    title: 'Incident Reports',
    desc: 'Safety incident tracking, risk pattern analysis, root cause identification, and prevention',
    resource: 'incidents',
  },
  {
    key: 'inspections',
    path: '/inspections',
    icon: '🔍',
    color: '#7c3aed',
    title: 'Dock Inspections',
    desc: 'Vessel inspection management, compliance scoring, deficiency tracking, and regulatory risk',
    resource: 'inspections',
  },
  {
    key: 'warehouse',
    path: '/warehouse',
    icon: '🏪',
    color: '#0d9488',
    title: 'Warehouse Management',
    desc: 'Storage optimization, inventory tracking, space utilization, and expiry risk management',
    resource: 'warehouse',
  },
  {
    key: 'voyages',
    path: '/voyages',
    icon: '🗺️',
    color: '#2563eb',
    title: 'Voyage Planning',
    desc: 'Voyage profitability analysis, route efficiency, schedule adherence, and revenue optimization',
    resource: 'voyages',
  },
  {
    key: 'shipping-lines',
    path: '/shipping-lines',
    icon: '🏢',
    color: '#475569',
    title: 'Shipping Lines Directory',
    desc: 'Manage shipping line contacts, contracts, fleet info, and service route coverage',
    resource: 'shipping-lines',
  },
  {
    key: 'documents',
    path: '/documents',
    icon: '📄',
    color: '#78716c',
    title: 'Shipping Documents',
    desc: 'Track bills of lading, manifests, certificates, customs declarations, and other shipping documents',
    resource: 'documents',
  },
  {
    key: 'tariffs',
    path: '/tariffs',
    icon: '💲',
    color: '#059669',
    title: 'Port Tariffs',
    desc: 'Port service tariff schedules, rates, charges, and billing reference for all vessel types',
    resource: 'tariffs',
  },
  {
    key: 'tides',
    path: '/tides',
    icon: '🌊',
    color: '#0284c7',
    title: 'Tide Schedules',
    desc: 'Tide tables with high/low tide times, heights, and tidal range for port operations planning',
    resource: 'tides',
  },
  {
    key: 'notices',
    path: '/notices',
    icon: '📢',
    color: '#b45309',
    title: 'Port Notices',
    desc: 'Port authority notices, navigation warnings, operational bulletins, and safety advisories',
    resource: 'notices',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    features.forEach(f => {
      api.getAll(f.resource).then(data => {
        setCounts(prev => ({ ...prev, [f.key]: data.length }));
      }).catch(() => {});
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Maritime AI Dashboard</h1>
          <p>AI-powered shipping and port logistics management platform</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">🚢</div>
          <div className="stat-value">{counts.vessels || 0}</div>
          <div className="stat-label">Active Vessels</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{counts.containers || 0}</div>
          <div className="stat-label">Containers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏗️</div>
          <div className="stat-value">{counts.berths || 0}</div>
          <div className="stat-label">Berth Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{counts.customs || 0}</div>
          <div className="stat-label">Customs Declarations</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {features.map(f => (
          <div key={f.key} className="feature-card" onClick={() => navigate(f.path)}>
            <div className="card-icon" style={{ background: `${f.color}20`, color: f.color }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="card-stats">
              <div className="stat">
                <span className="stat-value">{counts[f.key] || 0}</span>
                <span className="stat-label">Records</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
