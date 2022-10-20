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
    app.listen(
        3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initilizeDbAndServer();

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    select  * from cricket_team order by player_id;
    `;
  const playersList = await database.all(getAllPlayersQuery);
  response.send(playersList);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerDetailsQuery = `
    select player_id from cricket_team where player_id = ${playerId};
    `;
  const playerDetails = await database.get(getPlayerDetailsQuery);
  response.send(playerDetails);
});

app.post('/players/',async(request,response) =>{
    const playerDetails = request.body;
    const{
       
        player-name,
        jersey_number,
        role
    } = playerDetails;
    const addPlayerQuery = `
    insert into cricket_team(player_name,jersey_number,role)
    values(
        '${player_name}',
        ${jersey_number},
        '${role}'
    );
    `;
    const dbResponse =await database.run(addPlayerQuery);
    const playerId = dbResponse.lastID;
    response.send("Player Added to Team")
})