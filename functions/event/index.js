require('dotenv').config();

// Endpoint for receiving incoming events

exports.event = async (req, res) => {
  console.log(req.body);
  // use this schema for validation later
  const schema = req.body.schema;

  const sensors = req.body.sensors;
  const readings = sensors.map((sensor) => {
    return {
      type: sensor.type,
      label: sensor.label,
      reading: sensor.reading,
      unit: sensor.UoM,
      recorded_at: sensor.recorded_at,
    };
  });
  console.log('Sensor readings: ', readings);

  // Validate the data

  // firestore init
  const Firestore = require('@google-cloud/firestore');
  const db = new Firestore({
    projectId: process.env.PROJECT_ID,
    keyFilename: './env/' + process.env.KEY_FILENAME,
  });

  // Fetch relevant user
  const username = req.body.username;
  const usersRef = db.collection('users');
  const queryRef = usersRef.where('username', '==', username);

  const snapshot = await queryRef.get();
  if (snapshot.empty) {
    console.log('No matching user found');
    // TODO: Insert the user

    return;
  }

  console.log('Total results found: ', snapshot.size);
  if (snapshot.size > 1) {
    // if more than 1, do something about it
    return res.status(500).send('Non-unique user. Something went wrong.');
  }

  snapshot.forEach((doc) => {
    let userRef = doc.id;
    console.log(doc.id, '=>', doc.data());

    // try to get last readings
    // remove this once verified it's working, only need for FE UI
    async function getReadings(doc) {
      const latest_readings = await db
        .collection('users')
        .doc(doc.id)
        .collection('readings')
        .get();
      latest_readings.forEach((reading) => {
        console.log('reading: ', reading.data());
      });
    }

    getReadings(doc);

    // Hand it off to queue / pubsub to get to ES

    // And insert into latest readings
    async function updateReadings(readings, userRef) {
      console.log('Updating user readings', readings);

      const insertReading = async (reading) => {
        return await usersRef
          .doc(userRef)
          .collection('readings')
          .doc()
          .set(reading);
      };
      return Promise.all(
        readings.map((reading) => {
          console.log('Attempting to update reading: ', { reading });
          insertReading(reading);
          return Promise.resolve('ok');
        }),
      );
    }

    updateReadings(readings, userRef);

    // Update the user...
    async function updateUser(userRef) {
      const admin = require('firebase-admin');
      const FieldValue = admin.firestore.FieldValue;
      const res = await userRef.update({
        last_updated: FieldValue.serverTimestamp(),
      });
    }

    const docRef = usersRef.doc(userRef);
    updateUser(docRef);
  });

  // catch exceptions

  // return status
  res.status(200).send('Hello!');
};
