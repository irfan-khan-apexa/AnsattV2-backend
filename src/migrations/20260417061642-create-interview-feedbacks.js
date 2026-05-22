"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interview_feedbacks", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      interview_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      round_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      interviewer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      technical_skills: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      communication: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      culture_fit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      problem_solving: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      leadership: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      additional_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      final_recommendation: {
        type: Sequelize.STRING,
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

    // 🔥 indexes (important for filtering & joins)
    await queryInterface.addIndex("interview_feedbacks", ["interview_id"]);
    await queryInterface.addIndex("interview_feedbacks", ["application_id"]);
    await queryInterface.addIndex("interview_feedbacks", ["round_number"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interview_feedbacks");
  },
};