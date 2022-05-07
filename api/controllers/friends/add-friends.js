const sailsHookApianalytics = require("sails-hook-apianalytics");
const User = require("../../models/User");

module.exports = {


  friendlyName: 'Add friends',


  description: '',


  inputs: {
    friends: {
      description: 'An Array of new friends to send requests to',
      type: [
        {
          emailAddress: 'string',
          fullName: 'string',
        }
      ],
      example: [
        {
          emailAddress: 'foo@example.com',
          fullName: 'Foo McFoo'
        }
      ],
      required: true
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    const desiredFriendEmails = _.pluck(inputs.friends, 'emailAddress')
    const friends = await User.find({
      emailAddress: { in: _.pluck(inputs.friends, 'emailAddress') }
    })
    // TODO: deal with friend not yet in the database
    const existingUserFriendsIds = _.pluck(inputs.friends, 'id')
    const existingUserEmails = _.pluck(friends, 'emailAddress')
    const newUserEmails = _.difference(desiredFriendEmails, existingUserEmails);

    for(let email of newUserEmails){
      const token = await sails.helpers.strings.random('url-friendly')
      await User.create({
        emailAddress: email,
        fullName: _.find(inputs.friends, { emailAddress: email}).fullName,
        emailProofToken: token,
        emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
        emailStatus: 'confirmed'
      })
    }
    // TODO: Send emails to newly invited users

    await User.addToCollection(this.req.me.id, 'outboundFriendRequests', friendsIds)
    // for (let friend of inputs.friends){
    //   await User.addToCollection(this.req.id, 'outboundFriendRequests', friend.id)
    // }

    // All done.
    return this.exits.success();

  }


};
