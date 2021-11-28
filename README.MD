# **ガマブン太** - Gamabunta

Please save Challe Sale from the evil toad sage.

## Instructions

Read the instructions to play in the About section.

## Run the game

To simplify development, you should first install `nodemon`. Nodemon allows you to re-run the server automatically after any changes to your files. Said module is already packed inside package.json, so to install it, just run:

> npm i

To run the server, there is a simple script implemented in the package.json. To execute it, just type:

> npm start

If you don't wish to install nodemon, just execute:

> node server

## Project architecture

The `lib` directory holds the libraries. We use libraries when something
is too tedious or prone to error if written by hand or out of the scope of
this project.

The `common` directory contains all the code and resources that are used in multiple examples.
