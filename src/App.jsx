import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import Dashboard from './components/Dashboard.jsx'; 


function App() {
  return (
    <Router>
      <Routes>
        {/* Set Login as the default landing page */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;