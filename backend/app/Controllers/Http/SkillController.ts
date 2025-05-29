import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Skill from "App/Models/Skill";

export default class SkillController {
  public async index({}: HttpContextContract) {
    const skills = await Skill.query()
      .select("id", "name")
      .orderBy("id", "asc");
    return skills;
  }
}
