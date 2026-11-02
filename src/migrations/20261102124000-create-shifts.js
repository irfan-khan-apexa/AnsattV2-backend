"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("shifts", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      companyCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      shiftCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      shiftName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      shiftType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      startTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      endTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      totalHours: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("shifts");
  },
};
