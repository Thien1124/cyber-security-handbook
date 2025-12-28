import { Report } from '../models/index.js';
import { normalizeUrl, isValidUrl } from '../utils/index.js';
import { validationResult } from 'express-validator';

export const createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array(),
      });
    }

    const { url, reason, scamType, reporterInfo = {}, evidenceImages = [] } = req.body;

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'URL không hợp lệ',
      });
    }

    const normalizedUrl = normalizeUrl(url);

    const duplicate = await Report.checkDuplicate(normalizedUrl);

    const reportData = {
      url,
      normalizedUrl,
      reason,
      scamType,
      evidenceImages: Array.isArray(evidenceImages) ? evidenceImages.slice(0, 5) : [],
      reporterInfo: {
        name: reporterInfo.name || null,
        email: reporterInfo.email || null,
        phone: reporterInfo.phone || null,
        isAnonymous: reporterInfo.isAnonymous || false,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const report = await Report.create(reportData);

    return res.status(201).json({
      success: true,
      message: duplicate
        ? 'Báo cáo đã được ghi nhận. URL này đã được báo cáo trước đó.'
        : 'Báo cáo đã được gửi thành công',
      data: {
        reportId: report._id,
        status: report.status,
        isDuplicate: report.isDuplicate,
      },
    });
  } catch (error) {
    console.error('Create Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo báo cáo',
      error: error.message,
    });
  }
};

export const getReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId).select(
      'status createdAt reviewedAt adminNotes'
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: report.status,
        submittedAt: report.createdAt,
        reviewedAt: report.reviewedAt,
        adminNotes: report.status === 'rejected' ? report.adminNotes : null,
      },
    });
  } catch (error) {
    console.error('Get Report Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getUserReports = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc',
      });
    }

    const reports = await Report.find({
      'reporterInfo.email': email.toLowerCase(),
    })
      .select('url scamType status createdAt reviewedAt')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      total: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Get User Reports Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
