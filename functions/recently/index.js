/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

require('dotenv').config();

exports.recently = async (req, res) => {
  const Firestore = require('@google-cloud/firestore');
  const db = new Firestore();

  const username = req.query.username;
  if (!username) {
    res.status(500).send('Must supply username');
  } else {
    const queryRef = db.collection('users').where('username', '==', username);
    const snapshot = await queryRef.get();

    if (snapshot.empty) {
      // user not found
      res.status(404).send('User not found');
    } else {
      snapshot.forEach((doc) => {
        // get the readings for user
        async function getReadings(doc) {
          const readings = await db
            .collection('users')
            .doc(doc.id)
            .collection('readings')
            .orderBy('recorded_at', 'desc')
            .limit(10)
            .get();

          let r = [];
          readings.forEach((reading) => {
            r.push(reading.data());
          });

          let message = '<ul>';
          message = message.concat(
            r
              .map((reading) => {
                return `<li>${reading.reading} ${reading.UoM} (${reading.recorded_at})</li>`;
              })
              .join(''),
          );
          message = message.concat('</ul>');

          res.status(200).send(message);
        }

        getReadings(doc);
      });
    }
  }
};
