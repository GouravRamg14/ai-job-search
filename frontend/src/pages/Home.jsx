import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API + '/jobs')
      .then(res => res.json())
      .then(data => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doSearch = () => {
    if (!search.trim()) return;
    setLoading(true);
    fetch(API + '/search?q=' + encodeURIComponent(search))
      .then(res => res.json())
      .then(data => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div>
      <h1>Job Discovery</h1>
      <div style={{ marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Search jobs (e.g. Python, React)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          style={{ padding: 8, width: 300, marginRight: 8 }}
        />
        <button onClick={doSearch}>Search</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {jobs.map(j => (
            <li key={j.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
              <Link to={'/job/' + j.id} style={{ fontWeight: 'bold' }}>{j.title}</Link>
              <div>{j.company} · {j.location} · {j.job_type}</div>
              <div style={{ fontSize: 14, color: '#666' }}>{j.skills}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
