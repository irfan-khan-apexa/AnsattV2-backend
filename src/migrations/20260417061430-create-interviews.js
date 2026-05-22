"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("interviews", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      round_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      interview_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "scheduled",
      },

      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      start_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      end_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      interviewers: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      platform: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      meeting_link: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_by: {
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

    // indexes (important for queries)
    await queryInterface.addIndex("interviews", ["application_id"]);
    await queryInterface.addIndex("interviews", ["company_code"]);
    await queryInterface.addIndex("interviews", ["round_number"]);
    await queryInterface.addIndex("interviews", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("interviews");
  },
};