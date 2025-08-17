import multer from 'multer';

const storage = multer.memoryStorage();

function csvFileFilter(req, file, cb) {
  if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
}

export const csvUpload = multer({ storage, fileFilter: csvFileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
