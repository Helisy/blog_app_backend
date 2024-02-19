# API for a short text platform

## 📖  Description


This is the project of a REST API for a short-text platform. It stores user registrations, posts, comments, and likes.

This API was developed as a backend implementation for a blogging platform. It incorporates field validation in user inputs, as well as access token validation, ensuring the security and privacy of posts. In this project, it is possible to create posts, comment on posts, share posts from other users, and like them. Users have the ability to follow other users, allowing them to view the most recent posts from these users in their feeds.


<br/>

## 🛠️ Features

- Implementation of a system to store and manage user data.
- Integration of access and refresh token mechanisms for secure authentication and authorization.
- Implementation of robust validation to ensure the integrity and correctness of input data.
- Granted user abilities include creating posts, commenting on posts, and the option to like or unlike posts and comments.
- Functionality for sharing posts, allowing users to add their own text when sharing content.
- Implementation of search tools to enable users to locate specific posts and users.
- Addition of the ability for users to follow other users, facilitating the viewing of recent posts from these users in their feeds.

<br/>

## 📡 Technologies used

- Node.js
- Express.js
- MySQL

### Node.js Modules:

- bcrypt: ^5.0.1,
- cookie-parser: ^1.4.6,
- cors: ^2.8.5,
- dotenv: ^16.0.0,
- ejs: ^3.0.2,
- express: ^4.17.3,
- express-validator: ^7.0.1,
- jsonwebtoken: ^9.0.2,
- mysql2: ^2.3.3

<br/>

## 🔮 Future implementations

1. Add image uploads to posts and user profiles;

<br/>

## ⏳ Initialization

Clone this repository to your chosen directory.

### Installation

To install Node.js, go to: https://nodejs.org/en/download/current
</br>
To install MySQL, go to: https://dev.mysql.com/downloads/mysql

With node.js installed, open cmd:
</br>
cd your-clone-directory
</br>
npm install

### Creating a .env file
ACCESS_TOKEN_SECRET=<string of random characters with 32 characters>
</br>
REFRESH_TOKEN_SECRET=<string of random characters with 32 characters>
</br>
</br>
DB_HOST=host
</br>
DB_USER=user
</br>
DB_PASS=password
</br>
DB_DB=database_name
</br>
</br>
PORT=server_port

### Creating the database

Access the '.sql' file at './src/SQL/base.sql' and execute the statements.

### Starting the server

In the cmd type:
</br>
npm start

<br>

## 📖 Documentation 

Access the 'Docs' folder in this repository and refer to the documentation to understand how to utilize this API.




