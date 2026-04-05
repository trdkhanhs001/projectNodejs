const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/avatar', checkLogin, checkRole('USER'), upload.single('file'), async function (req, res, next) {
  try {
    await uploadController.uploadUserAvatar(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/menu/:menuId', checkLogin, checkRole('ADMIN'), upload.single('file'), async function (req, res, next) {
  try {
    await uploadController.uploadMenuImage(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/staff/:staffId', checkLogin, checkRole('ADMIN'), upload.single('file'), async function (req, res, next) {
  try {
    await uploadController.uploadStaffImage(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/signature', checkLogin, async function (req, res, next) {
  try {
    await uploadController.getUploadSignature(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:publicId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const publicId = req.params.publicId;
    await uploadController.deleteImage({ body: { publicId } }, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
