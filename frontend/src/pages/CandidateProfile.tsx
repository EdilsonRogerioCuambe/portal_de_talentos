import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Calendar, Building, GraduationCap, Award, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import api from '../api';
import { User as UserType } from '../types/candidate';

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);


  useEffect(() => {
    const loadCandidate = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data } = await api.get(`/candidates/${id}`);
        setCandidate(data);
      } catch (error: any) {
        console.error('Erro ao carregar candidato:', error);
        setError(error.response?.data?.message || 'Erro ao carregar dados do candidato');
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidate();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';

    // Para datas de nascimento, usar apenas a data sem conversão de timezone
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    });
  };

  const reloadCandidate = async () => {
    if (!candidate) return;
    try {
      const { data } = await api.get(`/candidates/${candidate.id}`);
      setCandidate(data);
    } catch {
      // silently fail
    }
  };

  const handleRescheduleInterview = async () => {
    if (!candidate || !interviewDate || !interviewTime) return;
    setIsScheduling(true);
    try {
      await api.put(`/candidates/${candidate.id}/reschedule-interview`, {
        interview_date: interviewDate,
        interview_time: interviewTime,
      });
      alert('Entrevista reagendada com sucesso!');
      setShowInterviewModal(false);
      setInterviewDate('');
      setInterviewTime('');
      setIsRescheduling(false);
      await reloadCandidate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao reagendar entrevista');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!candidate) return;
    if (!window.confirm('Deseja realmente cancelar esta entrevista?')) return;
    setIsCancelling(true);
    try {
      await api.delete(`/candidates/${candidate.id}/cancel-interview`);
      alert('Entrevista cancelada com sucesso!');
      await reloadCandidate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar entrevista');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDateTime = (interviewDate?: string, interviewTime?: string) => {
    if (!interviewDate || !interviewTime) return 'Não informado';

    try {
      // Criar a data usando apenas a parte da data (sem conversão de timezone)
      const dateOnly = interviewDate.split('T')[0]; // Pegar apenas YYYY-MM-DD
      const [year, month, day] = dateOnly.split('-');

      // Criar a data local sem conversão de timezone
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      const formattedDate = date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      return `${formattedDate} às ${interviewTime}`;
    } catch (error) {
      console.error('Erro ao formatar data/hora:', error);
      return 'Data inválida';
    }
  };

  const formatCep = (cep: string) => {
    if (!cep) return 'Não informado';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleScheduleInterview = async () => {
    if (!candidate || !interviewDate || !interviewTime) {
      alert('Por favor, selecione a data e horário da entrevista.');
      return;
    }

    setIsScheduling(true);

    try {
      await api.post(`/candidates/${candidate.id}/schedule-interview`, {
        interview_date: interviewDate,  // Enviar apenas a data (YYYY-MM-DD)
        interview_time: interviewTime   // Enviar apenas o horário (HH:MM)
      });

      alert('Candidato selecionado para entrevista com sucesso!');
      setShowInterviewModal(false);
      setInterviewDate('');
      setInterviewTime('');

      // Recarregar os dados do candidato
      const { data } = await api.get(`/candidates/${candidate.id}`);
      setCandidate(data);
    } catch (error: any) {
      console.error('Erro ao agendar entrevista:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao agendar entrevista. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsScheduling(false);
    }
  };

  const getMinDateTime = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil do candidato...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar perfil</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/candidates"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para lista</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidato não encontrado</h2>
          <Link
            to="/candidates"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para lista</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Perfil do Candidato</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Visualização completa do perfil profissional
            </p>
          </div>
        </div>

        <Link
          to="/candidates"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista</span>
        </Link>

        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-gray-600">{candidate.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Candidato
                  </span>
                  {candidate.selected_for_interview && (
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Selecionado</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              {candidate.selected_for_interview ? (
                <>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Entrevista Agendada</span>
                    </div>
                    <p className="text-sm text-green-600">
                      {formatDateTime(candidate.interview_date, candidate.interview_time)}
                    </p>
                  </div>
                  {/* Botões Reagendar / Cancelar */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setInterviewDate(candidate.interview_date?.split('T')[0] || '');
                        setInterviewTime(candidate.interview_time || '');
                        setIsRescheduling(true);
                        setShowInterviewModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Reagendar
                    </button>
                    <button
                      onClick={handleCancelInterview}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 hover:bg-red-600"
                    >
                      {isCancelling ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowInterviewModal(true);
                    setIsRescheduling(false);
                  }}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg"
                >
                  <Clock className="w-4 h-4 mr-2" /> Agendar Entrevista
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-8 md:p-10">
          <div className="space-y-8">

            {/* Dados Pessoais */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                Dados Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                    {candidate.name || 'Não informado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(candidate.birth_date)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {candidate.email || 'Não informado'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {candidate.phone || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Endereço
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                    {formatCep(candidate.cep)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                    {candidate.city || 'Não informado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                    {candidate.state || 'Não informado'}
                  </p>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                    {candidate.address || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-white" />
                </div>
                Habilidades
              </h2>

              <div className="flex flex-wrap gap-2">
                {candidate.skills?.length > 0 ? (
                  candidate.skills.map(skill => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-sm rounded-full border border-orange-300"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">Nenhuma habilidade cadastrada</p>
                )}
              </div>
            </div>

            {/* Formação */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                Formação Acadêmica
              </h2>

              <div className="space-y-4">
                {candidate.educations?.length > 0 ? (
                  candidate.educations.map(education => (
                    <div key={education.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start space-x-3">
                        <Building className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{education.course_name}</h4>
                          <p className="text-gray-600 mb-1">{education.institution}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Concluído em: {formatDate(education.concluded_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic border border-gray-200 rounded-lg p-4 bg-white text-center">
                    Nenhuma formação cadastrada
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de Agendamento de Entrevista */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Agendar Entrevista</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Entrevista
                </label>
                <input
                  type="date"
                  min={getMinDateTime()}
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setInterviewDate('');
                  setInterviewTime('');
                  setIsRescheduling(false);
                }}
                className="flex-1 border px-4 py-3"
              >
                Fechar
              </button>

              <button
                onClick={isRescheduling ? handleRescheduleInterview : handleScheduleInterview}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {isScheduling || isRescheduling ? 'Reagendar Entrevista' : 'Agendar Entrevista'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;