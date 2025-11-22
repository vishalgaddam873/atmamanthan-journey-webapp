import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MirrorDisplay from './components/MirrorScreen/MirrorDisplay';
import TableScreen from './components/TableScreen/TableScreen';
import AdminDashboard from './components/Admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/mirror" element={<MirrorDisplay />} />
        <Route path="/table" element={<TableScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

