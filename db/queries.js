const pool = require("./pool");

async function addNewUser(fisrtName, lastName, username, password, isAdmin) {
  await pool.query(
    "INSERT INTO USERS(firstname, lastname, username, password, ismember, isadmin) VALUES ($1, $2, $3, $4, $5, $6)",
    [fisrtName, lastName, username, password, false, isAdmin]
  );
}

async function getUserByUsername(username) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
}

async function getUsersByUsernameAndPassword(username, password) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR password = $2",
    [username, password]
  );
  return rows;
}

async function giveMembershipToUser(id) {
  await pool.query("UPDATE users SET ismember = TRUE WHERE id = $1", [id]);
}

module.exports = {
  addNewUser,
  getUserByUsername,
  getUserById,
  getUsersByUsernameAndPassword,
  giveMembershipToUser,
};
