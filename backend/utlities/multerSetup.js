const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use data/Uploads folder for file storage
const uploadDir = path.join(__dirname, '..', 'data', 'Uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types for security
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'), false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with user id and field name
    const userId = req.userId || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    let prefix = file.fieldname;
    if (file.fieldname === 'resume') prefix = 'resume';
    else if (file.fieldname === 'coverLetter') prefix = 'coverletter';
    else if (file.fieldname === 'companyLogo') prefix = 'logo';
    cb(null, `${prefix}_${userId}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

const multiUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
}).fields([
  {name: "resume", maxCount: 1},
  {name: "coverLetter", maxCount: 1}
]);

const jobUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow images for company logo
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed for logo.'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB for logos
}).single('companyLogo');

module.exports = { upload, multiUpload, jobUpload, uploadDir };
