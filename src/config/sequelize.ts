// import { Sequelize } from "sequelize";
// import { config } from "./config";

// const sequelize = new Sequelize(
//   config.db.name,
//   config.db.user,
//   config.db.pass,
//   {
//     host: config.db.host,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// export default sequelize;
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
