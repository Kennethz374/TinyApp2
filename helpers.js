//enter email and find the matching id
const findIdByEmail = function(email, database) {
  for (let key in database) {
    if(database[key].email === email) {
      return key;
    }
  }
};

module.exports = { findIdByEmail };

