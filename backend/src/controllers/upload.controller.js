const cloudinary = require('../config/cloudinary');
const User = require('../models/user.model');
const Menu = require('../models/menu.model');
const Staff = require('../models/staff.model');

/**
 * Upload user avatar to Cloudinary
 */
exports.uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const userId = req.user.id;

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant/avatars',
        resource_type: 'auto',
        public_id: `user_${userId}`,
        overwrite: true,
        format: 'jpg',
        quality: 'auto'
      },
      async (error, result) => {
        if (error) {
          return res.status(400).json({ message: 'Upload failed: ' + error.message });
        }

        try {
          // Update user avatar URL in database
          const user = await User.findByIdAndUpdate(
            userId,
            { avatar: result.secure_url },
            { new: true }
          ).select('-password');

          res.status(200).json({
            message: 'Avatar uploaded successfully',
            url: result.secure_url,
            user: user
          });
        } catch (err) {
          res.status(400).json({ message: 'Failed to update profile: ' + err.message });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

/**
 * Upload menu item image to Cloudinary
 */
exports.uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { menuId } = req.params;

    // Check if menu exists
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant/menus',
        resource_type: 'auto',
        public_id: `menu_${menuId}`,
        overwrite: true,
        format: 'jpg',
        quality: 'auto'
      },
      async (error, result) => {
        if (error) {
          return res.status(400).json({ message: 'Upload failed: ' + error.message });
        }

        try {
          // Update menu image URL in database
          const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { image: result.secure_url },
            { new: true }
          ).populate('category', 'name');

          res.status(200).json({
            message: 'Menu image uploaded successfully',
            url: result.secure_url,
            menu: updatedMenu
          });
        } catch (err) {
          res.status(400).json({ message: 'Failed to update menu: ' + err.message });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

/**
 * Upload staff avatar to Cloudinary
 */
exports.uploadStaffImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { staffId } = req.params;

    // Check if staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Upload to Cloudinary using upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant/staff',
        resource_type: 'auto',
        public_id: `staff_${staffId}`,
        overwrite: true,
        format: 'jpg',
        quality: 'auto'
      },
      async (error, result) => {
        if (error) {
          return res.status(400).json({ message: 'Upload failed: ' + error.message });
        }

        try {
          // Update staff avatar URL in database
          const updatedStaff = await Staff.findByIdAndUpdate(
            staffId,
            { avatar: result.secure_url },
            { new: true }
          );

          res.status(200).json({
            message: 'Staff avatar uploaded successfully',
            url: result.secure_url,
            staff: updatedStaff
          });
        } catch (err) {
          res.status(400).json({ message: 'Failed to update staff: ' + err.message });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

/**
 * Delete image from Cloudinary
 */
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      message: 'Image deleted successfully',
      result: result
    });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed: ' + err.message });
  }
};

/**
 * Get upload signature for client-side upload (optional)
 */
exports.getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'restaurant'
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      timestamp: timestamp,
      signature: signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate signature: ' + err.message });
  }
};
