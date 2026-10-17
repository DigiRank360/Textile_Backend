import "dotenv/config";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Property from "./models/Property.js";

// Demo images live in uploads/demo and are served by the backend at /uploads/demo/*
const img = (file) => `/uploads/demo/${file}`;

const CATEGORIES = [
  { name: "Cotton Fabrics", description: "Soft, breathable cotton for everyday wear and home use." },
  { name: "Silk Fabrics", description: "Luxurious silk and silk blends for festive and occasion wear." },
  { name: "Woollen Fabrics", description: "Warm, durable woollen and tweed fabrics." },
  { name: "Printed Fabrics", description: "Vibrant prints and embroidered fabrics." },
  { name: "Yarn & Threads", description: "Quality threads and yarns in assorted colours." },
];

const PRODUCTS = [
  {
    title: "Dyed Cotton Voile",
    price: 180,
    category: "Cotton Fabrics",
    images: ["dyed-cotton-voile.jpg"],
    description: "Lightweight, breathable cotton voile in rich colour-fast shades. Ideal for dupattas, scarves and summer wear.",
    features: ["100% Cotton", "Colour-fast dye", "Lightweight"],
  },
  {
    title: "Madras Check Cotton",
    price: 240,
    category: "Cotton Fabrics",
    images: ["madras-check.jpg"],
    description: "Classic yarn-dyed madras plaid cotton with a soft hand feel, perfect for shirts and casual wear.",
    features: ["Yarn-dyed", "Soft finish", "Shirting"],
  },
  {
    title: "Blue Chambray",
    price: 260,
    category: "Cotton Fabrics",
    images: ["blue-chambray.jpg"],
    description: "Light blue chambray with a fine woven texture for shirts, dresses and home linen.",
    features: ["Fine weave", "Durable", "Easy care"],
  },
  {
    title: "Dupioni Silk Assorted",
    price: 650,
    category: "Silk Fabrics",
    images: ["dupioni-silk.jpg"],
    description: "Lustrous dupioni silk with a natural slub texture, available in a wide range of jewel tones.",
    features: ["Pure silk", "Natural slub", "Rich lustre"],
  },
  {
    title: "Handloom Silk Brocade",
    price: 1200,
    category: "Silk Fabrics",
    images: ["handloom-silk-saree.jpg"],
    description: "Handwoven silk brocade with zari detailing, made for sarees and bridal collections.",
    features: ["Handloom", "Zari work", "Bridal"],
  },
  {
    title: "Heritage Wool Tweed",
    price: 780,
    category: "Woollen Fabrics",
    images: ["wool-tweed.jpg"],
    description: "Multi-tone woollen tweed with a warm texture for jackets, coats and winter accessories.",
    features: ["Pure wool", "Warm", "Durable"],
  },
  {
    title: "Retro Floral Print",
    price: 210,
    category: "Printed Fabrics",
    images: ["retro-floral-print.jpg"],
    description: "Bold floral print on soft cotton, great for dresses, cushions and kids' wear.",
    features: ["Vibrant print", "Cotton", "Wash-fast"],
  },
  {
    title: "Embroidered Kurti Fabric",
    price: 340,
    category: "Printed Fabrics",
    images: ["embroidered-kurti-fabric.jpg"],
    description: "Printed and embroidered ready-cut kurti fabric in assorted designs and colours.",
    features: ["Embroidered", "Assorted designs", "Ready-cut"],
  },
  {
    title: "Sewing Thread Spools",
    price: 45,
    category: "Yarn & Threads",
    images: ["sewing-thread-spools.jpg"],
    description: "Strong, smooth sewing threads on wooden spools in assorted colours for garment and craft use.",
    features: ["High tensile", "Assorted colours", "Bulk packs"],
  },
];

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI (or MONGO_URI) is not set.");

  await mongoose.connect(uri);

  const categoryIds = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: c.name },
      { $setOnInsert: { ...c, status: true } },
      { upsert: true, new: true }
    );
    categoryIds[c.name] = doc._id;
  }

  let created = 0;
  for (const p of PRODUCTS) {
    const exists = await Property.findOne({ title: p.title });
    if (exists) continue;
    await Property.create({
      title: p.title,
      price: p.price,
      description: p.description,
      images: p.images.map(img),
      category: categoryIds[p.category],
      features: p.features,
      featured: true,
      status: "Active",
    });
    created += 1;
  }

  console.log(`Categories ready: ${CATEGORIES.length}, products added: ${created}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
