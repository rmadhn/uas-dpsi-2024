const { Sequelize } = require("sequelize");
require("dotenv").config();

// Konfigurasi koneksi Sequelize
const sequelize = new Sequelize({
  host: process.env.HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  dialect: "mysql",
  dialectModule: require("mysql2"),
  benchmark: true,
});

// Import model
const User = require("./user")(sequelize);
const Category = require("./category")(sequelize);
const Product = require("./product")(sequelize);
const Arsip = require("./arsip")(sequelize);

// Define associations
Product.belongsTo(Category, { foreignKey: "categoryID" });
Arsip.belongsTo(Category, { foreignKey: "categoryID" });

// Sinkronkan model dengan database
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Arsip,
};
