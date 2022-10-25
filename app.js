const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let database = null;
const initilizeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initilizeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get all player data

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    select  * from cricket_team order by player_id;
    `;
  const playersList = await database.all(getAllPlayersQuery);
  response.json(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Get player Id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId, playerName, jerseyNumber, role } = request.params;

  const getPlayerDetailsQuery = `
    select player_id, player_name, jersey_number, role from cricket_team where player_id = ${playerId};
    `;
  const playerDetails = await database.get(getPlayerDetailsQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

//create player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
    `;
  const dbResponse = await database.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Delete Player Id

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE
    player_id = ${playerId};
    `;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

//updating player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const playerUpdateQuery = `
    UPDATE cricket_team 
    SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId}
    `;
  await database.run(playerUpdateQuery);
  response.send("Player Details Updated");
});

module.exports = app;
