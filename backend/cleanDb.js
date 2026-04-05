const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://baokie2004_db_user:baokietz09@restaurant.kzcd0yp.mongodb.net/?appName=Restaurant')
  .then(() => {
    const db = mongoose.connection.db;
    db.collection('orders').deleteMany({})
      .then(r => {
        console.log(`✅ Deleted ${r.deletedCount} old orders`);
        process.exit(0);
      })
      .catch(e => {
        console.log('Error:', e.message);
        process.exit(1);
      });
  })
  .catch(e => {
    console.log('Connection error:', e.message);
    process.exit(1);
  });
