const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI
}