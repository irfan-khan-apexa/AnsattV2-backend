"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("holiday_masters", {
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

      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "GOVT",
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

    await queryInterface.addIndex("holiday_masters", ["companyCode", "date"], {
      unique: true,
    });

    await queryInterface.addIndex("holiday_masters", ["companyCode", "year"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("holiday_masters");
  },
};
