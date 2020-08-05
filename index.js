const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./faveflix.db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authenticate = (req) =>
{
  const header = req.header("X-Identifier");
  const path = req.path;
  const customerAPI = ["/movsrch", "/actsrch", "/magicsrch"];
  const adminAPI = ["/newmov", "/newact"];
  
  return (customerAPI.includes(path) && header === "c") ||
    (adminAPI.includes(path) && header === "ADMIN");
};

app.get("/movsrch", (req, res) => 
{
  if (!authenticate(req)) 
  {
    res.status(403).send();
    return;
  }
  let str = "SELECT title FROM movies WHERE";
  const queryMap = new Map(Object.entries(req.query));
  const stmtArgs = [];
  
  if (queryMap.has("year"))
  {
    stmtArgs.push(queryMap.get("year"));
    str += " year=?";
  }
  
  if (queryMap.has("language"))
  { 
    str += (stmtArgs.length > 0 ? 
      " AND " : " ") + "language LIKE ?";
    stmtArgs.push("%" + queryMap.get("language") + "%");
  }
  
  if (queryMap.has("genre"))
  {
    str += (stmtArgs.length > 0 ? 
      " AND " : " ") + "genres LIKE ?";
    stmtArgs.push("%" + queryMap.get("genre") + "%");
  }

  db.serialize(() => 
  {
    const stmt = db.prepare(str);
    stmt.all(stmtArgs, (err, rows) =>
    {
     if (err) throw err;
     const titles = rows.map((row) => row.title);
     res.json({"titles": titles});
    });
    stmt.finalize();
  });
});

app.get("/actsrch", (req, res) => 
{
  if (!authenticate(req)) 
  {
    res.status(403).send();
    return;
  }
  let str = "SELECT DISTINCT name FROM actors"; 
  const queryMap = new Map(Object.entries(req.query));
  const stmtArgs = [];

  if (queryMap.has("movie"))
  {
    str +=  " INNER JOIN movies on movies.id=actors.movie_id \
      where movies.title LIKE ?";
    stmtArgs.push(queryMap.get("movie"));
  }
    
  if (queryMap.has("firstName"))
  { 
    str += (stmtArgs.length > 0 ? 
      " AND " : " WHERE ") + "name LIKE ?";
    stmtArgs.push(queryMap.get("firstName") + " %");
  } 
 
  if (queryMap.has("lastName"))
  { 
    str += (stmtArgs.length > 0 ? 
      " AND " : " WHERE ") + "name LIKE ?";
    stmtArgs.push("% " + queryMap.get("lastName"));
  }  
  
  db.serialize(() => 
  {
    const stmt = db.prepare(str); 
    stmt.all(stmtArgs, (err, rows) =>
    {
     if (err) throw err;
     const names = rows.map((row) => row.name);
     res.json({"names": names});
    });
    stmt.finalize();
  });
});

app.get("/magicsrch", (req, res) => 
{
  if (!authenticate(req)) 
  {
    res.status(403).send();
    return;
  }
  const str = "SELECT AVG(imdb_score) FROM movies INNER JOIN actors ON \
    movies.id=actors.movie_id WHERE actors.name LIKE ?";  
  const queryMap = new Map(Object.entries(req.query));
  const stmtArgs = [];

  if (queryMap.has("name")) 
  {
    stmtArgs.push(queryMap.get("name"));
  } 
 
  db.serialize(() => 
  {
    const stmt = db.prepare(str); 
    stmt.get(stmtArgs, (err, average) =>
    {
     if (err) throw err;   
     res.json({"average_imdb_score": average["AVG(imdb_score)"]});
    });
    stmt.finalize();
  });
});

app.post("/newmov", (req, res) => 
{
  if (!authenticate(req)) 
  {
    res.status(403).send();
    return;
  } 
  const str = "INSERT INTO movies VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?)";  
  const queryMap = new Map(Object.entries(req.body));
  const stmtArgs = [...queryMap.values()];
    
  db.serialize(() => 
  {
    const stmt = db.prepare(str); 
    stmt.run(stmtArgs, (err) =>
    {
     if (err) throw err;
     res.json(req.body);
    });
    stmt.finalize();
  });
});

app.post("/newact", (req, res) => 
{
  if (!authenticate(req)) 
  {
    res.status(403).send();
    return;
  }
  const str = "INSERT INTO actors VALUES(NULL,?,?,?)";  
  const queryMap = new Map(Object.entries(req.body));
  const stmtArgs = [...queryMap.values()];
    
  db.serialize(() => 
  {
    const stmt = db.prepare(str); 
    stmt.run(stmtArgs, (err) =>
    {
     if (err) throw err;
     res.json(req.body);
    });
    stmt.finalize();
  });
});

app.listen(3000);
