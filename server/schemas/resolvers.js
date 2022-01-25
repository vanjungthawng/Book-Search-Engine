const { User } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const loggedInUser = await User.findOne({ _id: context.user.id})
                return loggedInUser;
            }
            
        }
    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const userLogin = await User.findOne({ email })
            if (!userLogin) {
                console.error('No Email or Password there!')
                return;
            }
            const userPassword = await userLogin.isCorrectPassword(password)
            if (!userPassword) {
                console.error('No Email or Password there!!')
                return;
            }
            const token = signToken(userLogin)
            return { token, userLogin }
        },
        addUser: async (parent, {username, email, password} , context) => {
            const newUser = await User.create({ username, email, password })
            return newUser;
        },
        saveBook: async (parent, bookData, context) => {
        if(context.user) {
            const updatedUserBookList = await User.findOneAndUpdate(
                { bookId: context.user.bookId },
                { $addToSet: { savedBooks: bookData.input} },
                { new: true, runValidators: true}
            )
            return updatedUserBookList;
        }
            console.error('You must be logged in to save a book!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const userBookList = await User.findOneAndUpdate(
                    { bookId: context.user.bookId},
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true}
                );

                return userBookList;
            }
            console.error('You must be logged in to remove a book!');
        }
    }
}

module.exports = resolvers;