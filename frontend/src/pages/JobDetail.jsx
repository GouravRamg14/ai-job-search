import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetch(API + '/jobs/' + id)
      .then(res => res.json())
      .then(data => setJob(data))
      .catch(console.error);
    fetch(API + '/jobs/' + id + '/similar')
      .then(res => res.json())
      .then(data => setSimilar(data))
      .catch(console.error);
  }, [id]);

  const addToShortlist = () => {
    const list = JSON.parse(localStorage.getItem('shortlist') || '[]');
    if (!list.find(j => j.id === job.id)) {
      list.push(job);
      localStorage.setItem('shortlist', JSON.stringify(list));
      alert('Added to shortlist!');
    }
  };

  if (!job) return <p>Loading...</p>;
  return (
    <div>
      <Link to="/">← Back to list</Link>
      <h1>{job.title}</h1>
      <p><strong>{job.company}</strong> · {job.location} · {job.job_type}</p>
      <p>{job.description}</p>
      <p><strong>Skills:</strong> {job.skills}</p>
      <button onClick={addToShortlist}>Add to shortlist</button>

      <h2>Similar jobs</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {similar.map(j => (
          <li key={j.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
            <Link to={'/job/' + j.id}>{j.title}</Link> — {j.company} · {j.job_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
