const { Router } = require('express');
const profileRoutes = require('./profile.routes');
const technologyRoutes = require('./technology.routes');
const projectRoutes = require('./project.routes');

const router = Router();

router.get('/', (req, res) => {
  res.json({ name: 'DevShowcase API', status: 'ok', docs: '/api/docs' });
});

router.use('/profiles', profileRoutes);
router.use('/technologies', technologyRoutes);
router.use('/projects', projectRoutes);

module.exports = router;
