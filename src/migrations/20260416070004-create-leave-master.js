"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leave_master", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      allowedLeaves: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      employeeId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
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
    await queryInterface.addIndex("leave_master", ["companyCode"]);
    await queryInterface.addIndex("leave_master", ["type"]);
    await queryInterface.addIndex("leave_master", ["employeeId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("leave_master");
  },
};