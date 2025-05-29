import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { DateTime } from "luxon";
import Mail from "@ioc:Adonis/Addons/Mail";
import Logger from "@ioc:Adonis/Core/Logger";

export default class ManagerController {
  public async listCandidates({
    auth,
    response,
    request,
  }: HttpContextContract) {
    await auth.authenticate();

    const user = auth.user as unknown as User;
    if (user.role !== "manager") {
      return response.forbidden({ message: "Acesso negado" });
    }

    const { page = 1, limit = 10, search, skills } = request.qs();

    const query = User.query()
      .where("role", "candidate")
      .preload("skills")
      .preload("educations");

    if (search && search.trim()) {
      query.where("name", "LIKE", `%${search.trim()}%`);
    }

    if (skills && skills.trim()) {
      query.whereHas("skills", (skillQuery) => {
        skillQuery.where("name", "LIKE", `%${skills.trim()}%`);
      });
    }

    const candidates = await query.paginate(page, limit);
    return response.ok(candidates);
  }

  public async scheduleInterview({
    auth,
    response,
    params,
    request,
  }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user! as unknown as User;

    if (user.role !== "manager") {
      return response.forbidden({ message: "Acesso negado" });
    }

    const { interview_date, interview_time } = request.only([
      "interview_date",
      "interview_time",
    ]);

    if (!interview_date || !interview_time) {
      return response.badRequest({
        message: "Data e horário da entrevista são obrigatórios",
      });
    }

    const candidate = await User.find(params.id);
    if (!candidate || candidate.role !== "candidate") {
      return response.notFound({ message: "Candidato não encontrado" });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(interview_time)) {
      return response.badRequest({
        message: "Formato de horário inválido. Use HH:MM",
      });
    }

    const interviewDate = DateTime.fromISO(interview_date);
    if (!interviewDate.isValid) {
      return response.badRequest({
        message: "Formato de data inválido",
      });
    }

    const [hours, minutes] = interview_time.split(":").map(Number);
    const fullInterviewDateTime = interviewDate.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });

    if (fullInterviewDateTime <= DateTime.now()) {
      return response.badRequest({
        message: "A data e horário da entrevista devem ser futuros",
      });
    }

    if (hours < 8 || hours > 18) {
      return response.badRequest({
        message: "Horário deve estar entre 08:00 e 18:00",
      });
    }

    candidate.selectedForInterview = true;
    candidate.interviewDate = interviewDate;
    candidate.interviewTime = interview_time;
    await candidate.save();

    try {
      await this.sendInterviewScheduledEmail(
        candidate,
        user,
        interviewDate,
        interview_time
      );
    } catch (emailError) {
      Logger.warn(
        "Erro ao enviar email de agendamento de entrevista:",
        emailError
      );
    }

    return response.ok({
      message: "Candidato selecionado para entrevista com sucesso",
      interview_date: interviewDate.toFormat("dd/MM/yyyy"),
      interview_time: candidate.interviewTime,
    });
  }

  public async showCandidate({ auth, params, response }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user! as unknown as User;

    if (user.role !== "manager") {
      return response.forbidden({ message: "Acesso negado" });
    }

    const candidate = await User.query()
      .where("id", params.id)
      .where("role", "candidate")
      .preload("skills")
      .preload("educations")
      .first();

    if (!candidate) {
      return response.notFound({ message: "Candidato não encontrado" });
    }

    return response.ok(candidate);
  }

  public async listScheduledInterviews({
    auth,
    response,
    request,
  }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user! as unknown as User;

    if (user.role !== "manager") {
      return response.forbidden({ message: "Acesso negado" });
    }

    const { page = 1, limit = 10, date } = request.qs();

    const query = User.query()
      .where("role", "candidate")
      .where("selected_for_interview", true)
      .whereNotNull("interview_date")
      .whereNotNull("interview_time")
      .preload("skills")
      .preload("educations")
      .orderBy("interview_date", "asc")
      .orderBy("interview_time", "asc");

    if (date) {
      const filterDate = DateTime.fromISO(date);
      if (filterDate.isValid) {
        query.whereRaw("DATE(interview_date) = ?", [filterDate.toISODate()]);
      }
    }

    const interviews = await query.paginate(page, limit);
    return response.ok(interviews);
  }

  public async rescheduleInterview({
    auth,
    response,
    params,
    request,
  }: HttpContextContract) {
    await auth.authenticate();
    const user = auth.user! as unknown as User;

    if (user.role !== "manager") {
      return response.forbidden({ message: "Acesso negado" });
    }

    const { interview_date, interview_time } = request.only([
      "interview_date",
      "interview_time",
    ]);

    if (!interview_date || !interview_time) {
      return response.badRequest({
        message: "Data e horário da entrevista são obrigatórios",
      });
    }

    const candidate = await User.find(params.id);
    if (
      !candidate ||
      candidate.role !== "candidate" ||
      !candidate.selectedForInterview
    ) {
      return response.notFound({
        message: "Candidato não encontrado ou não selecionado para entrevista",
      });
    }

    const oldDate = candidate.interviewDate;
    const oldTime = candidate.interviewTime;

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(interview_time)) {
      return response.badRequest({
        message: "Formato de horário inválido. Use HH:MM",
      });
    }

    const interviewDate = DateTime.fromISO(interview_date);
    if (!interviewDate.isValid) {
      return response.badRequest({
        message: "Formato de data inválido",
      });
    }

    const [hours, minutes] = interview_time.split(":").map(Number);
    const fullInterviewDateTime = interviewDate.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });

    if (fullInterviewDateTime <= DateTime.now()) {
      return response.badRequest({
        message: "A data e horário da entrevista devem ser futuros",
      });
    }

    candidate.interviewDate = interviewDate;
    candidate.interviewTime = interview_time;
    await candidate.save();

    try {
      await this.sendInterviewRescheduledEmail(
        candidate,
        user,
        oldDate ?? null,
        oldTime ?? null,
        interviewDate,
        interview_time
      );
    } catch (emailError) {
      Logger.warn(
        "Erro ao enviar email de reagendamento de entrevista:",
        emailError
      );
    }

    return response.ok({
      message: "Entrevista reagendada com sucesso",
      interview_date: interviewDate.toFormat("dd/MM/yyyy"),
    });
  }

  private async sendInterviewScheduledEmail(
    candidate: User,
    manager: User,
    interviewDate: DateTime,
    interviewTime: string
  ) {
    const formattedDate = interviewDate.toFormat("dd/MM/yyyy");
    const formattedDateTime = interviewDate.toFormat(
      "EEEE, dd 'de' MMMM 'de' yyyy",
      {
        locale: "pt",
      }
    );

    const emailTemplate = this.getInterviewScheduledTemplate({
      candidateName: candidate.name,
      managerName: manager.name,
      interviewDate: formattedDate,
      interviewTime: interviewTime,
      interviewDateTime: formattedDateTime,
      frontendUrl: process.env.FRONTEND_URL || "#",
    });

    await Mail.send((message) => {
      message
        .from(process.env.MAIL_FROM_ADDRESS!, process.env.MAIL_FROM_NAME!)
        .to(candidate.email)
        .subject("🎯 Entrevista Agendada - Portal de Talentos")
        .html(emailTemplate);
    });
  }

  private async sendInterviewRescheduledEmail(
    candidate: User,
    manager: User,
    oldDate: DateTime | null,
    oldTime: string | null,
    newDate: DateTime,
    newTime: string
  ) {
    const oldFormattedDate = oldDate
      ? oldDate.toFormat("dd/MM/yyyy")
      : "Data anterior";
    const oldFormattedTime = oldTime || "Horário anterior";
    const newFormattedDate = newDate.toFormat("dd/MM/yyyy");
    const newFormattedDateTime = newDate.toFormat(
      "EEEE, dd 'de' MMMM 'de' yyyy",
      {
        locale: "pt",
      }
    );

    const emailTemplate = this.getInterviewRescheduledTemplate({
      candidateName: candidate.name,
      managerName: manager.name,
      oldDate: oldFormattedDate,
      oldTime: oldFormattedTime,
      newDate: newFormattedDate,
      newTime: newTime,
      newDateTime: newFormattedDateTime,
      frontendUrl: process.env.FRONTEND_URL || "#",
    });

    await Mail.send((message) => {
      message
        .from(process.env.MAIL_FROM_ADDRESS!, process.env.MAIL_FROM_NAME!)
        .to(candidate.email)
        .subject("📅 Entrevista Reagendada - Portal de Talentos")
        .html(emailTemplate);
    });
  }

  private getInterviewScheduledTemplate(data: {
    candidateName: string;
    managerName: string;
    interviewDate: string;
    interviewTime: string;
    interviewDateTime: string;
    frontendUrl: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrevista Agendada - Portal de Talentos</title>
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
            border-bottom: 3px solid #17a2b8;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #17a2b8;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .congratulations {
            background: linear-gradient(135deg, #17a2b8, #20c997);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 25px 0;
        }
        .congratulations h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .interview-details {
            background-color: #e8f7fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #17a2b8;
            margin: 25px 0;
        }
        .interview-details h3 {
            color: #17a2b8;
            margin-top: 0;
            font-size: 20px;
        }
        .detail-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 16px;
        }
        .detail-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
        }
        .detail-value {
            font-weight: bold;
            color: #17a2b8;
        }
        .tips-section {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 25px 0;
        }
        .tips-section h4 {
            color: #856404;
            margin-top: 0;
        }
        .tips-list {
            margin: 0;
            padding-left: 20px;
        }
        .tips-list li {
            margin: 8px 0;
            color: #856404;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #17a2b8;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #138496;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .urgent-notice {
            background-color: #f8d7da;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #dc3545;
            margin: 20px 0;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Portal de Talentos</h1>
        </div>
        
        <div class="content">
            <div class="congratulations">
                <h2>🎉 Parabéns, ${data.candidateName}!</h2>
                <p>Você foi selecionado(a) para uma entrevista!</p>
            </div>
            
            <p>Ficamos muito felizes em informar que seu perfil chamou nossa atenção e você foi escolhido(a) para participar de uma entrevista de emprego.</p>
            
            <div class="interview-details">
                <h3>📋 Detalhes da Entrevista</h3>
                
                <div class="detail-item">
                    <span class="detail-icon">👤</span>
                    <span><strong>Entrevistador:</strong> <span class="detail-value">${data.managerName}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <span><strong>Data:</strong> <span class="detail-value">${data.interviewDateTime}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">🕒</span>
                    <span><strong>Horário:</strong> <span class="detail-value">${data.interviewTime}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span><strong>Local:</strong> <span class="detail-value">A definir (você será contactado)</span></span>
                </div>
            </div>
            
            <div class="tips-section">
                <h4>💡 Dicas para sua entrevista:</h4>
                <ul class="tips-list">
                    <li>Chegue 15 minutos antes do horário marcado</li>
                    <li>Leve uma cópia impressa do seu currículo</li>
                    <li>Vista-se adequadamente para a ocasião</li>
                    <li>Prepare perguntas sobre a empresa e a vaga</li>
                    <li>Esteja pronto para falar sobre suas experiências</li>
                    <li>Demonstre entusiasmo e interesse pela oportunidade</li>
                </ul>
            </div>
            
            <div class="urgent-notice">
                <p><strong>⚠️ Importante:</strong> Se não puder comparecer na data agendada, entre em contato conosco o quanto antes para reagendarmos.</p>
            </div>
            
            <p>Esta é uma excelente oportunidade para você mostrar seu potencial. Estamos ansiosos para conhecê-lo(a) melhor!</p>
            
            <div style="text-align: center;">
                <a href="${data.frontendUrl}" class="button">Acessar Portal de Talentos</a>
            </div>
            
            <p>Boa sorte e até breve! 🍀</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p><strong>Portal de Talentos</strong> - Conectando talentos às melhores oportunidades</p>
            <p>© 2025 Portal de Talentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getInterviewRescheduledTemplate(data: {
    candidateName: string;
    managerName: string;
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    newDateTime: string;
    frontendUrl: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrevista Reagendada - Portal de Talentos</title>
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
            border-bottom: 3px solid #fd7e14;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #fd7e14;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .notice-box {
            background: linear-gradient(135deg, #fd7e14, #ffc107);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 25px 0;
        }
        .notice-box h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .old-schedule {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #6c757d;
            margin: 20px 0;
            position: relative;
            opacity: 0.7;
        }
        .old-schedule::before {
            content: "ANTERIOR";
            position: absolute;
            top: -10px;
            left: 10px;
            background: #6c757d;
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 3px;
            font-weight: bold;
        }
        .new-schedule {
            background-color: #e8f7fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #fd7e14;
            margin: 25px 0;
            position: relative;
        }
        .new-schedule::before {
            content: "NOVO AGENDAMENTO";
            position: absolute;
            top: -10px;
            left: 10px;
            background: #fd7e14;
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 3px;
            font-weight: bold;
        }
        .schedule-title {
            color: #fd7e14;
            margin-top: 10px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
        }
        .detail-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 16px;
        }
        .detail-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
        }
        .detail-value {
            font-weight: bold;
            color: #fd7e14;
        }
        .old-value {
            font-weight: bold;
            color: #6c757d;
            text-decoration: line-through;
        }
        .important-notice {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 25px 0;
        }
        .important-notice h4 {
            color: #856404;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #fd7e14;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #e8680b;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #f8d7da;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #dc3545;
            margin: 20px 0;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Portal de Talentos</h1>
        </div>
        
        <div class="content">
            <div class="notice-box">
                <h2>📅 Entrevista Reagendada</h2>
                <p>Sua entrevista teve a data alterada</p>
            </div>
            
            <p><strong>Olá, ${data.candidateName}!</strong></p>
            
            <p>Informamos que sua entrevista com <strong>${data.managerName}</strong> foi reagendada para uma nova data e horário.</p>
            
            <div class="old-schedule">
                <h3 class="schedule-title">Agendamento Anterior</h3>
                
                <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <span><strong>Data:</strong> <span class="old-value">${data.oldDate}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">🕒</span>
                    <span><strong>Horário:</strong> <span class="old-value">${data.oldTime}</span></span>
                </div>
            </div>
            
            <div class="new-schedule">
                <h3 class="schedule-title">✨ Novo Agendamento</h3>
                
                <div class="detail-item">
                    <span class="detail-icon">👤</span>
                    <span><strong>Entrevistador:</strong> <span class="detail-value">${data.managerName}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <span><strong>Data:</strong> <span class="detail-value">${data.newDateTime}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">🕒</span>
                    <span><strong>Horário:</strong> <span class="detail-value">${data.newTime}</span></span>
                </div>
                
                <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span><strong>Local:</strong> <span class="detail-value">A definir (você será contactado)</span></span>
                </div>
            </div>
            
            <div class="important-notice">
                <h4>💡 Lembrete Importante:</h4>
                <ul>
                    <li>Anote a nova data e horário em sua agenda</li>
                    <li>Chegue 15 minutos antes do horário marcado</li>
                    <li>Prepare-se com antecedência para a entrevista</li>
                    <li>Leve uma cópia impressa do seu currículo</li>
                </ul>
            </div>
            
            <div class="contact-info">
                <p><strong>⚠️ Não pode comparecer?</strong> Se não puder comparecer na nova data agendada, entre em contato conosco o mais rápido possível para reagendarmos novamente.</p>
            </div>
            
            <p>Pedimos desculpas por qualquer inconveniente causado pela alteração. Estamos ansiosos para conhecê-lo(a) na nova data!</p>
            
            <div style="text-align: center;">
                <a href="${data.frontendUrl}" class="button">Acessar Portal de Talentos</a>
            </div>
            
            <p>Obrigado pela compreensão e até breve! 🤝</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p><strong>Portal de Talentos</strong> - Conectando talentos às melhores oportunidades</p>
            <p>© 2025 Portal de Talentos. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }
}
