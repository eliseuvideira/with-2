const dotenv = require("dotenv-safe");

dotenv.config();

const { database } = require("./utils/database");
const { models } = require("./utils/models");
const { startup } = require("./utils/startup");

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

  console.log(JSON.stringify(usersWithComments.slice(0, 1), null, 2));
  console.log(JSON.stringify(usersWithCommentsAndPosts.slice(0, 1), null, 2));

  await database.close();
};

main();
