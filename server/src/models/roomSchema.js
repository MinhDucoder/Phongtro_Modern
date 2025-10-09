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
        type: mongoose.Schema.Types.Mixed,
        url: String,
        public_id: String,
      },
    ],
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "aircon",
          "private_wc",
          "washing_machine",
          "fridge",
          "balcony",
        ],
      },
    ],
    // Nội quy phòng
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
    // Điểm lân cận
    nearbyPlaces: [
      {
        name: { type: String, trim: true },
        distance: { type: String, trim: true },
        type: { type: String, trim: true }, // university | market | hospital | supermarket | ...
      },
    ],
    propertyType: {
      type: String,
      enum: [
        "phong_tro",
        "nha_nguyen_can",
        "can_ho_chung_cu",
        "can_ho_mini",
        "o_ghep",
        "mat_bang"
      ],
      required: true,
      default: "phong_tro",
      index: true
    },
    roomType: {
      type: String,
      enum: [
        "phong_don",
        "phong_doi", 
        "phong_ba",
        "phong_tu",
        "phong_nam",
        "phong_sau",
        "phong_bay",
        "phong_tam",
        "phong_chin",
        "phong_muoi"
      ],
      required: false,
      index: true
    },

    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // GeoJSON location for MongoDB geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false
      }
    }
  },
  { timestamps: true }
);

// Create geospatial index for location field
roomSchema.index({ location: '2dsphere' });

export default mongoose.model("Room", roomSchema);
