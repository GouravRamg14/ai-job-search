import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Shortlist() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('shortlist') || '[]');
    setList(data);
  }, []);

  const remove = (id) => {
    const newList = list.filter(j => j.id !== id);
    setList(newList);
    localStorage.setItem('shortlist', JSON.stringify(newList));
  };

  return (
    <div>
      <h1>My shortlist</h1>
      {list.length === 0 ? (
        <p>No jobs in shortlist. <Link to="/">Browse jobs</Link></p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map(j => (
            <li key={j.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 8 }}>
              <Link to={'/job/' + j.id}>{j.title}</Link> — {j.company}
              <button onClick={() => remove(j.id)} style={{ marginLeft: 10 }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
