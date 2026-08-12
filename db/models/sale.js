module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    paid: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    change: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'sales',
    timestamps: true,
    underscored: true
  });

  Sale.associate = (models) => {
    Sale.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Sale.hasMany(models.SaleItem, { foreignKey: 'sale_id', as: 'items' });
  };

  return Sale;
};
