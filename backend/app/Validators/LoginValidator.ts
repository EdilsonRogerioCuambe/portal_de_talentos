import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class LoginValidator {
  public schema = schema.create({
    email: schema.string({}, [ rules.email() ]),
    password: schema.string({}, [ rules.minLength(6) ]),
  })

  public messages = {
    'email.email': 'Email inválido',
    'password.minLength': 'Senha muito curta',
  }
}
