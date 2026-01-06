import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Welcome, Onboarding, Goals, Dashboard, AddMeal, Tips, Profile, Diary } from './pages';
import './styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Welcome />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/goals" element={<Goals />} />

        {/* Main App (would be protected in production) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
