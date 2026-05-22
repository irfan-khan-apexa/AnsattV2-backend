"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("financial_years", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    //  indexes
    await queryInterface.addIndex("financial_years", ["companyCode"]);
    await queryInterface.addIndex("financial_years", ["isActive"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("financial_years");
  },
};