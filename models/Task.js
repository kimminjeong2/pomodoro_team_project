/**
 * task 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const Task = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      state: {
        type: DataTypes.ENUM("pending", "ongoing", "done"),
        defaultValue: "pending",
      },
      // duration: {
      //   // 각 할일의 걸린 시간을 초 단위로 저장
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true, // create_at과 update_at을 자동생성
      createdAt: "crated_at",
      updatedAt: "update_at",
    }
  );

  // 모델 간 관계 정의
  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      // Feed는 하나의 User에 속함
      foreignKey: "user_id", // foreign key
      targetKey: "id", // target key (User 모델의 id와 매칭)
    });
  };
};

module.exports = Task;
