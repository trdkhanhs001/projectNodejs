const axios = require('axios');
const cloudinary = require('../config/cloudinary');

// Fallback image - placeholder generic
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Download ảnh từ URL
 * @param {string} imageUrl - URL ảnh cần download
 * @param {number} retryCount - Số lần retry
 * @returns {Promise<Buffer>} Buffer của ảnh
 */
async function downloadImage(imageUrl, retryCount = 0) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`   ⏳ Retry ${retryCount + 1}/${MAX_RETRIES}: ${imageUrl}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return downloadImage(imageUrl, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Upload ảnh lên Cloudinary
 * @param {Buffer} imageBuffer - Buffer của ảnh
 * @param {string} menuName - Tên menu (dùng cho public_id)
 * @returns {Promise<string>} URL của ảnh đã upload
 */
function uploadToCloudinary(imageBuffer, menuName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'restaurant/menus',
        resource_type: 'auto',
        public_id: `menu_${menuName.toLowerCase().replace(/\s+|[\W_]+/g, '_')}`,
        format: 'jpg',
        quality: 'auto',
        overwrite: true,
        timeout: 60000
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(imageBuffer);
  });
}

/**
 * Upload ảnh từ URL lên Cloudinary (có retry và fallback)
 * @param {string} imageUrl - URL ảnh cần upload
 * @param {string} menuName - Tên menu
 * @param {Object} options - Các tùy chọn
 * @param {boolean} options.useFallback - Có dùng fallback nếu thất bại (default: true)
 * @param {boolean} options.silent - Không log chi tiết (default: false)
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
async function uploadMenuImage(imageUrl, menuName, options = {}) {
  const { useFallback = true, silent = false } = options;

  try {
    if (!silent) {
      console.log(`   📥 Downloading image: ${menuName}`);
    }

    // Download ảnh
    const imageBuffer = await downloadImage(imageUrl);

    if (!silent) {
      console.log(`   ☁️  Uploading to Cloudinary...`);
    }

    // Upload lên Cloudinary
    const uploadedUrl = await uploadToCloudinary(imageBuffer, menuName);

    if (!silent) {
      console.log(`   ✅ Uploaded successfully`);
    }

    return {
      success: true,
      url: uploadedUrl,
      error: null
    };
  } catch (error) {
    console.error(`   ❌ Error uploading ${menuName}: ${error.message}`);

    // Fallback: upload ảnh generic nếu cho phép
    if (useFallback && imageUrl !== FALLBACK_IMAGE_URL) {
      try {
        if (!silent) {
          console.log(`   🔄 Retrying with fallback image...`);
        }

        const fallbackBuffer = await downloadImage(FALLBACK_IMAGE_URL);
        const fallbackUrl = await uploadToCloudinary(fallbackBuffer, menuName);

        if (!silent) {
          console.log(`   ✅ Uploaded with fallback image`);
        }

        return {
          success: true,
          url: fallbackUrl,
          error: `Original image failed, used fallback: ${error.message}`
        };
      } catch (fallbackError) {
        console.error(`   ❌ Fallback also failed: ${fallbackError.message}`);
        return {
          success: false,
          url: null,
          error: fallbackError.message
        };
      }
    }

    return {
      success: false,
      url: null,
      error: error.message
    };
  }
}

/**
 * Batch upload nhiều ảnh song song (Promise.all)
 * @param {Array<{name: string, imageUrl: string}>} menuItems - Danh sách menu cần upload
 * @param {Object} options - Các tùy chọn
 * @param {number} options.concurrency - Số ảnh upload cùng lúc (default: 5)
 * @returns {Promise<Array>} Mảng kết quả upload
 */
async function batchUploadImages(menuItems, options = {}) {
  const { concurrency = 5 } = options;

  const results = [];
  const chunks = [];

  // Chia thành chunks để kiểm soát concurrency
  for (let i = 0; i < menuItems.length; i += concurrency) {
    chunks.push(menuItems.slice(i, i + concurrency));
  }

  let processedCount = 0;

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(item =>
        uploadMenuImage(item.imageUrl, item.name, { useFallback: true })
          .then(result => {
            processedCount++;
            console.log(`   Progress: ${processedCount}/${menuItems.length}`);
            return { ...result, menuName: item.name };
          })
      )
    );

    results.push(...chunkResults);
  }

  return results;
}

/**
 * Get summary của batch upload
 * @param {Array} results - Kết quả từ batchUploadImages
 * @returns {Object} Summary stats
 */
function getUploadSummary(results) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const withFallback = results.filter(r => r.error && r.success).length;

  return {
    total: results.length,
    successful,
    failed,
    withFallback,
    successRate: `${((successful / results.length) * 100).toFixed(2)}%`
  };
}

module.exports = {
  uploadMenuImage,
  batchUploadImages,
  getUploadSummary,
  FALLBACK_IMAGE_URL
};
