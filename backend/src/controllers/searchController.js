import { Blacklist } from '../models/index.js';
import { normalizeUrl, isValidUrl } from '../utils/index.js';

export const searchUrl = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL là bắt buộc',
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'URL không hợp lệ',
      });
    }

    const normalizedUrl = normalizeUrl(url);

    const scam = await Blacklist.findOne({
      normalizedUrl,
      isActive: true,
    }).select('url scamType dangerLevel description reportCount createdAt');

    if (!scam) {
      return res.status(200).json({
        success: true,
        isSafe: true,
        message: 'URL an toàn, không có trong danh sách đen',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      isSafe: false,
      message: 'Cảnh báo: URL này đã được xác nhận là lừa đảo',
      data: {
        url: scam.url,
        scamType: scam.scamType,
        dangerLevel: scam.dangerLevel,
        description: scam.description,
        reportCount: scam.reportCount,
        addedDate: scam.createdAt,
      },
    });
  } catch (error) {
    console.error('Search URL Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tra cứu URL',
      error: error.message,
    });
  }
};

export const bulkSearchUrls = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách URLs là bắt buộc',
      });
    }

    if (urls.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Tối đa 50 URLs mỗi lần tra cứu',
      });
    }

    const normalizedUrls = urls
      .filter(url => isValidUrl(url))
      .map(url => ({
        original: url,
        normalized: normalizeUrl(url),
      }));

    const scams = await Blacklist.find({
      normalizedUrl: { $in: normalizedUrls.map(u => u.normalized) },
      isActive: true,
    }).select('normalizedUrl url scamType dangerLevel');

    const scamMap = new Map();
    scams.forEach(scam => {
      scamMap.set(scam.normalizedUrl, scam);
    });

    const results = normalizedUrls.map(({ original, normalized }) => {
      const scam = scamMap.get(normalized);
      return {
        url: original,
        isSafe: !scam,
        scamType: scam?.scamType || null,
        dangerLevel: scam?.dangerLevel || null,
      };
    });

    return res.status(200).json({
      success: true,
      total: results.length,
      scamsFound: results.filter(r => !r.isSafe).length,
      results,
    });
  } catch (error) {
    console.error('Bulk Search Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tra cứu danh sách URLs',
      error: error.message,
    });
  }
};
