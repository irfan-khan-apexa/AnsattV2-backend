"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leaves", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Pending", "Approved", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
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

    // 🔥 indexes
    await queryInterface.addIndex("leaves", ["employeeId"]);
    await queryInterface.addIndex("leaves", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("leaves");
  },
};