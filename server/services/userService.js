const db = require("../config/db");

async function getAllConnectedClients(roomId) {
  return await db
    .promise()
    .query(
      "SELECT up.socket_id,u.user_id,u.username from user_presence up INNER JOIN users u ON u.user_id = up.user_id"
    );
}

module.exports = {
  getAllConnectedClients,
};
