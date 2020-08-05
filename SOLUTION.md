# SOLUTION.md (for "crack" devs only!)

## setup
### install sqlite3 on your machine, for RHEL based distributions:
sudo dnf install sqlite

### reset the db to reflect only the .sql files
remove the current faveflix.db file

sqlite3 faveflix.db < actors.sql

sqlite3 faveflix.db < movies.sql

OR

git checkout faveflix.db 

### install node modules (server dependencies)
npm i

### start the node server
node index.js

## REST API (HTTP) - Example curl commands 
### Customer (X-Identifier: c)
#### Search for movies based on any of language, genre, or year
curl --header "X-Identifier: c" "http://localhost:3000/movsrch?language=Japanese&genre=War&year=1957"

=> {"titles":["The Bridge on the River Kwai"]}

#### Search for actors based on first name
curl --header "X-Identifier: c" "http://localhost:3000/actsrch?firstName=jackie"

=> {"names":["Jackie Moran","Jackie Sawiris","Jackie Lowe","Jackie Earle Haley","Jackie Coogan","Jackie Davis","Jackie Gerlich"]}

#### Search for actors based on last name
curl --header "X-Identifier: c" "http://localhost:3000/actsrch?lastName=chan"

=> {"names":["Amanda Chan","Chike Chan","Spencer Chan","Man-Lei Chan","Robert 'Toshi' Kar Yuen Chan"]}

#### Search for actors who starred in a movie
curl --header "X-Identifier: c" "http://localhost:3000/actsrch?movie=12%20Angry%20Men"

=> {"names":["Henry Fonda","Martin Balsam","Jack Klugman","Lee J. Cobb","Ed Begley","Edward Binns","John Fiedler","James Kelly","E.G. Marshall","John Savoca","Joseph Sweeney","George Voskovec","Jack Warden","Robert Webber"]}

NOTE: the movie above is "12 Angry Men", "%20" indicates space

#### Find the average IMDB rating of all the movies an actor has played in
curl --header "X-Identifier: c" "http://localhost:3000/magicsrch?name=Henry%20Fonda"

=> {"average_imdb_score":8.5}

### Admin (X-Identifier: ADMIN)
#### create a new movie entry
curl --header "X-Identifier: ADMIN" -d "imdb_id=123&title=Ghost in the Shell&director=Mamoru Oshii&year=1995&rating=NOT RATED&genres=cyberpunk&runtime=82&country=Japan&language=English,Japanese&imdb_score=10&imdb_votes=999&metacritic_score=10" -X POST http://localhost:3000/newmov

Will return JSON with the args sent upon success. you could test the db from the sqlite3 shell with:

SELECT * FROM movies WHERE title LIKE "Ghost in the Shell";

=> 251|123|Ghost in the Shell|Mamoru Oshii|1995|NOT RATED|cyberpunk|82|Japan|English,Japanese|10|999|10

#### create a new actor entry

curl --header "X-Identifier: ADMIN" -d "movie_id=123&imdb_id=456&name=jackie chan" -X POST http://localhost:3000/newact

Test from sqlite3 shell: 

SELECT * FROM actors WHERE name LIKE "jackie chan";

=> 11831|123|456|jackie chan 

## Design Decisions
### Database (sqlite3)
sqlite3 is easy to get up and running with, for example one need not create user accounts via their OS -I suspect this is because sqlite is not a client-server db thus is more lenient with permissions/security. I think SQLite is good for prototyping and local device access, but if I were to develop for scale/production (where data may be distrubted across multiple servers for example), I think I'd still stick with Postgres. 

Among other reasons, SQLite does not guarantee domain integrity, so a string could be inserted into a column defined as int
(https://en.wikipedia.org/wiki/SQLite). Client input should always be validated by middleware (*definitely* more so than I do here in this demo), but if a DB has functionality to help out, I think that's a plus. MongoDB developers often use the third party mongoose (https://mongoosejs.com/) module for said purpose. Perhaps there is something similar for SQLite.

Other: I chose not to allow clients to set ids (/newact and /newmov) by instead having the db autoincrement on id (leave the id fields null when inserting : https://stackoverflow.com/a/6989348).

### Languages & Frameworks (Node.js version 10, express.js version 4, node-sqlite3) 
Node.js out of box is asynchronous and nonblocking when it comes to file IO or network requests (the typical bottle necks of server apps). Additionally, when proper sanitization-validation code is in written for the backend/middleware layers, this code could for the most part be reused on the frontend. 

I use express.js to help write cleaner code for handling routing and sending replies to clients. This was my first time using it actually as I initially learned how to handle these things with just Node.js from Kylie Simpson's tutorials. I think express.js is great for writing reusable middleware and would personally continue to use it, but I can still see why some devs don't want to rely on a library to do string parsing for them as there have been breaking changes:
https://stackoverflow.com/a/18702690

The node-sqlite3 driver is pretty decent in terms of usability and being async, but I would have liked them to provide a promise interface as callbacks are generally regarded as less readable and harder to debug as your app grows (https://stackoverflow.com/questions/45041462/node-js-when-to-use-promises-vs-callbacks). Particularly, I prefer promises because they provide a clean means of error propogation.

Other: 

I use prepared statements for their performance and security. 

I use " %?" in my queries to find last names. This is known to be inefficient at scale, so if I were
to modify the table structure, I'd break first and last name into their own columns.

## References
curl: https://curl.haxx.se/docs/manual.html

avoiding injection attacks by not working with JS objects directly: https://eslint.org/docs/rules/no-prototype-builtins

node-sqlite3 apis: https://github.com/mapbox/node-sqlite3

express.js api: https://expressjs.com/en/4x/api.html
