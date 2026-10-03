import { useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { api, setToken } from '../api';

// Shows a simple email + password form.
// Calls onLoginSuccess(user) once the admin is logged in.
export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from refreshing the page
    setError('');
    setIsLoading(true);

    try {
      const data = await api.login(email, password);

      if (!data.user.isAdmin) {
        setError('This account is not an admin.');
        return;
      }

      setToken(data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="brand-mark">
            <Clapperboard size={18} />
          </div>
          <span>Movie Explorer</span>
        </div>

        <h1>Admin sign in</h1>
        <p className="login-sub">Manage users, subscriptions and access for Movie Explorer.</p>

        <label className="field">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
