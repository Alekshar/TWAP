var mongoose    =   require("mongoose");

// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var sensorSchema  = new mongoSchema (
  {
    "serial": string,
    "timestamp": Date,
    "light": Number,
    "temperature": Number ,
    "humidity": Number
  }
);

// create model if not exists.
module.exports = mongoose.model("Sensors",sensorSchema);
