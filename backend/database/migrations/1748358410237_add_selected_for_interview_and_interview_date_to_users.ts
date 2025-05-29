import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean("selected_for_interview").defaultTo(false);
      table.timestamp("interview_date", { useTz: true }).nullable();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("selected_for_interview");
      table.dropColumn("interview_date");
    });
  }
}
