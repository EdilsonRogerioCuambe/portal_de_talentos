import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class CreateCandidateValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(100)]),

    birthDate: schema.date({ format: "yyyy-MM-dd" }, [rules.before("today")]),

    password: schema.string({ trim: true }, [
      rules.minLength(6),
      rules.maxLength(50),
      rules.confirmed(),
    ]),

    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: "users", column: "email" }),
    ]),

    phone: schema.string({ trim: true }, [
      rules.regex(/^\+?\d{8,15}$/),
      rules.unique({ table: "users", column: "phone" }),
    ]),

    cep: schema.string({ trim: true }, [rules.regex(/^\d{8}$/)]),
    role: schema.enum.optional(["candidate", "manager"] as const),

    address: schema.string.optional({ trim: true }),
    city: schema.string.optional({ trim: true }),
    state: schema.string.optional({ trim: true }, [rules.maxLength(2)]),

    educations: schema.array.optional().members(
      schema.object().members({
        courseName: schema.string({ trim: true }, [rules.maxLength(100)]),
        institution: schema.string({ trim: true }, [rules.maxLength(100)]),
        concludedAt: schema.date({ format: "yyyy-MM-dd" }),
      })
    ),

    skills: schema.array.optional().members(
      schema.number([
        rules.exists({ table: "skills", column: "id" }),
      ])
    ),
  });

  public messages = {
    "name.required": "O nome é obrigatório",
    "name.maxLength": "O nome não pode exceder 100 caracteres",

    "password.required": "A senha é obrigatória",
    "password.minLength": "A senha deve ter pelo menos 6 caracteres",
    "password.maxLength": "A senha não pode exceder 50 caracteres",

    "birthDate.required": "A data de nascimento é obrigatória",
    "birthDate.format": "A data de nascimento deve estar em YYYY-MM-DD",
    "birthDate.before": "A data de nascimento não pode ser no futuro",

    "email.required": "O e-mail é obrigatório",
    "email.email": "Informe um e-mail válido",
    "email.unique": "Este e-mail já está cadastrado",

    "phone.required": "O telefone é obrigatório",
    "phone.regex": "Informe um telefone válido (somente dígitos, opcional +)",
    "phone.unique": "Este telefone já está cadastrado",

    "cep.required": "O CEP é obrigatório",
    "cep.regex": "O CEP deve conter exatamente 8 dígitos",

    "address.required": "O logradouro (endereço) é obrigatório",
    "city.required": "A cidade é obrigatória",
    "state.required": "O estado (UF) é obrigatório",
    "state.maxLength": "O estado deve ter 2 caracteres",

    "educations.array": "Formações deve ser uma lista",
    "educations.*.courseName.required": "O nome do curso é obrigatório",
    "educations.*.institution.required": "O nome da instituição é obrigatório",
    "educations.*.concludedAt.required": "A data de conclusão é obrigatória",
    "educations.*.concludedAt.format":
      "A data de conclusão deve ser YYYY-MM-DD",

    "skills.array": "Habilidades deve ser uma lista",
    "skills.*.enum": "Habilidade inválida",
  };
}
