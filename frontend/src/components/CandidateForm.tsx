import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import api from '../api'
import { Education, SkillOption, User } from '../types/candidate'
import { EducationFields } from '../components/EducationFields'
import { SkillsSelect } from '../components/SkillsSelect'

interface FormValues {
  name: string
  birthDate: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  cep: string
  address: string
  city: string
  state: string
  educations: Education[]
  skills: number[]
}

const schema = Yup.object({
  name: Yup.string().required('O nome é obrigatório'),
  birthDate: Yup.date().required('A data de nascimento é obrigatória'),
  email: Yup.string().email('E-mail inválido').required('O e-mail é obrigatório'),
  password: Yup.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
    .required('A senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
    .required('A confirmação de senha é obrigatória'),
  phone: Yup.string().required('O telefone é obrigatório'),
  cep: Yup.string().required('O CEP é obrigatório'),
  address: Yup.string().required(),
  city: Yup.string().required(),
  state: Yup.string().required(),
  educations: Yup.array()
    .of(
      Yup.object({
        institution: Yup.string(),
        concludedAt: Yup.date(),
        courseName: Yup.string(),
      }),
    ),
  skills: Yup.array(),
})

export const CandidateForm: React.FC = () => {
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get<SkillOption[]>('/skills').then(r =>
      setSkillOptions(
        r.data.map(skill => ({
          id: skill.id,
          name: skill.name,
        }))
      )
    )
  }, [])

  const fetchAddress = async (
    cep: string,
    setFieldValue: FormikHelpers<FormValues>['setFieldValue']
  ) => {
    try {
      const { data } = await api.get(`/cep/${cep}`)
      console.log('Address fetched:', data)

      const address = data.address || data.logradouro || ''
      const neighborhood = data.neighborhood || data.bairro || ''
      const city = data.city || data.localidade || ''
      const state = data.state || data.uf || ''

      const fullAddress = neighborhood
        ? `${address}, ${neighborhood}`
        : address

      setFieldValue('address', fullAddress)
      setFieldValue('city', city)
      setFieldValue('state', state)

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setFieldValue('address', '')
      setFieldValue('city', '')
      setFieldValue('state', '')
      alert('CEP inválido ou não encontrado.')
    }
  }

  const initialValues: FormValues = {
    name: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cep: '',
    address: '',
    city: '',
    state: '',
    educations: [],
    skills: [],
  }

  const onSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    console.log('Form values:', values)
    console.log('Skill options available:', skillOptions)
    console.log('Selected skills:', values.skills)

    const validEducations = values.educations.filter(edu =>
      edu.courseName && edu.institution && edu.concludedAt
    );

    const payload = {
      name: values.name,
      birthDate: values.birthDate,
      email: values.email,
      password: values.password,
      password_confirmation: values.confirmPassword,
      phone: values.phone,
      cep: values.cep,
      address: values.address,
      city: values.city,
      state: values.state,
      educations: validEducations.map(e => ({
        courseName: e.courseName,
        institution: e.institution,
        concludedAt: e.concludedAt,
      })),
      skills: values.skills
        .map(skillId => parseInt(String(skillId)))
        .filter(skillId =>
          !isNaN(skillId) &&
          skillOptions.some(option => option.id === skillId)
        ),
    }

    try {
      await api.post<User>('/auth/register', payload)
      alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err: any) {
      if (err.response?.data?.errors) {
        const apiErrors: any = {}

        for (const error of err.response.data.errors) {
          const fieldPath = error.field

          if (fieldPath.includes('.')) {
            const pathParts = fieldPath.split('.')

            if (pathParts[0] === 'educations') {
              const index = parseInt(pathParts[1])
              const fieldName = pathParts[2]

              if (!apiErrors.educations) {
                apiErrors.educations = []
              }
              if (!apiErrors.educations[index]) {
                apiErrors.educations[index] = {}
              }
              apiErrors.educations[index][fieldName] = error.message
            } else if (pathParts[0] === 'skills') {
              apiErrors.skills = 'Uma ou mais habilidades são inválidas'
            } else {
              apiErrors[fieldPath] = error.message
            }
          } else {
            apiErrors[fieldPath] = error.message
          }
        }

        actions.setErrors(apiErrors)
      } else {
        alert('Ocorreu um erro. Tente novamente.')
      }
    } finally {
      actions.setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cadastro de Candidato
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Preencha suas informações para se cadastrar em nossa plataforma
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border-2 border-zinc-800 p-8 md:p-10">
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={onSubmit}
          >
            {formik => (
              <Form className="space-y-8">

                {/* Dados Pessoais */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    Dados Pessoais
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo *
                      </label>
                      <Field
                        name="name"
                        placeholder="Digite seu nome completo"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1 flex items-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de nascimento *
                      </label>
                      <Field
                        name="birthDate"
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="birthDate"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <Field
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha *
                      </label>
                      <Field
                        name="password"
                        type="password"
                        placeholder="Digite sua senha"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, incluindo letra maiúscula, minúscula e número
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar senha *
                      </label>
                      <Field
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <Field
                        name="phone"
                        placeholder="(00) 00000-0000"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    Endereço
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                      </label>
                      <Field
                        name="cep"
                        placeholder="00000-000"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          fetchAddress(e.target.value, formik.setFieldValue)
                        }
                      />
                      <ErrorMessage
                        name="cep"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                      </label>
                      <Field
                        name="address"
                        placeholder="Endereço será preenchido automaticamente"
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-600 bg-gray-100 cursor-not-allowed"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <Field
                        name="city"
                        placeholder="Cidade"
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-600 bg-gray-100 cursor-not-allowed"
                      />
                      <ErrorMessage
                        name="city"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <Field
                        name="state"
                        placeholder="UF"
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-600 bg-gray-100 cursor-not-allowed"
                      />
                      <ErrorMessage
                        name="state"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Formação */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    Formação Acadêmica
                    <span className="text-sm font-normal text-gray-500 ml-2">(Opcional)</span>
                  </h2>
                  <EducationFields />
                </div>

                {/* Habilidades */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    Habilidades
                  </h2>
                  <Field
                    name="skills"
                    component={SkillsSelect}
                    options={skillOptions}
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {formik.isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Finalizar Cadastro'
                    )}
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Já possui uma conta? <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Fazer login</a></p>
        </div>
      </div>
    </div>
  )
}