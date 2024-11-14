/**
 * timer 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const pomotimer = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "pomotimer",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      task_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true, // 필요 시 false로 변경
      },
      end_time: {
        type: DataTypes.DATE,
      },
      duration: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // 현재 시간으로 기본값 설정
      },
    },
    {
      timestamps: true, // created_at과 update_at 자동생성
      createdAt: "created_at",
      updatedAt: "update_at",
    }
  );
};

module.exports = timer;
