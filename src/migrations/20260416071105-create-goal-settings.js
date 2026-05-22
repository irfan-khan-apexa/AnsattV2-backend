"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GoalSettings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      cycleId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("OKR", "KPI"),
        allowNull: false,
      },

      targetValue: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      achievedValue: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      weightage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("pending", "in_progress", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },

      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 🔥 indexes (important for filtering)
    await queryInterface.addIndex("GoalSettings", ["companyCode"]);
    await queryInterface.addIndex("GoalSettings", ["employeeId"]);
    await queryInterface.addIndex("GoalSettings", ["cycleId"]);
    await queryInterface.addIndex("GoalSettings", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("GoalSettings");
  },
};