import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      const timeout = setTimeout(() => {
        searchUsers();
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.search(query);
      setResults(data);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="search-page">
        <h1>Search</h1>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {loading && <div className="loading">Searching...</div>}

        {!loading && query.length > 0 && results.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}

        <div className="search-results">
          {results.map((user) => (
            <Link key={user.id} to={`/profile/${user.id}`} className="search-result">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="avatar" />
              ) : (
                <div className="avatar">{user.username[0].toUpperCase()}</div>
              )}
              <div>
                <strong>{user.display_name || user.username}</strong>
                <div className="search-username">@{user.username}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
