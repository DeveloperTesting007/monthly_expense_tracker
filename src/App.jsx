import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageProvider';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import AddTransaction from './pages/AddTransaction.jsx';
import Reports from './pages/Reports.jsx';
import Categories from './pages/Categories';
import Todo from './pages/Todo';

function App() {
  return (
    <MessageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/expenses" element={
                <PrivateRoute>
                  <AddTransaction />
                </PrivateRoute>
              } />
              <Route path="/reports" element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              } />
              <Route path="/settings/categories" element={
                <PrivateRoute>
                  <Categories />
                </PrivateRoute>
              } />
              <Route path="/todo" element={
                <PrivateRoute>
                  <Todo />
                </PrivateRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;
