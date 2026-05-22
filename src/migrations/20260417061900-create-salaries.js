"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("salaries", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      company_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      month: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      basic: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      hra: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      allowances: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      deductions: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      bonus: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      gross: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      pf_esic_pt: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      employer_pf: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      ctc: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },

      net_salary: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      generated_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      salary_slip: {
        type: Sequelize.TEXT,
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

    // 🔥 indexes (important for payroll queries)
    await queryInterface.addIndex("salaries", ["company_code"]);
    await queryInterface.addIndex("salaries", ["employee_id"]);
    await queryInterface.addIndex("salaries", ["month"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("salaries");
  },
};