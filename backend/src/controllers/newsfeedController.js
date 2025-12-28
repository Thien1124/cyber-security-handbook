import { Blacklist } from '../models/index.js';

export const getNewsfeed = async (req, res) => {
  try {
    const { limit = 20, page = 1, scamType, dangerLevel } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Giới hạn tối đa 50 bản ghi',
      });
    }

    const query = { isActive: true };

    if (scamType) {
      query.scamType = scamType;
    }

    if (dangerLevel) {
      query.dangerLevel = dangerLevel;
    }

    const skip = (pageNum - 1) * limitNum;

    const [scams, total] = await Promise.all([
      Blacklist.find(query)
        .select('url scamType dangerLevel description reportCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blacklist.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: scams,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        recordsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Newsfeed Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách',
      error: error.message,
    });
  }
};

export const getTopScams = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const scams = await Blacklist.find({ isActive: true })
      .select('url scamType dangerLevel reportCount createdAt')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      total: scams.length,
      data: scams,
    });
  } catch (error) {
    console.error('Top Scams Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getScamsByType = async (req, res) => {
  try {
    const stats = await Blacklist.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$scamType',
          count: { $sum: 1 },
          avgDangerLevel: { $avg: { $literal: 1 } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formattedStats = stats.map(stat => ({
      scamType: stat._id,
      count: stat.count,
    }));

    return res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error('Scams By Type Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
