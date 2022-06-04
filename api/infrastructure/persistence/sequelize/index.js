import { Sequelize, DataTypes } from 'sequelize';

const authenticate = async (sequelize) => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

const sequelize = new Sequelize('sqlite::memory:')
await authenticate(sequelize);

const RuleSetSchema = sequelize.define('Rulesets', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  from: {
    type: DataTypes.STRING,
    allowNull: true
  },
  to: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fromValue: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  toValue: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fromGas: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  toGas: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
});

await sequelize.sync({ force: true });

export { RuleSetSchema }