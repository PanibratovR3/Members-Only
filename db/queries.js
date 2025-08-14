const pool = require("./pool");

async function addNewUser(fisrtName, lastName, username, password, isAdmin) {
  await pool.query(
    "INSERT INTO USERS(firstname, lastname, username, password, ismember, isadmin) VALUES ($1, $2, $3, $4, $5, $6)",
    [fisrtName, lastName, username, password, false, isAdmin]
  );
}

module.exports = {
  addNewUser,
};
