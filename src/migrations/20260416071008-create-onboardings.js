"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("onboardings", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      designation: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // Department.id reference
      department: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      reporting_manager: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

      // Attendance fields
      siteCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shiftCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shiftType: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      reportingManagerEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reportingHrEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // KYC fields
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

      // Document uploads
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

      // Presigned URL cache
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
    });

    await queryInterface.addIndex("onboardings", ["company_code"]);
    await queryInterface.addIndex("onboardings", ["email"]);
    await queryInterface.addIndex("onboardings", ["role_id"]);
    await queryInterface.addIndex("onboardings", ["department"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("onboardings");
  },
};
