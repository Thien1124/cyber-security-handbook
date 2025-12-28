import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được upload',
      });
    }

    if (req.files.length > 5) {
      for (const file of req.files) {
        await fs.unlink(file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Tối đa 5 ảnh mỗi lần upload',
      });
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);

    for (const file of req.files) {
      await fs.unlink(file.path);
    }

    const imageUrls = results.map(result => result.url);

    return res.status(200).json({
      success: true,
      message: 'Upload ảnh thành công',
      data: {
        images: imageUrls,
        count: imageUrls.length,
      },
    });
  } catch (error) {
    console.error('Upload Images Error:', error);

    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('File cleanup error:', unlinkError);
        }
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message,
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'publicId là bắt buộc',
      });
    }

    await deleteFromCloudinary(publicId);

    return res.status(200).json({
      success: true,
      message: 'Xóa ảnh thành công',
    });
  } catch (error) {
    console.error('Delete Image Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa ảnh',
      error: error.message,
    });
  }
};
