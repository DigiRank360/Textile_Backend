import Banner from "../models/Banner.js";
import { saveImage, removeLocalImage } from "../utils/saveImage.js";

const fail = (res, err, code = 500) =>
  res.status(code).json({ success: false, message: err.message || err });

const toBool = (v) => v === true || v === "true";

// Public: active banners only. Admin (valid token) can pass ?all=true for everything.
export const getBanners = async (req, res) => {
  try {
    const filter = req.query.all === "true" && req.admin ? {} : { status: true };
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, banners });
  } catch (err) {
    fail(res, err);
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, badge, subtitle, order, status } = req.body;
    if (!title?.trim()) return fail(res, "Title is required", 400);
    if (!req.file) return fail(res, "Banner image is required", 400);

    const image = await saveImage(req.file, "banners");
    const banner = await Banner.create({
      title: title.trim(),
      badge: badge?.trim() || "",
      subtitle: subtitle?.trim() || "",
      order: Number(order) || 0,
      status: status === undefined ? true : toBool(status),
      image,
    });
    res.status(201).json({ success: true, message: "Banner added", banner });
  } catch (err) {
    fail(res, err);
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return fail(res, "Banner not found", 404);

    const { title, badge, subtitle, order, status } = req.body;
    if (title !== undefined) banner.title = title.trim();
    if (badge !== undefined) banner.badge = badge.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (order !== undefined) banner.order = Number(order) || 0;
    if (status !== undefined) banner.status = toBool(status);

    if (req.file) {
      const oldImage = banner.image;
      banner.image = await saveImage(req.file, "banners");
      await removeLocalImage(oldImage);
    }

    await banner.save();
    res.json({ success: true, message: "Banner updated", banner });
  } catch (err) {
    fail(res, err);
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return fail(res, "Banner not found", 404);
    await removeLocalImage(banner.image);
    await banner.deleteOne();
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    fail(res, err);
  }
};
