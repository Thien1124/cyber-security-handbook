import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'URL là bắt buộc'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    normalizedUrl: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      // URL đã được chuẩn hóa (loại bỏ http://, https://, www.)
    },
    scamType: {
      type: String,
      required: [true, 'Loại lừa đảo là bắt buộc'],
      enum: {
        values: [
          'phishing',           // Lừa đảo thông tin
          'fake-shop',          // Website bán hàng giả
          'investment-scam',    // Lừa đảo đầu tư
          'tech-support',       // Giả mạo hỗ trợ kỹ thuật
          'lottery-scam',       // Lừa đảo trúng thưởng
          'romance-scam',       // Lừa đảo tình cảm
          'malware',            // Phần mềm độc hại
          'crypto-scam',        // Lừa đảo tiền ảo
          'job-scam',           // Lừa đảo việc làm
          'other',              // Khác
        ],
        message: '{VALUE} không phải là loại lừa đảo hợp lệ',
      },
    },
    dangerLevel: {
      type: String,
      required: [true, 'Mức độ độc hại là bắt buộc'],
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} không phải là mức độ hợp lệ',
      },
      default: 'medium',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự'],
    },
    reportCount: {
      type: Number,
      default: 1,
      min: [0, 'Số lượng báo cáo không được âm'],
    },
    evidenceImages: [
      {
        type: String,
        // Cloudinary URLs
      },
    ],
    source: {
      type: String,
      enum: ['admin', 'community', 'auto-detect'],
      default: 'community',
    },
    isActive: {
      type: Boolean,
      default: true,
      // Cho phép tạm thời vô hiệu hóa mà không xóa
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Admin đã thêm vào blacklist
    },
    relatedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
      },
    ],
    metadata: {
      ipAddress: String,
      country: String,
      domainAge: Number,
      // Thông tin bổ sung nếu cần
    },
  },
  {
    timestamps: true,
    // Tự động thêm createdAt và updatedAt
  }
);

// Index cho tìm kiếm nhanh
blacklistSchema.index({ normalizedUrl: 1, isActive: 1 });
blacklistSchema.index({ scamType: 1, dangerLevel: 1 });
blacklistSchema.index({ createdAt: -1 });

// Virtual field: Tính tuổi của bản ghi
blacklistSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method: Tăng số lượng báo cáo
blacklistSchema.methods.incrementReportCount = function () {
  this.reportCount += 1;
  return this.save();
};

// Static method: Tìm kiếm theo URL chuẩn hóa
blacklistSchema.statics.findByNormalizedUrl = function (normalizedUrl) {
  return this.findOne({ normalizedUrl, isActive: true });
};

// Static method: Lấy top scam mới nhất
blacklistSchema.statics.getLatestScams = function (limit = 20) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('url scamType dangerLevel description createdAt reportCount');
};

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

export default Blacklist;
