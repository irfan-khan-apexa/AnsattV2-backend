"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sites", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      sitecode: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      radius: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
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

    await queryInterface.addIndex("sites", ["sitecode", "company_code"], {
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sites");
  },
};
