import Category from "../models/Category.js";

// =======================
// Add Category
// =======================
export const addCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const exists = await Category.findOne({
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      ...(status !== undefined && { status }),
    });

    return res.status(201).json({
      success: true,
      message: "Category Added Successfully",
      data: category,
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// Get All Categories
// =======================
export const getCategories = async (req, res) => {
  try {

    const categories = await Category.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// Get Single Category
// =======================
export const getCategory = async (req, res) => {
  try {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// Update Category
// =======================
export const updateCategory = async (req, res) => {
  try {

    const { name, description, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        ...(status !== undefined && { status }),
      },
      {
        new: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      data: category,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// Delete Category
// =======================
export const deleteCategory = async (req, res) => {
  try {

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};