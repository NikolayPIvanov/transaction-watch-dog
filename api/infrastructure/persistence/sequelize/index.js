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

const RuleSetSchema = sequelize.define('Ruleset', {
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

const EventSchema = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  body: {
    type: DataTypes.STRING,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

await sequelize.sync({ force: true });

export { EventSchema, RuleSetSchema }

// Multiple instances of the message relay - N
// M records that need to be read and sent - M

// How can we make such as that no copies of M are processed by N
// e.g from 10 messages, 5 go to relay 1 and 5 to relay 2