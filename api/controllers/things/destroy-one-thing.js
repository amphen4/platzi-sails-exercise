const Thing = require("../../models/Thing");

module.exports = {


  friendlyName: 'Destroy one thing',


  description: 'Delete the "thing" with the specified ID from the database',


  inputs: {
    id: {
      type: 'number',
      required: true,
    }
  },


  exits: {
    forbidden: {
      description: 'The user making this request doesnt have the permissions to delete this thing',
      statusCode: 403,
      responseType: 'forbidden',
    }
  },


  fn: async function (inputs, exits) {
    const thing = await Thing.findOne({
      id: inputs.id
    });
    if( thing.owner !== this.req.me.id ){
      throw 'forbidden'
    }
    await Thing.destroy({ id: inputs.id });
    // All done.
    return;

  }


};
