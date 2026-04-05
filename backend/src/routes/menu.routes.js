const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async function (req, res, next) {
  try {
    const result = await menuController.getAllMenus();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const result = await menuController.getMenuById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/', checkLogin, checkRole('ADMIN'), upload.single('image'), async function (req, res, next) {
  try {
    const result = await menuController.createMenu(req.body, req.user.id, req.file);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', checkLogin, checkRole('ADMIN'), upload.single('image'), async function (req, res, next) {
  try {
    const result = await menuController.updateMenu(req.params.id, req.body, req.user.id, req.file);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await menuController.deleteMenu(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
