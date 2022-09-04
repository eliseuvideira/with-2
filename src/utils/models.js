const { Sequelize, DataTypes } = require("sequelize");
const { database } = require("./database");

const define = (database, table, fields) =>
  database.define(
    table,
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ...fields,
    },
    { tableName: table }
  );

const User = define(database, "user", {
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
  },
});

const Post = define(database, "post", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "user",
      key: "id",
    },
  },
});

const Comment = define(database, "comment", {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "user",
      key: "id",
    },
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "post",
      key: "id",
    },
  },
});

const Story = define(database, "story", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "user",
      key: "id",
    },
  },
});

User.hasMany(Post, {
  foreignKey: "user_id",
});
User.hasMany(Comment, {
  foreignKey: "user_id",
});
User.hasMany(Story, {
  foreignKey: "user_id",
});

Post.belongsTo(User, {
  foreignKey: "user_id",
});
Post.hasMany(Comment, {
  foreignKey: "post_id",
});

Comment.belongsTo(User, {
  foreignKey: "user_id",
});
Comment.belongsTo(Post, {
  foreignKey: "post_id",
});

Story.belongsTo(User, {
  foreignKey: "user_id",
});

exports.models = {
  User,
  Post,
  Comment,
  Story,
};
