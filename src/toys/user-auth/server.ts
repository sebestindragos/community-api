import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import {MongoClient, Collection, ObjectID} from 'mongodb';

// tslint:disable
let usersCollection: Collection | undefined = undefined;
let sessionsCollection: Collection | undefined = undefined;
let app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/register', async function (req, res) {
  if (!usersCollection || !sessionsCollection) return res.status(500).end();

  // find user account
  let user = await usersCollection.findOne({
    email: req.body.email.toLowerCase()
  });

  // if user already exists, return error
  if (user) return res.status(409).end();

  let newUser = {
    _id: new ObjectID(),
    email: req.body.email,
    password: req.body.password
  };
  await usersCollection.insertOne(newUser);
  res.end();
});

app.post('/login', async function (req, res) {
  if (!usersCollection || !sessionsCollection) return res.status(500).end();

  // find user account
  let user = await usersCollection.findOne({
    email: req.body.email.toLowerCase()
  });

  if (!user) return res.status(404).end();

  // check passwords
  if (user.password !== req.body.password) return res.status(400).end();

  // create a new session and save it in the DB
  let session = {
    _id: new ObjectID(),
    userId: user._id
  };
  await sessionsCollection.insertOne(session);

  // set session cookie
  res.cookie('sessionId', session._id);

  // remove sensitive info
  delete user.password;

  res.json({
    user: user
  });
});

app.get('/protected', async function (req, res) {
  if (!usersCollection || !sessionsCollection) return res.status(500).end();

  // find cookie session
  let sessionId = req.cookies.sessionId;

  // try to find user session
  let session = await sessionsCollection.findOne({
    _id: new ObjectID(sessionId)
  });

  // if no session found, user is not authorized
  if (!session) return res.status(401).end();

  // return protected resource
  res.json({
    message: "Hey, I'm a protected resource"
  });
});

const PORT = 8082;

MongoClient.connect('mongodb://localhost:27017', {
  useNewUrlParser: true
})
  .then(function (mongoClient) {
    return mongoClient.db('user-auth');
  })
  .then(function (db) {
    usersCollection = db.collection('users');
    sessionsCollection = db.collection('sessions');
  });

app.listen(PORT, function () {
  console.log('magic happens on port', PORT);
});
