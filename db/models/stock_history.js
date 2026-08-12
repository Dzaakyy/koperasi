module.exports = (sequelize, DataTypes) => {
  const StockHistory = sequelize.define('StockHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'stock_histories',
    timestamps: true,
    underscored: true
  });

  StockHistory.associate = (models) => {
    StockHistory.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    StockHistory.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return StockHistory;
};
