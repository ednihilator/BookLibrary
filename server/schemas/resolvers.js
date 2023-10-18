const { Book, User } = require("../models/");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    //LINES 16-36 BORROWED FROM MERN ACTIVITY 26
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("Not logged in!");
        }
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args } }
        );
        return user;
      } catch (err) {
        throw new AuthenticationError("Couldn't find user or book!");
      }
    },
    removeBook: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError("Not logged in!");
        }
        const user = await User.findOneAndRemove(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } }
        );
        return user;
      } catch (err) {
        throw new AuthenticationError("Couldn't find user or book!");
      }
    },
  },
};

module.exports = resolvers;
