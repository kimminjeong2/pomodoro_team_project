const Sequelize = require("sequelize");
const config = require(__dirname + "/../config/config.js")["development"];

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Task = require("./Task")(sequelize, Sequelize.DataTypes);
db.Feed = require("./Feed")(sequelize, Sequelize.DataTypes);
db.Like = require("./Like")(sequelize, Sequelize.DataTypes);
db.Comment = require("./Comment")(sequelize, Sequelize.DataTypes);

// 모델 간의 관계 설정
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
