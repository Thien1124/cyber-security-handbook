import { Blacklist } from '../models/index.js';
import { normalizeUrl, isValidUrl } from '../utils/index.js';

export const getAllBlacklist = async (req, res) => {
  try {
    const { page = 1, limit = 20, scamType, dangerLevel, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const query = { isActive: true };

    if (scamType) query.scamType = scamType;
    if (dangerLevel) query.dangerLevel = dangerLevel;
    if (search) {
      query.$or = [
        { url: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (pageNum - 1) * limitNum;

    const [blacklists, total] = await Promise.all([
      Blacklist.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blacklist.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: blacklists,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Get All Blacklist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getBlacklistById = async (req, res) => {
  try {
    const { id } = req.params;

    const blacklist = await Blacklist.findById(id);

    if (!blacklist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi',
      });
    }

    return res.status(200).json({
      success: true,
      data: blacklist,
    });
  } catch (error) {
    console.error('Get Blacklist By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const createBlacklist = async (req, res) => {
  try {
    const { url, scamType, dangerLevel, description, evidenceImages } = req.body;

    if (!url || !scamType || !dangerLevel) {
      return res.status(400).json({
        success: false,
        message: 'URL, scamType và dangerLevel là bắt buộc',
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'URL không hợp lệ',
      });
    }

    const normalizedUrl = normalizeUrl(url);

    const existing = await Blacklist.findOne({ normalizedUrl, isActive: true });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'URL đã tồn tại trong blacklist',
      });
    }

    const blacklist = await Blacklist.create({
      url,
      normalizedUrl,
      scamType,
      dangerLevel,
      description: description || '',
      evidenceImages: evidenceImages || [],
      source: 'admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm vào blacklist thành công',
      data: blacklist,
    });
  } catch (error) {
    console.error('Create Blacklist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateBlacklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { scamType, dangerLevel, description, evidenceImages } = req.body;

    const blacklist = await Blacklist.findById(id);

    if (!blacklist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi',
      });
    }

    if (scamType) blacklist.scamType = scamType;
    if (dangerLevel) blacklist.dangerLevel = dangerLevel;
    if (description !== undefined) blacklist.description = description;
    if (evidenceImages) blacklist.evidenceImages = evidenceImages;

    await blacklist.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: blacklist,
    });
  } catch (error) {
    console.error('Update Blacklist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const deleteBlacklist = async (req, res) => {
  try {
    const { id } = req.params;

    const blacklist = await Blacklist.findById(id);

    if (!blacklist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi',
      });
    }

    blacklist.isActive = false;
    await blacklist.save();

    return res.status(200).json({
      success: true,
      message: 'Xóa thành công',
    });
  } catch (error) {
    console.error('Delete Blacklist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
