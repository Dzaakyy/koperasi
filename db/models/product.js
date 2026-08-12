module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    barcode: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    purchase_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    selling_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Product.hasMany(models.StockHistory, { foreignKey: 'product_id', as: 'stockHistories' });
    Product.hasMany(models.SaleItem, { foreignKey: 'product_id', as: 'saleItems' });
  };

  return Product;
};
