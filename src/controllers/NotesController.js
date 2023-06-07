const knex = require("../database/knex");

class NotesController {
  async create(request, response) {
    const { title, description, moviegrade, tags } = request.body;
    const { user_id } = request.params;

    const [note_id] = await knex("moviesnotes").insert({
      title,
      description,
      moviegrade,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });

    await knex("movietags").insert(tagsInsert);

    response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const note = await knex("moviesnotes").where({ id }).first();
    const movietags = await knex("movietags")
      .where({ note_id: id })
      .orderBy("name");

    return response.json({
      ...note,
      movietags,
    });
  }

  async deleteMovie(request, response) {
    const { id } = request.params;

    await knex("moviesnotes").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { title, user_id, tags } = request.query;

    let notes;

    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());
      notes = await knex("movietags")
        .select(["moviesnotes.id", "moviesnotes.title", "moviesnotes.user_id"])
        .where("moviesnotes.user_id", user_id)
        .whereLike("moviesnotes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("moviesnotes", "moviesnotes.id", "movietags.note_id")
        .orderBy("moviesnotes.title");
    } else {
      notes = await knex("moviesnotes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }
    const userTags = await knex("movietags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);
      return {
        ...note,
        tags: noteTags,
      };
    });
    return response.json({ notesWithTags });
  }
}

module.exports = NotesController;
