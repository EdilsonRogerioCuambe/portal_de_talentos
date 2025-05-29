import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import CreateUserValidator from "App/Validators/CreateUserValidator";
import LoginValidator from "App/Validators/LoginValidator";
import Database from "@ioc:Adonis/Lucid/Database";
import Logger from "@ioc:Adonis/Core/Logger";
import Mail from "@ioc:Adonis/Addons/Mail";
import axios from "axios";

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateUserValidator);

    let addressData = {};
    try {
      const cepResponse = await axios.get(
        `https://viacep.com.br/ws/${data.cep}/json/`
      );
      if (!cepResponse.data.erro) {
        addressData = {
          address: cepResponse.data.logradouro,
          city: cepResponse.data.localidade,
          state: cepResponse.data.uf,
        };
      }
    } catch {
      addressData = {
        address: data.address,
        city: data.city,
        state: data.state,
      };
    }

    try {
      const user = await Database.transaction(async (trx) => {
        const createdUser = await User.create(
          {
            name: data.name,
            birthDate: data.birthDate,
            email: data.email,
            phone: data.phone,
            password: data.password,
            cep: data.cep,
            role: data.role || "candidate",
            ...addressData,
          },
          { client: trx }
        );

        if (data.skills && data.skills.length > 0) {
          await createdUser.related("skills").attach(data.skills, trx);
        }

        if (data.educations && data.educations.length > 0) {
          for (const education of data.educations) {
            await createdUser.related("educations").create(
              {
                institution: education.institution,
                concludedAt: education.concludedAt,
                courseName: education.courseName,
              },
              { client: trx }
            );
          }
        }

        return createdUser;
      });

      const userWithRelations = await User.query()
        .where("id", user.id)
        .preload("skills")
        .preload("educations")
        .firstOrFail();

      const { password, ...userWithoutPassword } = userWithRelations.toJSON();

      try {
        await this.sendWelcomeEmail(userWithRelations);
      } catch (emailError) {
        Logger.warn("Erro ao enviar email de boas-vindas:", emailError);
      }

      return response.created({
        message: "Usuário cadastrado com sucesso!",
        user: userWithoutPassword,
      });
    } catch (error) {
      Logger.error("Erro ao criar usuário:", error);

      return response.status(500).send({
        message: "Erro ao criar usuário",
        error: error.message || error,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(LoginValidator);

      const tokenData = await auth.use("api").attempt(email, password, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      });

      const user = await User.query()
        .where("email", email)
        .preload("skills")
        .preload("educations")
        .firstOrFail();

      const { password: _, ...userWithoutPassword } = user.toJSON();

      try {
        await this.sendLoginNotificationEmail(user);
      } catch (emailError) {
        Logger.warn(
          "Erro ao enviar email de notificação de login:",
          emailError
        );
      }

      return response.ok({
        token: tokenData.token,
        user: userWithoutPassword,
      });
    } catch (error) {
      Logger.error("Erro no login:", error);
      return response.status(401).send({
        message: "Credenciais inválidas",
        error: error.message,
      });
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    try {
      await auth.authenticate();

      const user = await User.query()
        .where("id", auth.user!.id)
        .preload("skills")
        .preload("educations")
        .firstOrFail();

      const { password, ...userWithoutPassword } = user.toJSON();

      return response.ok(userWithoutPassword);
    } catch (error) {
      Logger.error("Erro ao buscar dados do usuário:", error);
      return response.status(500).send({
        message: "Erro ao buscar dados do usuário",
      });
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    try {
      await auth.use("api").revoke();
      return response.noContent();
    } catch (error) {
      Logger.error("Erro no logout:", error);
      return response.status(500).send({
        message: "Erro ao fazer logout",
      });
    }
  }

  private async sendWelcomeEmail(user: User) {
    const welcomeHtml = `
    <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Portal de Talentos</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .highlight {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Portal de Talentos</h1>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                <strong>Olá, ${user.name}!</strong>
            </div>
            
            <p>Seja muito bem-vindo(a) ao <strong>Portal de Talentos</strong>! 🚀</p>
            
            <p>Estamos muito felizes em tê-lo conosco. Sua conta foi criada com sucesso e agora você pode:</p>
            
            <div class="highlight">
                <ul>
                    <li>✅ Completar seu perfil profissional</li>
                    <li>✅ Adicionar suas habilidades e experiências</li>
                    <li>✅ Buscar por oportunidades de trabalho</li>
                    <li>✅ Conectar-se com recrutadores</li>
                    <li>✅ Participar de processos seletivos</li>
                </ul>
            </div>
            
            <p>Para começar, acesse nossa plataforma e explore todas as funcionalidades disponíveis:</p>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Acessar Portal de Talentos</a>
            </div>
            
            <p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco. Estamos aqui para ajudá-lo a encontrar as melhores oportunidades!</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p><strong>Portal de Talentos</strong> - Conectando talentos às melhores oportunidades</p>
            <p>© 2025 Portal de Talentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
  `;

    await Mail.send((message) => {
      message
        .from(process.env.MAIL_FROM_ADDRESS!, process.env.MAIL_FROM_NAME!)
        .to(user.email)
        .subject("Bem-vindo ao Portal de Talentos!")
        .html(welcomeHtml);
    });
  }

  public async testEmail({ response }: HttpContextContract) {
    try {
      await Mail.send((message) => {
        message
          .from(process.env.MAIL_FROM_ADDRESS!, process.env.MAIL_FROM_NAME!)
          .to("edicuambe@gmail.com")
          .subject("Test Email - Portal de Talentos")
          .html(
            "<h1>Email configuration is working!</h1><p>This is a test email.</p>"
          );
      });

      return response.ok({
        message: "Email sent successfully!",
      });
    } catch (error) {
      Logger.error("Email test failed:", error);
      return response.status(500).send({
        message: "Email test failed",
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  private async sendLoginNotificationEmail(user: User) {
    const now = new Date();
    const loginTime = now.toLocaleString("pt-BR", {
      timeZone: "America/Fortaleza",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const loginNotificationHtml = `
    <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Acesso - Portal de Talentos</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #28a745;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #28a745;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .login-info {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
        }
        .login-time {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
        }
        .security-notice {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #218838;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .icon {
            font-size: 24px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Portal de Talentos</h1>
        </div>
        
        <div class="content">
            <p><strong>Olá, ${user.name}!</strong></p>
            
            <p>Detectamos um novo acesso à sua conta no Portal de Talentos.</p>
            
            <div class="login-info">
                <p><span class="icon">📅</span><strong>Data e Hora do Acesso:</strong></p>
                <p class="login-time">${loginTime}</p>
            </div>
            
            <div class="security-notice">
                <p><span class="icon">⚠️</span><strong>Importante:</strong></p>
                <p>Se este acesso foi realizado por você, pode ignorar este email. Caso contrário, recomendamos que você:</p>
                <ul>
                    <li>Altere sua senha imediatamente</li>
                    <li>Verifique a segurança da sua conta</li>
                    <li>Entre em contato conosco se suspeitar de atividade não autorizada</li>
                </ul>
            </div>
            
            <p>Para acessar sua conta ou alterar sua senha, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Acessar Minha Conta</a>
            </div>
            
            <p>Sua segurança é nossa prioridade. Mantenha sempre suas credenciais seguras e não as compartilhe com terceiros.</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático de segurança, por favor não responda.</p>
            <p><strong>Portal de Talentos</strong> - Sua segurança em primeiro lugar</p>
            <p>© 2025 Portal de Talentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
  `;

    await Mail.send((message) => {
      message
        .from(process.env.MAIL_FROM_ADDRESS!, process.env.MAIL_FROM_NAME!)
        .to(user.email)
        .subject("Novo acesso ao Portal de Talentos")
        .html(loginNotificationHtml);
    });
  }
}
