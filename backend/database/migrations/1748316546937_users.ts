import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.string("name").notNullable();
      table.date("birth_date").nullable();
      table.string("email").notNullable().unique();
      table.string("phone").nullable();
      table.string("cep").nullable();
      table.string("address").nullable();
      table.string("city").nullable();
      table.string("state").nullable();
      table
        .enum("role", ["candidate", "manager"])
        .notNullable()
        .defaultTo("candidate");
      table.string("password").notNullable();

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
