var mongoose    =   require("mongoose");

// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var associationSchema  = new mongoSchema (
  {
    "user": String ,
    "password": String ,
    "serial": String
  }
);

// create model if not exists.
module.exports = mongoose.model("Associations",associationSchema);
