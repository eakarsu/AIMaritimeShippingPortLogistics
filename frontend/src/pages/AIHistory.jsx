import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AIHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadHistory = async (page = 1) => {
    setLoading(true);
    try {
      const result = await api.aiHistory(page, 20);
      setHistory(result.data || []);
      setPagination(result.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div>
      <div className="back-btn" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </div>

      <div className="page-header">
        <div>
          <h1>🤖 AI Analysis History</h1>
          <p>{pagination.total} analyses recorded</p>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading history...</p></div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No AI analyses yet. Run an AI analysis from any feature page.
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Endpoint</th>
                    <th>Timestamp</th>
                    <th>Input Filters</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleExpand(item.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{(pagination.page - 1) * 20 + i + 1}</td>
                        <td>
                          <span className="badge badge-blue">{item.endpoint}</span>
                        </td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {JSON.stringify(item.input_filters)}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-ghost">
                            {expanded === item.id ? 'Hide' : 'View'} Result
                          </button>
                        </td>
                      </tr>
                      {expanded === item.id && (
                        <tr>
                          <td colSpan={5}>
                            <div style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              padding: 16,
                              margin: '4px 0',
                              maxHeight: 400,
                              overflowY: 'auto',
                            }}>
                              <strong>Input Filters:</strong>
                              <pre style={{ fontSize: 12, marginBottom: 12 }}>
                                {JSON.stringify(item.input_filters, null, 2)}
                              </pre>
                              <strong>Result:</strong>
                              <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {typeof item.result === 'object'
                                  ? JSON.stringify(item.result, null, 2)
                                  : item.result}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={pagination.page <= 1}
                  onClick={() => loadHistory(pagination.page - 1)}
                >
                  Prev
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadHistory(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
