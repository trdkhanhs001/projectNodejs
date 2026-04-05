const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { checkLogin, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    console.log('[STAFF GET]', { page, limit, search, userId: req.user?.id });
    
    const result = await staffController.getAllStaff(
      { search },
      parseInt(page),
      parseInt(limit)
    );
    
    console.log('[STAFF RESULT]', { 
      staffCount: result.staff?.length, 
      total: result.total, 
      pages: result.pages 
    });
    
    res.status(200).json(result);
  } catch (err) {
    console.error('[STAFF ERROR]', err.message);
    res.status(400).json({ message: err.message });
  }
});


router.get('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {  
    const result = await staffController.getStaffById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/', checkLogin, checkRole('ADMIN'), upload.single('avatar'), async function (req, res, next) {
  try {
    const result = await staffController.createStaff(req.body, req.user.id, req.file);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', checkLogin, checkRole('ADMIN', 'STAFF'), upload.single('avatar'), async function (req, res, next) {
  try {
    // Staff can only update their own profile
    if (req.user.role === 'STAFF' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await staffController.updateStaff(req.params.id, req.body, req.file);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', checkLogin, checkRole('ADMIN'), async function (req, res, next) {
  try {
    const result = await staffController.deleteStaff(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff account deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/stats/today', async function (req, res, next) {
  try {
    const stats = await staffController.getTodayStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error('[STATS ERROR]', err.message);
    res.status(400).json({ message: err.message });
  }
});



module.exports = router;
