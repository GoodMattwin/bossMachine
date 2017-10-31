const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./server/db');
const morgan = require('morgan');
const checkMillionDollarIdea = require('./server/checkMillionDollarIdea')

module.exports = app;

/* Do not change the following line! It is required for testing and allowing
*  the frontend application to interact as planned with the api server
*/
const PORT = process.env.PORT || 4001;

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Middleware for logging
app.use(morgan('dev'));

// Mount your existing apiRouter below at the '/api' path.
const apiRouter = require('./server/api');
app.use('/api', apiRouter);

apiRouter.use(['/minions', '/minions/:minionId', '/ideas', '/ideas/:ideaId', '/meetings', '/work'], (req, res, next) => {
  req.whichPath = req.baseUrl.split('/');
  req.model = req.whichPath[2];
  req.databaseModel = db.getAllFromDatabase(req.model);
  next();
});

apiRouter.use(['/minions/:minionId', '/ideas/:ideaId'], (req, res, next) => {
  req.instanceId = req.params.minionId || req.params.ideaId || 'err';
  if (!isNaN(req.instanceId) && db.getFromDatabaseById(req.model, req.instanceId) !== -1) {
      req.instance = db.getFromDatabaseById(req.model, req.instanceId);
  }
  next();
});

apiRouter.get(['/minions', '/ideas'], (req, res, next) => {
  res.send(req.databaseModel);
});

apiRouter.get(['/minions/:minionId', '/ideas/:ideaId'], (req, res, next) => {
  if (req.instance) {
    res.send(req.instance);
  } else res.status(404).send();
});

apiRouter.post(['/minions', '/ideas'], checkMillionDollarIdea, (req, res, next) => {
  const newInstance = db.addToDatabase(req.model, req.body);
  res.status(201).send(newInstance);
});

apiRouter.put(['/minions/:minionId', '/ideas/:ideaId'], checkMillionDollarIdea, (req, res, next) => {
  const updatedInstance = db.updateInstanceInDatabase(req.model, req.body);
  if (updatedInstance && !isNaN(req.instanceId)) res.send(updatedInstance);
  else res.status(404).send();
});

apiRouter.delete(['/minions/:minionId', '/ideas/:ideaId'], (req, res, next) => {
  const didDelete = db.deleteFromDatabasebyId(req.model, req.instanceId);
  if (didDelete) res.status(204).send();
  else res.status(404).send();
});


// This conditional is here for testing purposes:
if (!module.parent) {
  // Add your code to start the server listening at PORT below:
  app.listen(PORT, () => {
    console.log('Server listening on port 4001');
  });
}
