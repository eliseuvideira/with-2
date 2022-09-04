const ROWS = 200;

const word = () => Math.random().toString().slice(2).toString(16);

const createUsers = async (transaction, User) => {
  const items = new Array(ROWS).fill(null).map(() => ({
    first_name: word(),
    last_name: word(),
  }));

  const users = await User.bulkCreate(items, { transaction });

  return users.map((user) => user.dataValues);
};

const createPosts = async (transaction, Post, users) => {
  const items = new Array(ROWS * 2).fill(null).map((_, i) => ({
    title: word(),
    user_id: users[i % users.length].id,
  }));

  const posts = await Post.bulkCreate(items, { transaction });

  return posts.map((post) => post.dataValues);
};

const createComments = async (transaction, Comment, users, posts) => {
  const items = new Array(ROWS * 5).fill(null).map((_, i) => ({
    content: word(),
    user_id: users[i % users.length].id,
    post_id: posts[i % users.length].id,
  }));

  const comments = await Comment.bulkCreate(items, { transaction });

  return comments.map((comment) => comment.dataValues);
};

const createStories = async (transaction, Story, users) => {
  const items = new Array(ROWS * 2).fill(null).map((_, i) => ({
    title: word(),
    user_id: users[i % users.length].id,
  }));

  const stories = await Story.bulkCreate(items, { transaction });

  return stories.map((story) => story.dataValues);
};

exports.startup = async (transaction, models) => {
  const users = await createUsers(transaction, models.User);

  const posts = await createPosts(transaction, models.Post, users);

  const comments = await createComments(
    transaction,
    models.Comment,
    users,
    posts
  );

  const stories = await createStories(transaction, models.Story, users);

  return {
    users,
    posts,
    comments,
    stories,
  };
};
