"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_applications", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      resume_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      parsed_skills: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      match_score: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      rank: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "applied",
      },

      rejected_at: {
        type: Sequelize.DATE,
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

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // 🔥 indexes (important for hiring flow)
    await queryInterface.addIndex("job_applications", ["company_code"]);
    await queryInterface.addIndex("job_applications", ["job_id"]);
    await queryInterface.addIndex("job_applications", ["status"]);
    await queryInterface.addIndex("job_applications", ["rank"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("job_applications");
  },
};