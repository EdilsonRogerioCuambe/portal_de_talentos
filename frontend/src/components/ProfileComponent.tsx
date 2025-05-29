import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Plus, Trash2, MapPin, Mail, Phone, Calendar, Building, GraduationCap, Award } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import api from '../api';
import { Education, Skill } from '../types/candidate';

const ProfileComponent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    cep: '',
    address: '',
    city: '',
    state: '',
    skills: [] as Skill[],
    educations: [] as Education[]
  });
  const [newEducation, setNewEducation] = useState({
    institution: '',
    courseName: '',
    concludedAt: ''
  });
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const { data } = await api.get('/skills');
        setAvailableSkills(data);
      } catch (error) {
        console.error('Erro ao carregar skills:', error);
      }
    };

    loadSkills();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        cep: user.cep || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        skills: user.skills || [],
        educations: user.educations?.map(edu => ({
          id: edu.id,
          courseName: edu.course_name,
          institution: edu.institution,
          concludedAt: edu.concluded_at
        })) || []
      });
      setSelectedSkills(user.skills?.map(skill => skill.id) || []);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cep }));

    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const { data } = await api.get(`/cep/${cep}`);
        setFormData(prev => ({
          ...prev,
          address: data.address || '',
          city: data.city || '',
          state: data.state || ''
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.courseName && newEducation.concludedAt) {
      setFormData(prev => ({
        ...prev,
        educations: [
          ...prev.educations,
          {
            id: Date.now(),
            ...newEducation
          }
        ]
      }));
      setNewEducation({ institution: '', courseName: '', concludedAt: '' });
      setShowAddEducation(false);
    }
  };

  const handleRemoveEducation = (educationId: number | undefined) => {
    if (typeof educationId === 'undefined') return;
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter(edu => edu.id !== educationId)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birth_date: formData.birth_date,
        cep: formData.cep,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        skills: selectedSkills,
        educations: formData.educations.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          courseName: edu.courseName,
          concludedAt: edu.concludedAt
        }))
      };

      await api.put('/candidate-profile', dataToSend);

      setIsEditing(false);

      alert('Perfil atualizado com sucesso!');

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);

      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      birth_date: user.birth_date || '',
      cep: user.cep || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      skills: user.skills || [],
      educations: user.educations?.map(edu => ({
        id: edu.id,
        courseName: edu.course_name,
        institution: edu.institution,
        concludedAt: edu.concluded_at
      })) || []
    });
    setSelectedSkills(user.skills?.map(skill => skill.id) || []);
    setIsEditing(false);
    setShowAddEducation(false);
    setNewEducation({ institution: '', courseName: '', concludedAt: '' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCep = (cep: string) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Meu Perfil</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Gerencie suas informações pessoais e profissionais
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {user.role === 'candidate' ? 'Candidato' : 'Gestor'}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-8 md:p-10">
          <div className="space-y-8">

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
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Digite seu nome completo"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                      {user.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(user.birth_date)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {user.phone}
                    </p>
                  )}
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
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        name="cep"
                        value={formatCep(formData.cep)}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {cepLoading && (
                        <div className="absolute right-3 top-3.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                      {formatCep(user.cep)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Cidade"
                      readOnly={cepLoading}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                      {user.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="UF"
                      readOnly={cepLoading}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                      {user.state}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Endereço será preenchido automaticamente"
                      readOnly={cepLoading}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                    />
                  ) : (
                    <p className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                      {user.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Habilidades - apenas para candidatos */}
            {user.role === 'candidate' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  Habilidades
                </h2>

                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                    {availableSkills.map(skill => (
                      <label key={skill.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.id)}
                          onChange={() => handleSkillToggle(skill.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.length > 0 ? (
                      user.skills.map(skill => (
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
                )}
              </div>
            )}

            {user.role === 'candidate' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    Formação Acadêmica
                    <span className="text-sm font-normal text-gray-500 ml-2">(Opcional)</span>
                  </h2>
                  {isEditing && (
                    <button
                      onClick={() => setShowAddEducation(!showAddEducation)}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Lista de educações */}
                  {formData.educations?.length > 0 ? (
                    formData.educations.map(education => (
                      <div key={education.id} className="border border-gray-200 rounded-lg p-4 bg-white relative">
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveEducation(education.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <div className="flex items-start space-x-3">
                          <Building className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{education.courseName}</h4>
                            <p className="text-gray-600 mb-1">{education.institution}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Concluído em: {formatDate(education.concludedAt)}
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

                  {isEditing && showAddEducation && (
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 space-y-4">
                      <h4 className="font-medium text-purple-800 mb-3">Nova Formação</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nome do Curso"
                          value={newEducation.courseName}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, courseName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Instituição"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        />
                        <div className="md:col-span-2">
                          <input
                            type="date"
                            value={newEducation.concludedAt}
                            onChange={(e) => setNewEducation(prev => ({ ...prev, concludedAt: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleAddEducation}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => {
                            setShowAddEducation(false);
                            setNewEducation({ institution: '', courseName: '', concludedAt: '' });
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;