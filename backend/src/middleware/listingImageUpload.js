import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Upload directory
const uploadDir = path.join(process.cwd(), 'uploads', 'listings');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure storage for listing images
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer storage - destination:", uploadDir);
    console.log("Multer storage - file:", file);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'listing-' + uniqueSuffix + path.extname(file.originalname);
    console.log("Multer storage - generated filename:", filename);
    cb(null, filename);
  },
});

/**
 * File filter - only allow images
 */
const fileFilter = (req, file, cb) => {
  console.log("Multer fileFilter - file:", file);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    console.log("Multer fileFilter - accepted");
    cb(null, true);
  } else {
    console.log("Multer fileFilter - rejected, mimetype:", file.mimetype);
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

/**
 * Multer upload configuration for listing images
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadListingImage = upload.single('image');

/**
 * Error handler for multer errors
 */
export const handleListingUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};
