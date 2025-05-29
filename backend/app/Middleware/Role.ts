import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class Role {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, roles: string[]) {
    const user = auth.user as unknown as User
    if (!user || !roles.includes(user.role)) {
      return response.unauthorized({ message: 'Acesso negado' })
    }
    await next()
  }
}
