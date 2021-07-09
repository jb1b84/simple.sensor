// Endpoint for receiving incoming events

exports.event = (req, res) => {
  console.log(req.body);
  let schema = req.body.schema;
  console.log('Event schema is ', schema);

  const sensors = req.body.sensors;
  sensors.forEach((sensor) => {
    console.log(sensor.label + ' = ' + sensor.reading + sensor.UoM);
  });

  // stash into recent readings

  res.status(200).send('Hello!');
};

// Validate the data

// Fetch relevant user/device/cook

// Hand it off to queue / pubsub to get to ES

// Update the user...

// And insert into latest readings
