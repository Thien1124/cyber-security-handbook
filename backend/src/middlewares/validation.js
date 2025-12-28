import { body } from 'express-validator';

export const reportValidation = [
  body('url')
    .notEmpty()
    .withMessage('URL là bắt buộc')
    .isString()
    .withMessage('URL phải là chuỗi')
    .trim(),

  body('reason')
    .notEmpty()
    .withMessage('Lý do báo cáo là bắt buộc')
    .isString()
    .withMessage('Lý do phải là chuỗi')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Lý do phải từ 10-2000 ký tự'),

  body('scamType')
    .notEmpty()
    .withMessage('Loại lừa đảo là bắt buộc')
    .isIn([
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
    ])
    .withMessage('Loại lừa đảo không hợp lệ'),

  body('reporterInfo.name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên không được vượt quá 100 ký tự'),

  body('reporterInfo.email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('reporterInfo.phone')
    .optional()
    .isString()
    .trim(),

  body('reporterInfo.isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous phải là boolean'),
];
