import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
      index: true, // để filter theo city nhanh hơn
    },
    address: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
      index: true, // để filter theo price_min / price_max nhanh
    },
    area: {
      type: Number, // diện tích (m2)
      required: false,
    },
    images: [
      {
        type: String, // url ảnh
      },
    ],
    amenities: [
      {
        type: String, // ví dụ: ["wifi", "máy lạnh", "WC riêng"]
      },
    ],
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },  
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
