import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Shortlist from './pages/Shortlist';

const API = 'http://localhost:5000/api';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
        <nav style={{ marginBottom: 20 }}>
          <a href="/" style={{ marginRight: 15 }}>Home</a>
          <a href="/shortlist">Shortlist</a>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/shortlist" element={<Shortlist />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
export { API };
