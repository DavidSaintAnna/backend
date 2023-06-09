exports.up = (knex) =>
  knex.schema.createTable("movietags", (table) => {
    table.increments("id");
    table.text("name").notNullable();
    table.integer("user_id").references("id").inTable("users");
    table
      .integer("note_id")
      .references("id")
      .inTable("moviesnotes")
      .onDelete("CASCADE");
  });

exports.down = (knex) => knex.schema.dropTable("movietags");
