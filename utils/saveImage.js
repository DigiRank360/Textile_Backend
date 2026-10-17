import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import cloudinary, {
  configureCloudinary,
  isCloudinaryConfigured,
} from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// Uploads to Cloudinary when configured, otherwise stores on local disk (/uploads).
export const saveImage = async (file, folder = "products") => {
  if (isCloudinaryConfigured()) {
    configureCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "hummo/" + folder, resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
      );
      stream.end(file.buffer);
    });
  }

  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const name =
    Date.now() +
    "-" +
    crypto.randomBytes(4).toString("hex") +
    (EXT[file.mimetype] || ".jpg");
  await fs.writeFile(path.join(dir, name), file.buffer);
  return "/uploads/" + folder + "/" + name;
};

// Removes a locally stored image; remote URLs and demo images are left untouched.
export const removeLocalImage = async (url) => {
  if (!url || !url.startsWith("/uploads/") || url.startsWith("/uploads/demo/")) return;
  const target = path.join(UPLOAD_DIR, url.replace("/uploads/", ""));
  if (!target.startsWith(UPLOAD_DIR)) return;
  await fs.unlink(target).catch(() => {});
};
