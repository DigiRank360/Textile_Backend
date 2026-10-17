import Property from "../models/Property.js";
import { saveImage, removeLocalImage } from "../utils/saveImage.js";

const fail = (res, err, code = 500) =>
  res.status(code).json({ success: false, message: err.message || err });

const parseList = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed)
      ? parsed.map((v) => String(v).trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const toBool = (v) => v === true || v === "true";

export const createProperty = async (req, res) => {
  try {
    const { title, price, description, category, featured, status } = req.body;

    if (!title?.trim() || price === undefined || price === "") {
      return fail(res, "Title and Price are required.", 400);
    }

    const fileImages = req.files?.length
      ? await Promise.all(req.files.map((f) => saveImage(f, "products")))
      : [];

    const property = await Property.create({
      title: title.trim(),
      price: Number(price),
      description: description?.trim() || "",
      images: [...fileImages, ...parseList(req.body.imageUrls)],
      category: category || null,
      features: parseList(req.body.features),
      featured: toBool(featured),
      status: status === "Inactive" ? "Inactive" : "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    return fail(res, error);
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return fail(res, "Product Not Found", 404);

    const { title, price, description, category, featured, status } = req.body;

    if (title !== undefined) property.title = title.trim();
    if (price !== undefined && price !== "") property.price = Number(price);
    if (description !== undefined) property.description = description.trim();
    if (category !== undefined) property.category = category || null;
    if (featured !== undefined) property.featured = toBool(featured);
    if (status !== undefined) {
      property.status = status === "Inactive" ? "Inactive" : "Active";
    }
    if (req.body.features !== undefined) {
      property.features = parseList(req.body.features);
    }

    // existingImages = images the admin chose to keep; the rest are removed.
    const previous = [...property.images];
    const kept =
      req.body.existingImages !== undefined
        ? parseList(req.body.existingImages).filter((img) => previous.includes(img))
        : previous;

    const newFiles = req.files?.length
      ? await Promise.all(req.files.map((f) => saveImage(f, "products")))
      : [];

    property.images = [...kept, ...newFiles];
    await property.save();

    await Promise.all(
      previous.filter((img) => !kept.includes(img)).map(removeLocalImage)
    );

    return res.json({
      success: true,
      message: "Product Updated Successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    return fail(res, error);
  }
};

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    return fail(res, error);
  }
};

export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!property) return fail(res, "Property Not Found", 404);
    return res.json({ success: true, property });
  } catch (error) {
    return fail(res, error);
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return fail(res, "Property Not Found", 404);

    await Promise.all(property.images.map(removeLocalImage));
    await property.deleteOne();

    return res.json({ success: true, message: "Property Deleted Successfully" });
  } catch (error) {
    return fail(res, error);
  }
};
