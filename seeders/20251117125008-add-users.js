'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      { uploaded_image: "users/uploaded/user1.jpg" },
      { uploaded_image: "users/uploaded/user2.jpg" },
      { uploaded_image: "users/uploaded/user3.jpg" },
      { uploaded_image: "users/uploaded/user4.jpg" },
      { uploaded_image: "users/uploaded/user5.jpg" },
      { uploaded_image: "users/uploaded/user6.jpg" },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {})
  }
};
