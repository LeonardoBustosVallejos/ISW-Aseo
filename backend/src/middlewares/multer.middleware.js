import multer from "multer"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export function createUploadMiddleware({
    destination = "uploads",
    allowedMimeTypes = [],
    maxSize = 10 * 1024 * 1024
}) {

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            const fullPath = path.join(process.cwd(), destination)

            //crear carpeta si no existe
            fs.mkdirSync(fullPath, { recursive: true })

            cb(null, fullPath)
        },

        filename: (req, file, cb) => {

            const extension = path.extname(file.originalname)

            const uniqueName = `${uuidv4()}${extension}`

            cb(null, uniqueName)
        }
    })

    const fileFilter = (req, file, cb) => {

        if (
            allowedMimeTypes.length > 0 &&
            !allowedMimeTypes.includes(file.mimetype)
        ) {
            return cb(
                new Error("Formato de archivo no permitido"),
                false
            )
        }

        cb(null, true)
    }

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize
        }
    })
}