"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_postings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      job_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      department: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      employment_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      work_mode: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      experience_min: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      experience_max: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      vacancies: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      job_location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      salary_min: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      salary_max: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      job_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      responsibilities: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      skills_required: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "draft",
      },

      deleted_at: {
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

    // 🔥 indexes (important for ATS)
    await queryInterface.addIndex("job_postings", ["company_code"]);
    await queryInterface.addIndex("job_postings", ["status"]);
    await queryInterface.addIndex("job_postings", ["job_title"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("job_postings");
  },
};