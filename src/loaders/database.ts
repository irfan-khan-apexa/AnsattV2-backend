import sequelize from "../config/sequelize";
// import { SuperMaster } from "../modules/models/SuperMaster.model";

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    // Sync your models
    // await SuperMaster.sync(); // This ensures the table exists

    // Or use: await sequelize.sync(); to sync all defined models
    // console.log("SuperMaster table synced.");
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
