import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    badge: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
