import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class UpdateProfileValidator {
  public schema = schema.create({
    name: schema.string.optional({ trim: true }),
    phone: schema.string.optional({}, [rules.regex(/^\+?\d{8,15}$/)]),
    cep: schema.string.optional({}, [rules.regex(/^\d{8}$/)]),
    address: schema.string.optional({ trim: true }),
    city: schema.string.optional({ trim: true }),
    state: schema.string.optional({ trim: true }, [rules.maxLength(2)]),
    skills: schema.array.optional().members(
      schema.number([rules.exists({ table: "skills", column: "id" })])
    ),
    educations: schema.array.optional().members(
      schema.object().members({
        institution: schema.string({ trim: true }),
        concludedAt: schema.date({ format: "yyyy-MM-dd" }),
        courseName: schema.string({ trim: true }),
      })
    ),
  });

  public messages = {
    "name.string": "O nome deve ser uma string",
    "phone.string": "O telefone deve ser uma string",
    "phone.regex": "O telefone deve estar no formato +5511999999999",
    "cep.string": "O CEP deve ser uma string",
    "cep.regex": "O CEP deve conter 8 dígitos",
    "address.string": "O endereço deve ser uma string",
    "city.string": "A cidade deve ser uma string",
    "state.string": "O estado deve ser uma string de 2 letras",
    "state.maxLength": "O estado deve ter no máximo 2 caracteres",

    "skills.array": "Skills deve ser um array",
    "skills.*.number": "Cada skill deve ser um número (ID)",
    "skills.*.exists": "Skill não encontrada",

    "educations.array": "Educações deve ser um array",
    "educations.*.object": "Cada educação deve ser um objeto",
    "educations.*.institution.string": "Instituição deve ser uma string",
    "educations.*.institution.required": "Instituição é obrigatória",
    "educations.*.concludedAt.date":
      "Data de conclusão deve ser uma data válida",
    "educations.*.concludedAt.format":
      "Data de conclusão deve estar no formato YYYY-MM-DD",
    "educations.*.concludedAt.required": "Data de conclusão é obrigatória",
    "educations.*.courseName.string": "Nome do curso deve ser uma string",
    "educations.*.courseName.required": "Nome do curso é obrigatório",
  };
}
