const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { checkLogin, checkRole } = require('../middleware/auth');

router.get('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await tableController.getAllTables(parseInt(page), parseInt(limit));
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/available', async function (req, res, next) {
  try {
    const tables = await tableController.getAvailableTables();
    res.status(200).json(tables);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/stats', checkLogin, checkRole('STAFF', 'ADMIN'), async function (req, res, next) {
  try {
    const stats = await tableController.getTableStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const table = await tableController.getTableById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await tableController.createTable(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await tableController.updateTable(req.params.id, req.body, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await tableController.deleteTable(req.params.id);
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
