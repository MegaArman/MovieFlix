# SELECT MOVIE * Service
Some hiring challenge for backend engineering positions

## Problem Statement

You are joining a crack team of engineers to build a service that allows users to search
for movie information in a variety of ways.

### Customer API
The service is expected to support the following operations:

1. MOVSRCH: Search for movies by up to three different criteria and return all matching results
2. ACTSRCH: Search for actors by up to three different criteria and return all matching results
3. MAGICSRCH: One "interesting" search that is going to be your secret sauce. This is an
   opportunity for you to design a specific query that you personally find interesting.
   Examples: _"Search for the movie that has the most actors"_, or
   _"How many moves rated PG-13 has a specific actor"._

### Admin API
The service also is expected to support the following "administrative" APIs:

1. NEWMOV: create a new movie entry
2. NEWACT: create a new actor entry

## Your Mission
You are to start with this early version of a rudimentary specification with various details
left out, fill in the blanks (such as parameters, return values, etc.), and build out the
first cut of the service.

You primary tasks are:

* Define and document the APIs for the operations
* Document the schema for the actor and movie entities. You may use the provided SQL files to
  populate your database
* Implement a web service that supports the APIs mentioned above (_customer_ and _admin_)

Also note:

* Your database must persist even if your service is cycled
* Your service must accessible via a RESTful interface and testable using `cURL`
* You may ignore authentication. Requests from a customer `C` should always include an
  `X-Identifier` header with a value set to `C`. Requests from the admin should always include
  an `X-Identifier` header with a value set to `"ADMIN"`
* Responses are expected in JSON

You are to use the provided bootstrap data containing movie and actor information to load up
you backing database which you are to then expose to customers via APIs. In this repository you'll
find two files, `actors.sql` and `movies.sql`. They comprise titles and actors from Internet Movie
Database (IMDB). For simplicity's sake, it is not fully normalized.

### Database Choice

For this exercise, you may use any database of your choice. Please ensure that the installation
instructions for the database component are included (if it is a link to documentation elsewhere
that is also acceptable). We recommend either sqlite or PostreSQL for their simplicity.

Note that the SQL files included have been tested with SQLite.

## Examples

You are to define the APIs for the various operation. Here are some examples of how some of the operations
might be implemented. Note that paths and parameters below are only suggestions.

### MOVSRCH Operation

> GET /movsrch?name=Toy%20Story

_Headers_:
* X-Identifier: "CUST"

Result status: `200`

```json
{
  "results": [
    {
      "id": "tt0114709",
      "name": "Toy Story",
      :
      :
    }
  ]
}
```
