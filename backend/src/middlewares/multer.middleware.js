import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE = path.join(__dirname, "..", "uploads");

const folderForField = {
  foto: "fotos",
  cv: "cvs",
  antecedentes: "antecedentes",
  contrato: "contratos",
  archivo: "archivos"
};

const allowedMimes = {
  foto: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  cv: ["application/pdf"],
  antecedentes: ["application/pdf"],
  contrato: ["application/pdf"],
  archivo: ["application/pdf"]
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = folderForField[file.fieldname] || "otros";
    const dest = path.join(UPLOAD_BASE, folder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = allowedMimes[file.fieldname];

  if (!allowed) {
    return cb(new Error("Campo de archivo no permitido"), false);
  }

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo invalido"), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadFiles = upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "cv", maxCount: 1 },
  { name: "antecedentes", maxCount: 1 },
  { name: "archivo", maxCount: 1 },
]);