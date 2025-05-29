import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { User, Search, Award, Eye, CheckCircle, Mail, Phone } from 'lucide-react';
import { User as UserType } from '../types/candidate';

interface PaginateResponse<T> {
  meta: { total: number; perPage: number; currentPage: number; lastPage: number };
  data: T[];
}

const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<UserType[]>([]);
  const [filter, setFilter] = useState({ name: '', skill: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar candidatos com debounce
  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      // Só adiciona os parâmetros se não estiverem vazios
      if (filter.name.trim()) {
        params.search = filter.name.trim();
      }

      if (filter.skill.trim()) {
        params.skills = filter.skill.trim();
      }

      console.log('Parâmetros da busca:', params); // Para debug

      const response = await api.get<PaginateResponse<UserType>>('/candidates', {
        params
      });

      if (Array.isArray(response.data.data)) {
        setCandidates(response.data.data);
      } else {
        console.warn('Esperado um array de candidatos, mas recebeu:', response.data.data);
        setError('Formato de dados inválido recebido do servidor');
        setCandidates([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar candidatos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar candidatos');
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.name, filter.skill]);

  // Debounce para evitar muitas requisições
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCandidates();
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [loadCandidates]);

  // Função para limpar filtros
  const clearFilters = () => {
    setFilter({ name: '', skill: '' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando candidatos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar candidatos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => loadCandidates()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Candidatos</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Gerencie e visualize todos os candidatos cadastrados
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Filtros de Busca</h2>
            </div>

            {(filter.name || filter.skill) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nome
              </label>
              <input
                type="text"
                placeholder="Digite o nome do candidato..."
                value={filter.name}
                onChange={(e) => setFilter(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por habilidade
              </label>
              <input
                type="text"
                placeholder="Digite a habilidade..."
                value={filter.skill}
                onChange={(e) => setFilter(f => ({ ...f, skill: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Indicador de filtros ativos */}
          {(filter.name || filter.skill) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Filtros ativos:</strong>{' '}
                {filter.name && `Nome: "${filter.name}"`}
                {filter.name && filter.skill && ' | '}
                {filter.skill && `Habilidade: "${filter.skill}"`}
              </p>
            </div>
          )}
        </div>

        {/* Lista de candidatos */}
        <div className="bg-white rounded-2xl border-2 border-zinc-800 overflow-hidden">
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {(filter.name || filter.skill) ? 'Nenhum candidato encontrado' : 'Nenhum candidato cadastrado'}
              </h3>
              <p className="text-gray-600">
                {(filter.name || filter.skill)
                  ? 'Tente ajustar os filtros de busca para encontrar candidatos.'
                  : 'Aguarde novos cadastros de candidatos.'
                }
              </p>
              {(filter.name || filter.skill) && (
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Header da tabela */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                <div className="grid grid-cols-12 gap-4 items-center font-semibold">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-3">Candidato</div>
                  <div className="col-span-3">Contato</div>
                  <div className="col-span-3">Habilidades</div>
                  <div className="col-span-2">Ações</div>
                </div>
              </div>

              {/* Corpo da tabela */}
              <div className="divide-y divide-gray-200">
                {candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* ID */}
                      <div className="col-span-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {candidate.id}
                        </span>
                      </div>

                      {/* Candidato */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {candidate.selected_for_interview && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Entrevista
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contato */}
                      <div className="col-span-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-2" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-2" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Habilidades */}
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills && candidate.skills.length > 0 ? (
                            candidate.skills.slice(0, 3).map(skill => (
                              <span
                                key={skill.id}
                                className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium"
                              >
                                <Award className="w-3 h-3 mr-1" />
                                {skill.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm italic">Não informado</span>
                          )}
                          {candidate.skills && candidate.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{candidate.skills.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="col-span-2">
                        <div className="flex space-x-2">
                          <Link
                            to={`/candidates/${candidate.id}`}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com informações */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Total de candidatos encontrados: <span className="font-semibold">{candidates.length}</span>
            {(filter.name || filter.skill) && (
              <span className="ml-2 text-blue-600">(com filtros aplicados)</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateList;