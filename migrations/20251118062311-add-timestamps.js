'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "created_at", {
      type: Sequelize.DataTypes.DATE,
    })
    await queryInterface.addColumn("users", "updated_at", {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(0),
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "created_at")
    await queryInterface.removeColumn("users", "updated_at")
  }
};
