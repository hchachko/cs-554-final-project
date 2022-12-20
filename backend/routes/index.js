const userRoutes = require('./users');
const genreRoutes = require('./genres');

const constructorMethod = (app) => {
  app.use('/user', userRoutes);
  app.use('/genre', genreRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
