---------INSTALATION INSTRUCTION

This readme assumes you have both mySQL and NODEJS installed.
mySQL should be running on port 3306. If mySQL and/or nodejs are not installed, they can
be downloaded at the following links (https://nodejs.org/en/download/ , https://dev.mysql.com/downloads/windows/)

First, open your mysql server either in your sql command line or your perfered mysql GUI. 
Then run the databaseCreation.sql file. This will create the database, tables, and user for 
the server. If you get an error saying that you were unable to drop the database/user, remove
the 1st 2 lines from the file and run it again.

Open the folder in your terminal. To do this, open the command prompt on windows by pressing 
the windows key and the "r" key at the same time, type "cmd" into the window that opens
and press enter. Then type "cd <file path>". Youre looking for the folder that contains the 
server.js file. Once this directory is open in your terminal, type the following command:

npm install

then type:

npm run serverStart 

to start the server. You should get a message in your
terminal saying the database sucessfully connected. Finally, type in "localhost:3000" to
get to the homepage. 
------------------------------


All routes, controllers and database connection are all kept in the server.js file. 
This was done due to errors with the static directory. Pages routed through external
files would not correctly load css or image files. This is also why the user profile pictures
are kept in the public directory, as opposed to a more secure profilepicture directory. 

The system also uses ejs to pass data from the backend, such as sql lookups or session information to 
the front end. It is important to note that the ProfilePage.ejs file throws 5 errrors. This is where 
information from the backend is passed to a javascript script, and complains that it expects an 
expression. It does work as intended however, and can be ignored. 