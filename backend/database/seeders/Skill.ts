import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Skill from 'App/Models/Skill'

export default class extends BaseSeeder {
  public async run() {
    const skills = [
      'Java', 'Node.js', 'C++', 'PHP', 'Python', 'Go', 'ADVPL',
      'Angular', 'Electron', 'React', 'React Native', 'MongoDB',
      'MySQL', 'SQLServer', 'Postgres', 'Backend', 'Front-End',
    ]

    for (const skillName of skills) {
      await Skill.firstOrCreate(
        { name: skillName },
        { name: skillName }
      )
    }
  }
}