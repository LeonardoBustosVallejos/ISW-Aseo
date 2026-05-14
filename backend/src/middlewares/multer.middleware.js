import multer from "multer";
import path from "path"
import { v4 as uuidv4 } from "uuid"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/contratos")
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname)

        const nombreArchivo = `${uuidv4()}${extension}`

        cb(null, nombreArchivo)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
        return cb(new Error("Solo se permiten archivos PDF"), false)
    }

    cb(null, true)
}

export const uploadContrato = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})