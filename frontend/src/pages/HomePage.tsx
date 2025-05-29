// src/pages/HomePage.tsx
import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';
import { HomeHeader } from '../components/HomeHeader';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomeHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isAuthenticated ? (
          // Usuário logado - Dashboard personalizado
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo de volta, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {user?.role === 'manager'
                ? 'Gerencie candidatos e encontre os melhores talentos'
                : 'Acompanhe seu perfil e oportunidades'
              }
            </p>

            {/* Cards de ação rápida */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {user?.role === 'manager' ? (
                // Cards para gestor
                <>
                  <Link
                    to="/candidates"
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                  >
                    <div className="flex items-center mb-4">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-900">Ver Candidatos</h3>
                    </div>
                    <p className="text-gray-600">
                      Visualize e gerencie todos os candidatos cadastrados no portal
                    </p>
                  </Link>

                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center mb-4">
                      <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-900">Recursos</h3>
                    </div>
                    <ul className="text-gray-600 space-y-2">
                      <li>• Buscar por nome e habilidades</li>
                      <li>• Selecionar para entrevistas</li>
                      <li>• Visualizar perfis completos</li>
                    </ul>
                  </div>
                </>
              ) : (
                // Cards para candidato
                <>
                  <Link
                    to={`/profile`}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                  >
                    <div className="flex items-center mb-4">
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-900">Meu Perfil</h3>
                    </div>
                    <p className="text-gray-600">
                      Visualize e atualize suas informações pessoais e profissionais
                    </p>
                  </Link>

                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center mb-4">
                      <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-1h8a1 1 0 011 1v4" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-900">Status</h3>
                    </div>
                    <p className="text-gray-600">
                      Acompanhe notificações sobre seleções para entrevistas
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          // Usuário não logado - Landing page
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Portal de Talentos
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Conectando talentos excepcionais com oportunidades únicas.
              Cadastre-se como candidato ou acesse como gestor para encontrar os melhores profissionais.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Candidatos</h3>
                <p className="text-gray-600">
                  Cadastre seu perfil profissional, formações e habilidades para ser descoberto por recrutadores
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Gestores</h3>
                <p className="text-gray-600">
                  Encontre candidatos ideais através de filtros avançados por habilidades e experiência
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processo Simples</h3>
                <p className="text-gray-600">
                  Sistema automatizado de notificações e agendamento de entrevistas
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Cadastrar como Candidato
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-gray-200 text-gray-800 text-lg font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acessar como Gestor
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;