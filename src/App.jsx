import { useState } from 'react';
import LoginPage from './LoginPage.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  // Very simple: not logged in -> show LoginPage. Logged in -> show Dashboard.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard />;
}
