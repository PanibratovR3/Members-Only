const { Client } = require("pg");
require("dotenv").config({ quiet: true });

const SQL = `
    CREATE TABLE IF NOT EXISTS users (
        Id INTEGER NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        FirstName VARCHAR(10) NOT NULL,
        LastName VARCHAR(10) NOT NULL,
        Username VARCHAR(50) NOT NULL,
        Password VARCHAR(255) NOT NULL,
        IsMember BOOLEAN NOT NULL,
        IsAdmin BOOLEAN NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
        Id INTEGER NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        UserId INTEGER NOT NULL,
        Title VARCHAR(30) NOT NULL,
        MessageTime TIMESTAMP NOT NULL,
        Message TEXT NOT NULL,
        CONSTRAINT fk_userid FOREIGN KEY (UserId) REFERENCES users(Id)
    );
`;

async function main() {
  console.log("Seeding...");
  const client = new Client({
    connectionString: `postgresql://${process.env.USER}:${process.env.PASSWORD}@localhost:5432/${process.env.DATABASE}`,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("Done!");
}

main();
