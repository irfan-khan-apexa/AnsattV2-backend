"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("calendars", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      departmentId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      isWorkDay: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      note: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex(
      "calendars",
      ["companyCode", "departmentId", "date"],
      { unique: true },
    );

    await queryInterface.addIndex("calendars", ["companyCode", "departmentId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("calendars");
  },
};
