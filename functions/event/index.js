// Endpoint for receiving incoming events

exports.event = async (req, res) => {
  require('dotenv').config();
  // set default for status code
  let statusCode = 200;

  // firestore init
  const Firestore = require('@google-cloud/firestore');
  const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    keyFilename: './env/' + process.env.KEY_FILENAME,
  });

  // globals for server ts
  const admin = require('firebase-admin');
  const serverTime = admin.firestore.FieldValue.serverTimestamp();

  // iterate over readings and store in user collection
  async function updateReadings(readings, userDocID) {
    const insertReading = async (reading) => {
      return await db
        .collection('users')
        .doc(userDocID)
        .collection('readings')
        .doc()
        .set(reading);
    };
    return Promise.all(
      readings.map((reading) => {
        insertReading(reading);
        return Promise.resolve('ok');
      }),
    );
  }

  // use this schema for validation later
  const schema = req.body.schema;
  const schemaVersion = req.body.version;
  const readings = req.body.readings.map((reading) => {
    return {
      schema: schema,
      schema_version: schemaVersion,
      server_created_at: serverTime,
      ...reading,
    };
  });

  // TODO: Validate the data

  // Fetch relevant user
  const username = req.body.username;
  const queryRef = db.collection('users').where('username', '==', username);

  const snapshot = await queryRef.get();
  let userDocID = false;
  if (snapshot.empty) {
    // user not found, insert the new user
    const newUserData = {
      username: username,
      device_name: req.body.device_name,
      created_at: serverTime,
    };
    userRef = db.collection('users').doc();
    await userRef.set(newUserData);
    userDocID = userRef.id;

    // change status code but don't return because
    // we still have work to do
    statusCode = 201;
  }

  if (snapshot.size > 1) {
    // if more than 1, do something about it
    return res.status(500).send('Non-unique user. Something went wrong.');
  }

  snapshot.forEach((doc) => {
    // this loop looks weird but shouldn't ever be more than 1
    userDocID = doc.id;
  });

  // insert into latest readings
  updateReadings(readings, userDocID);

  // TODO: Hand it off to queue / pubsub to get to ES

  // Update the user...
  async function updateUser(docRef) {
    const res = await docRef.update({
      last_updated: serverTime,
    });
  }

  const docRef = db.collection('users').doc(userDocID);
  updateUser(docRef);

  // TODO: catch exceptions and do something

  // return status
  res.status(statusCode).send('Hello!');
};
