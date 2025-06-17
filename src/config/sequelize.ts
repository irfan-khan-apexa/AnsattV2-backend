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

import { Sequelize } from "sequelize";
import { config } from "./config"; // adjust path if needed

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: Number(process.env.DB_PORT), // still needs this from env
    dialect: "mysql",
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // Aiven's SSL sometimes requires this
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
