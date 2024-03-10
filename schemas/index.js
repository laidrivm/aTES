const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();

const validateSchema = (schemaName, event) => {
  const schemaDir = schemaName.replace(/\./g, '/');
  const schemaPath = path.join(__dirname, `${schemaDir}/${version}.json`);
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

  console.log(`__dirname is ${__dirname}`);

  const validate = ajv.compile(schema);
  const result = validate(event);

  if (result) {
  	console.log("Event is valid");
  } else {
  	console.log("Event is invalid");
  	console.log(validate.errors);
  }
  return result;
}

module.exports = validateSchema;
