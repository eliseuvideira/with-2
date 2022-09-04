const dotenv = require("dotenv-safe");

dotenv.config();

const { database } = require("./utils/database");
const { models } = require("./utils/models");
const { startup } = require("./utils/startup");
const sequelize = require("sequelize");
const lodash = require("lodash");

/**
 * @typedef {Object} RepositoryProps
 * @property {sequelize.ModelCtor<any>} Model
 * @property {Record<string, sequelize.ModelCtor<any>} models
 */

const MISSING_QUERY = () => {
  throw new Error("Repository Operation Missing");
};

class Repository {
  /**
   * @param {RepositoryProps} props
   */
  constructor({
    Model,
    models,
    query = MISSING_QUERY,
    includes = [],
    filters = [],
  }) {
    /**
     * @private
     */
    this.Model = Model;
    /**
     * @private
     */
    this.models = models;
    /**
     * @private
     */
    this.query = query;
    /**
     * @private
     */
    this.includes = includes;
    /**
     * @private
     */
    this.filters = filters;
  }

  /**
   * @private
   */
  merge(filters) {
    return filters.reduce((prev, curr) => lodash.merge(prev, curr), {});
  }

  /**
   * @protected
   * @param {Record<string, any>} include
   * @returns {Repository}
   */
  with(include) {
    this.includes = [...this.includes, include];

    return this;
  }

  /**
   * @protected
   * @param {Record<string, any>} filter
   * @returns {Repository}
   */
  where(filter) {
    this.filters = [...this.filters, filter];

    return this;
  }

  /**
   * @public
   * @param {string} id
   * @returns {Repository}
   */
  read(id) {
    const query = async ({ Model, includes, where }) => {
      const item = await Model.findOne({
        where: {
          id,
          ...where,
        },
        include: includes,
      });

      if (!item) {
        return null;
      }

      return item.get();
    };

    this.query = query;

    return this;
  }

  create() {}

  updated() {}

  delete() {}

  count() {}

  list() {}

  async run() {
    const where = this.merge(this.filters);

    const result = await this.query({
      Model: this.Model,
      includes: this.includes,
      where,
    });

    return result;
  }
}

class UserRepository extends Repository {
  constructor({ models }) {
    super({ Model: models.User, models });
  }

  withComments() {
    return this.with(this.models.Comment);
  }

  withStories() {
    return this.with(this.models.Story);
  }

  withPosts() {
    return this.with(this.models.Post);
  }

  whereFirstName(first_name) {
    return this.where({
      first_name,
    });
  }
}

class UserModule {
  constructor(models, User, includes = []) {
    this.models = models;
    this.User = User;
    this.includes = includes;
  }

  withComments() {
    return new UserModule(this.models, this.User, [
      ...this.includes,
      this.models.Comment,
    ]);
  }

  withPosts() {
    return new UserModule(this.models, this.User, [
      ...this.includes,
      this.models.Post,
    ]);
  }

  withStories() {
    return new UserModule(this.models, this.User, [
      ...this.includes,
      this.models.Story,
    ]);
  }

  async run() {
    const values = await this.User.findAll({
      include: this.includes.map((include) => ({ model: include })),
    });

    return values.map((value) => value.dataValues);
  }
}

const main = async () => {
  await database.authenticate();

  await database.sync({ force: true });

  await database.transaction(async (transaction) => {
    await startup(transaction, models);
  });

  const userModule = new UserModule(models, models.User);

  const usersWithComments = await userModule.withComments().run();

  const usersWithCommentsAndPosts = await userModule
    .withComments()
    .withPosts()
    .run();

  // console.log(JSON.stringify(usersWithComments.slice(0, 1), null, 2));
  // console.log(JSON.stringify(usersWithCommentsAndPosts.slice(0, 1), null, 2));

  const userRepository = new UserRepository({ models });

  const value = await userRepository
    .read(usersWithComments[0].id)
    .withComments()
    .withStories()
    .withPosts()
    .whereFirstName("Hello World!")
    .run();

  console.log(JSON.stringify({ value }, null, 2));

  await database.close();
};

main();
