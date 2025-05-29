import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UserSkills extends BaseSchema {
  protected tableName = "user_skills";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .integer("skill_id")
        .unsigned()
        .references("id")
        .inTable("skills")
        .onDelete("CASCADE");
      table.unique(["user_id", "skill_id"]);
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
