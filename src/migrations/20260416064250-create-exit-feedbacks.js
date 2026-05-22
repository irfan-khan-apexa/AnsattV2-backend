"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exit_feedbacks", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      improvements: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      problems: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      positives: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
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

    // 🔥 indexes
    await queryInterface.addIndex("exit_feedbacks", ["company_code"]);
    await queryInterface.addIndex("exit_feedbacks", ["employee_id"]);
    await queryInterface.addIndex("exit_feedbacks", ["created_by"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("exit_feedbacks");
  },
};