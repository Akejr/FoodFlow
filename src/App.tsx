import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Welcome, Login, Onboarding, Goals, Dashboard, AddMeal, Tips, Profile, Diary } from './pages';
import { BodyAnalysis } from './pages/BodyAnalysis/BodyAnalysis';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (only for non-authenticated) */}
          <Route path="/" element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/onboarding" element={
            <PublicRoute>
              <Onboarding />
            </PublicRoute>
          } />
          <Route path="/goals" element={
            <PublicRoute>
              <Goals />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/add-meal" element={
            <ProtectedRoute>
              <AddMeal />
            </ProtectedRoute>
          } />
          <Route path="/tips" element={
            <ProtectedRoute>
              <Tips />
            </ProtectedRoute>
          } />
          <Route path="/diary" element={
            <ProtectedRoute>
              <Diary />
            </ProtectedRoute>
          } />
          <Route path="/body-analysis" element={
            <ProtectedRoute>
              <BodyAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
