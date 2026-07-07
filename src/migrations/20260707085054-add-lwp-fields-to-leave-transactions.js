"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("leave_transactions");

    if (!table.paidDays) {
      await queryInterface.addColumn("leave_transactions", "paidDays", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!table.paidLeaveDays) {
      await queryInterface.addColumn("leave_transactions", "paidLeaveDays", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!table.lwpDays) {
      await queryInterface.addColumn("leave_transactions", "lwpDays", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!table.isLwp) {
      await queryInterface.addColumn("leave_transactions", "isLwp", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });

      await queryInterface.addIndex(
        "leave_transactions",
        ["isLwp"],
        {
          name: "idx_leave_transactions_isLwp",
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("leave_transactions");

    if (table.isLwp) {
      try {
        await queryInterface.removeIndex(
          "leave_transactions",
          "idx_leave_transactions_isLwp"
        );
      } catch (err) {}

      await queryInterface.removeColumn(
        "leave_transactions",
        "isLwp"
      );
    }

    if (table.lwpDays) {
      await queryInterface.removeColumn(
        "leave_transactions",
        "lwpDays"
      );
    }

    if (table.paidLeaveDays) {
      await queryInterface.removeColumn(
        "leave_transactions",
        "paidLeaveDays"
      );
    }

    if (table.paidDays) {
      await queryInterface.removeColumn(
        "leave_transactions",
        "paidDays"
      );
    }
  },
};