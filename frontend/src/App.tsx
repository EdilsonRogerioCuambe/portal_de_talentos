import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PrivateRoute } from './auth/PrivateRoute'
import Login from './pages/Login'
import RegisterCandidatePage from './pages/RegisterCandidatePage'
import CandidateList from './pages/CandidateList'
import CandidateProfile from './pages/CandidateProfile'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import { PublicRoute } from './auth/PublicRoute'

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Rotas públicas - redireciona se logado */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterCandidatePage />
            </PublicRoute>
          }
        />

        {/* Rotas protegidas - Gestor */}
        <Route
          path="/candidates"
          element={
            <PrivateRoute roles={['manager']}>
              <CandidateList />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute roles={['manager', 'candidate']}>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Rotas protegidas - Gestor e Candidato */}
        <Route
          path="/candidates/:id"
          element={
            <PrivateRoute roles={['manager', 'candidate']}>
              <CandidateProfile />
            </PrivateRoute>
          }
        />

        {/* Rota 404 - redireciona para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App