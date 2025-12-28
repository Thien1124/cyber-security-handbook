import { Blacklist, Report } from '../models/index.js';

export const getStatistics = async (req, res) => {
  try {
    const [
      totalBlacklist,
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      scamsByType,
      scamsByDangerLevel,
      recentActivity,
    ] = await Promise.all([
      Blacklist.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'approved' }),
      Report.countDocuments({ status: 'rejected' }),
      
      Blacklist.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$scamType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      
      Blacklist.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$dangerLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      
      Blacklist.find({ isActive: true })
        .select('url scamType createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stats = {
      overview: {
        totalBlacklist,
        totalReports,
        pendingReports,
        approvedReports,
        rejectedReports,
      },
      scamsByType: scamsByType.map(item => ({
        type: item._id,
        count: item.count,
      })),
      scamsByDangerLevel: scamsByDangerLevel.map(item => ({
        level: item._id,
        count: item.count,
      })),
      recentActivity,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getTrendingScams = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysNum);

    const trending = await Blacklist.find({
      isActive: true,
      createdAt: { $gte: dateThreshold },
    })
      .select('url scamType dangerLevel reportCount createdAt')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      period: `${daysNum} ngày qua`,
      data: trending,
    });
  } catch (error) {
    console.error('Trending Scams Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getReportStats = async (req, res) => {
  try {
    const reportsByStatus = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$scamType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        byStatus: reportsByStatus.map(item => ({
          status: item._id,
          count: item.count,
        })),
        byType: reportsByType.map(item => ({
          type: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error('Report Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
