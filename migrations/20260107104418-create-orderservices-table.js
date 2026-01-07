'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_services", {
      order_id: {
        type: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      payment_status: {
        type: Sequelize.DataTypes.ENUM("pending", "authorized", "failed"),
        allowNull: true,
      },
      inventory_status: {
        type: Sequelize.DataTypes.ENUM("pending", "reserved", "out_of_stock"),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_services");
  }
};
