import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import SmartMedicalForm from './pages/SmartMedicalForm';
import SearchVisits from './pages/SearchVisits';
import Statistics from './pages/Statistics';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <span>🏥</span> MedRecord
        </NavLink>
        <ul className="nav-links">
          <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Patients</NavLink></li>
          <li><NavLink to="/smart-form" className={({isActive}) => isActive ? 'active' : ''}>Smart Form</NavLink></li>
          <li><NavLink to="/search" className={({isActive}) => isActive ? 'active' : ''}>Search</NavLink></li>
          <li><NavLink to="/statistics" className={({isActive}) => isActive ? 'active' : ''}>Statistics</NavLink></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/smart-form" element={<SmartMedicalForm />} />
        <Route path="/search" element={<SearchVisits />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
