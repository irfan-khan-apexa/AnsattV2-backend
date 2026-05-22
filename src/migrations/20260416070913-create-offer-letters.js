"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("offer_letters", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      employee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      terms: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 🔥 indexes
    await queryInterface.addIndex("offer_letters", ["employee_id"]);
    await queryInterface.addIndex("offer_letters", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("offer_letters");
  },
};