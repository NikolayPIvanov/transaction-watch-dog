const list = async (collection) => await collection.list();

const findById = async (collection, id) => await collection.findById(id);

const create = async (collection, body) => await collection.create(body);

const update = async (collection, body, id) => await collection.update();

const deleteById = async (collection, id) => await collection.remove(id);

const RuleSets = {
  list,
  findById,
  create,
  update,
  deleteById
}

export { RuleSets };
