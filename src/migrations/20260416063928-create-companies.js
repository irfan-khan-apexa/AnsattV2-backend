"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      contact: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    //  index for lookup
    await queryInterface.addIndex("companies", ["company_code"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("companies");
  },
};