'use strict';

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

/**
 * Build a disk-storage Multer instance for a given sub-folder.
 * Files land in /uploads/<folder>/
 * Future cloud storage: swap diskStorage for memoryStorage + cloud SDK upload.
 */
const createUploader = (folder = 'misc') => {
  const dest = path.join(process.cwd(), 'uploads', folder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename:    (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const ext    = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|mp4|mkv|webm/;
    const ext     = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: .${ext}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  });
};

const uploadThumbnail = createUploader('thumbnails');
const uploadOutline   = createUploader('outlines');
const uploadAvatar    = createUploader('avatars');

module.exports = { uploadThumbnail, uploadOutline, uploadAvatar, createUploader };
