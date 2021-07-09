// Endpoint for receiving incoming events

exports.event = (req, res) => {
  let message =
    req.query.message || req.body.message || 'Hello World! This is a function';
  res.status(200).send(message);
};

// Validate the data

// Fetch relevant user/device/cook

// Hand it off to queue / pubsub to get to ES

// Update the user...

// And insert into latest readings
