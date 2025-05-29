/**
 * Config source: https://git.io/JvgAf
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import Env from "@ioc:Adonis/Core/Env";
import { mailConfig } from "@adonisjs/mail/build/config";

export default mailConfig({
  /*
  |--------------------------------------------------------------------------
  | Default mailer
  |--------------------------------------------------------------------------
  |
  | The following mailer will be used to send emails, when you don't specify
  | a mailer
  |
  */
  mailer: "smtp",

  /*
  |--------------------------------------------------------------------------
  | Mailers
  |--------------------------------------------------------------------------
  |
  | You can define or more mailers to send emails from your application. A
  | single `driver` can be used to define multiple mailers with different
  | config.
  |
  | For example: Postmark driver can be used to have different mailers for
  | sending transactional and promotional emails
  |
  */
  mailers: {
    /*
    |--------------------------------------------------------------------------
    | Smtp
    |--------------------------------------------------------------------------
    |
    | Uses SMTP protocol for sending email
    |
    */
    smtp: {
      driver: "smtp",
      host: Env.get("MAIL_HOST"),
      port: Env.get("MAIL_PORT"),
      auth: {
        user: Env.get("MAIL_USERNAME"),
        pass: Env.get("MAIL_PASSWORD"),
        type: "login",
      },
      secure: Env.get("MAIL_PORT") == 465,
      tls: {
        rejectUnauthorized: false,
      },
      family: 4,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    },
  },
  defaultFrom: {
    name: Env.get("MAIL_FROM_NAME"),
  },
});
