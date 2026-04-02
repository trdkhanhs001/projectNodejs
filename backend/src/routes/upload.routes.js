const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * POST /api/upload/avatar
 * Upload user avatar - requires user login
 * Accepts: multipart/form-data with 'file' field
 */
router.post('/avatar', checkLogin, checkRole('USER'), upload.single('file'), async function (req, res, next) {
  try {
    await uploadController.uploadUserAvatar(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/upload/menu/:menuId
 * Upload menu item image - requires admin
 * Accepts: multipart/form-data with 'file' field
 */
router.post('/menu/:menuId', checkLogin, checkRole('ADMIN'), upload.single('file'), async function (req, res, next) {
  try {
    await uploadController.uploadMenuImage(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/upload/signature
 * Get upload signature for client-side upload
 * Used for temporary uploads before moving to permanent storage
 */
router.post('/signature', checkLogin, async function (req, res, next) {
  try {
    await uploadController.getUploadSignature(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * DELETE /api/upload/:publicId
 * Delete image from Cloudinary - requires admin
 * Body: { publicId }
 */
router.delete('/:publicId', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const publicId = req.params.publicId;
    await uploadController.deleteImage({ body: { publicId } }, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
