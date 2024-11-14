/**
 * user 모델을 정의하는 함수
 * @param {import("sequelize").Sequelize} Sequelize
 * @param {import("sequelize").DataTypes} DataTypes
 */

const { DataTypes } = require("sequelize");

const user = (Sequelize, DataTypes) => {
  const User = Sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        // 본인 이름
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nickname: {
        // 닉네임
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // 닉네임 중복 불가 설정
      },
      emailAddr: {
        // 이메일 주소
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true, // 이메일 중복 불가 설정
        validate: {
          isEmail: true,
        },
      },
      password: {
        // 비밀번호
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phoneNumber: {
        // 휴대전화 번호
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      profile_image: {
        // 프로필 이미지
        type: DataTypes.STRING(255),
      },
      tomato: {
        // 프로필 이미지
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // 현재 시간으로 기본값 설정
      },
      update_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true, // created_at과 update_at을 자동 생성
      createdAt: "created_at",
      updatedAt: "update_at",
    }
  );

  // 모델 간 관계 정의
  User.associate = (models) => {
    User.hasMany(models.Feed, { foreignKey: "user_id" }); // Feed 모델과의 1:N 관계
    User.hasMany(models.Comment, { foreignKey: "user_id" }); // Comment 모델과의 1:N 관계
  };

  return User;
};

module.exports = user;
