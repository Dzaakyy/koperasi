module.exports = (sequelize, DataTypes) => {
  const SaleItem = sequelize.define('SaleItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sale_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    selling_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    subtotal: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
  }, {
    tableName: 'sale_items',
    timestamps: true,
    underscored: true
  });

  SaleItem.associate = (models) => {
    SaleItem.belongsTo(models.Sale, { foreignKey: 'sale_id', as: 'sale' });
    SaleItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return SaleItem;
};
