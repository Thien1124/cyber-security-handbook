import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'URL là bắt buộc'],
      trim: true,
      lowercase: true,
    },
    normalizedUrl: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      // URL đã được chuẩn hóa
    },
    reason: {
      type: String,
      required: [true, 'Lý do báo cáo là bắt buộc'],
      trim: true,
      minlength: [10, 'Lý do phải có ít nhất 10 ký tự'],
      maxlength: [2000, 'Lý do không được vượt quá 2000 ký tự'],
    },
    scamType: {
      type: String,
      required: [true, 'Loại lừa đảo là bắt buộc'],
      enum: [
        'phishing',
        'fake-shop',
        'investment-scam',
        'tech-support',
        'lottery-scam',
        'romance-scam',
        'malware',
        'crypto-scam',
        'job-scam',
        'other',
      ],
    },
    evidenceImages: [
      {
        type: String,
        // Cloudinary URLs cho ảnh bằng chứng
      },
    ],
    reporterInfo: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Email không hợp lệ',
        ],
      },
      phone: {
        type: String,
        trim: true,
      },
      isAnonymous: {
        type: Boolean,
        default: false,
      },
    },
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Nếu người báo cáo đã đăng nhập
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'processing'],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Ghi chú không được vượt quá 1000 ký tự'],
      // Ghi chú riêng của admin khi xét duyệt
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Admin đã xét duyệt báo cáo này
    },
    reviewedAt: {
      type: Date,
      // Thời gian xét duyệt
    },
    ipAddress: {
      type: String,
      // IP của người gửi báo cáo (để chống spam)
    },
    userAgent: {
      type: String,
      // Thông tin trình duyệt
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      // Nếu báo cáo này là trùng lặp
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index tối ưu tìm kiếm
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ normalizedUrl: 1 });
reportSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Virtual field: Số ngày chờ duyệt
reportSchema.virtual('pendingDays').get(function () {
  if (this.status === 'pending') {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method: Phê duyệt báo cáo
reportSchema.methods.approve = function (adminId, notes = '') {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.adminNotes = notes;
  return this.save();
};

// Method: Từ chối báo cáo
reportSchema.methods.reject = function (adminId, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.adminNotes = notes;
  return this.save();
};

// Static method: Lấy báo cáo chờ duyệt
reportSchema.statics.getPendingReports = function (limit = 50) {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('reporterUserId', 'username email');
};

// Static method: Kiểm tra URL đã được báo cáo chưa
reportSchema.statics.checkDuplicate = async function (normalizedUrl) {
  const existingReport = await this.findOne({
    normalizedUrl,
    status: { $in: ['pending', 'processing'] },
  }).sort({ createdAt: -1 });

  return existingReport;
};

// Pre-save hook: Tự động đánh dấu duplicate
reportSchema.pre('save', async function (next) {
  if (this.isNew && !this.isDuplicate) {
    const duplicate = await this.constructor.checkDuplicate(this.normalizedUrl);
    if (duplicate && duplicate._id.toString() !== this._id.toString()) {
      this.isDuplicate = true;
      this.duplicateOf = duplicate._id;
      this.priority = 'low';
    }
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
