import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import UpdateProfileValidator from "App/Validators/UpdateProfileValidator";
import Logger from "@ioc:Adonis/Core/Logger";
import axios from "axios";

export default class UserController {
  public async getCepData({ params, response }: HttpContextContract) {
    try {
      const { cep } = params;

      const cleanCep = cep.replace(/\D/g, "");

      if (cleanCep.length !== 8) {
        return response.badRequest({
          message: "CEP deve conter 8 dígitos",
        });
      }

      const cepResponse = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
        {
          timeout: 5000,
          headers: {
            "User-Agent": "Application",
          },
        }
      );

      if (cepResponse.data.erro) {
        return response.notFound({
          message: "CEP não encontrado",
        });
      }

      const addressData = {
        logradouro: cepResponse.data.logradouro || "",
        localidade: cepResponse.data.localidade || "",
        uf: cepResponse.data.uf || "",
        bairro: cepResponse.data.bairro || "",

        address: cepResponse.data.logradouro || "",
        city: cepResponse.data.localidade || "",
        state: cepResponse.data.uf || "",
        neighborhood: cepResponse.data.bairro || "",

        cep: cepResponse.data.cep || cleanCep,
        complemento: cepResponse.data.complemento || "",
        unidade: cepResponse.data.unidade || "",
        ibge: cepResponse.data.ibge || "",
        gia: cepResponse.data.gia || "",
        ddd: cepResponse.data.ddd || "",
        siafi: cepResponse.data.siafi || "",
      };

      return response.ok(addressData);
    } catch (error) {
      Logger.error("Erro ao buscar CEP:", {
        error: error.message,
        stack: error.stack,
        cep: params.cep,
      });

      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return response.status(408).send({
          message: "Timeout ao buscar CEP. Tente novamente.",
        });
      }

      if (error.response?.status === 404) {
        return response.notFound({
          message: "CEP não encontrado",
        });
      }

      return response.badRequest({
        message: "Erro ao buscar CEP. Verifique se o CEP está correto.",
      });
    }
  }

  public async profile({ auth, response }: HttpContextContract) {
    await auth.authenticate();
    const userId = auth.user!.id;
    const user = await User.query()
      .where("id", userId)
      .preload("skills")
      .preload("educations")
      .firstOrFail();

    return response.ok(user);
  }

  public async updateProfile({ auth, request, response }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user!;

    try {
      const data = await request.validate(UpdateProfileValidator);

      await Database.transaction(async (trx) => {
        const basicData = { ...data };
        delete basicData.skills;
        delete basicData.educations;

        user.useTransaction(trx);
        await user.merge(basicData).save();

        if (data.skills !== undefined) {
          await user.related("skills").detach([], trx);

          if (data.skills && data.skills.length > 0) {
            await user.related("skills").attach(data.skills, trx);
          }
        }

        if (data.educations !== undefined) {
          await Database.from("educations")
            .where("user_id", user.id)
            .delete()
            .useTransaction(trx);

          if (data.educations && data.educations.length > 0) {
            for (const education of data.educations) {
              await user.related("educations").create(
                {
                  institution: education.institution,
                  concludedAt: education.concludedAt,
                  courseName: education.courseName,
                },
                { client: trx }
              );
            }
          }
        }
      });

      const updatedUser = await User.query()
        .where("id", user.id)
        .preload("skills")
        .preload("educations")
        .firstOrFail();

      return response.ok({
        message: "Perfil atualizado com sucesso",
        user: updatedUser,
      });
    } catch (error) {
      Logger.error("Erro ao atualizar perfil:", error);
      return response.status(500).send({
        message: "Erro ao atualizar perfil",
        error: error.message || error,
      });
    }
  }

  public async deleteAccount({ auth, response }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user!;

    try {
      await user.delete();
      return response.ok({ message: "Conta deletada com sucesso" });
    } catch (error) {
      Logger.error("Erro ao deletar conta:", error);
      return response.status(500).send({
        message: "Erro ao deletar conta",
        error: error.message || error,
      });
    }
  }
}
