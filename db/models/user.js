module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'kasir'), allowNull: false, defaultValue: 'kasir' },
    status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasMany(models.Sale, { foreignKey: 'user_id', as: 'sales' });
    User.hasMany(models.StockHistory, { foreignKey: 'user_id', as: 'stockHistories' });
  };

  return User;
};
