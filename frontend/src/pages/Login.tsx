import React, { useContext, useState } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      alert('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Entrar</h2>

        <label className="block mb-2">
          <span className="text-gray-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Senha</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>

        <p className="mt-4 text-center">
          Não tem conta?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  )
}

export default Login