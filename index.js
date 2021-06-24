require('dotenv').config();

const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  keyFilename: './env/' + process.env.KEY_FILENAME,
});

async function getDocuments() {
  const snapshot = await db.collection('cooks').get();
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());

    // try to get last readings
    async function getReadings(doc) {
      const readings = await db
        .collection('cooks')
        .doc(doc.id)
        .collection('last-readings')
        .get();
      readings.forEach((reading) => {
        console.log('reading: ', reading.data());
      });
    }

    getReadings(doc);
  });
}

getDocuments();
