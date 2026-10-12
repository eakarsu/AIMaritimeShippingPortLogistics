import { useRef as useDemoLoginRef, useState as useDemoLoginState } from 'react';
import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const demoLoginLock = useDemoLoginRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useDemoLoginState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillCredentials = async () => {
    try {
      const creds = await api.getCredentials();
      setEmail(creds.email);
      setPassword(creds.password);
    } catch (err) {
      setEmail(import.meta.env.VITE_DEMO_EMAIL || '');
      setPassword(import.meta.env.VITE_DEMO_PASSWORD || '');
    }
  };

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login((demoLoginCredentials?.email ?? email), (demoLoginCredentials?.password ?? password));
      onLogin(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Maritime AI</h1>
        <p className="subtitle">Shipping & Port Logistics Platform</p>

        <button disabled={demoLoginBusy} className="fill-btn" onClick={async (event) => {
 if (demoLoginLock.current) return;
 demoLoginLock.current = true; setDemoLoginBusy(true);
 const values = {};
 const captureDemoValue = (key, value) => { values[key] = value; return value; };
 try {
  await (async () => {
    try {
      const creds = await api.getCredentials();
      setEmail(captureDemoValue("email", creds.email));
      setPassword(captureDemoValue("password", creds.password));
    } catch (err) {
      setEmail(captureDemoValue("email", import.meta.env.VITE_DEMO_EMAIL || ''));
      setPassword(captureDemoValue("password", import.meta.env.VITE_DEMO_PASSWORD || ''));
    }
  })(event);
  if (values.error || typeof values.email !== 'string' || !values.email || typeof values.password !== 'string' || !values.password) { setError(typeof values.error === 'string' ? values.error : 'Demo credentials are unavailable.'); return; }
  await handleSubmit(event, { email: values.email, password: values.password });
 } finally { demoLoginLock.current = false; setDemoLoginBusy(false); }
}}>
          Log In as Demo
        </button>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maritime.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
