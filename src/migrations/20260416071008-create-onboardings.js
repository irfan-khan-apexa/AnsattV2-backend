"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("onboardings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      company_code: {
        type: Sequelize.STRING,
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

      contact: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      role_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      designation: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      department: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      reporting_manager: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      exit_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      probation_period: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      auto_password: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ✅ KYC
      pan_card: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      aadhar_card: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      pan_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      aadhar_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      passport_photo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // ✅ Documents
      resume: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      offer_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      joining_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      experience_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      exit_letter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      presigned_url_cache: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      presigned_url_cache_time: {
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

    // 🔥 indexes (important for large data)
    await queryInterface.addIndex("onboardings", ["company_code"]);
    await queryInterface.addIndex("onboardings", ["email"]);
    await queryInterface.addIndex("onboardings", ["role_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("onboardings");
  },
};