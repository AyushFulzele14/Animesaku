import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    animeName: {
      type: String,
      required: [true, 'Anime name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['poster', 'sticker'],
      required: [true, 'Product type (poster or sticker) is required'],
      default: 'poster',
      index: true,
    },
    images: [
      {
        public_id: { type: String, default: '' },
        url: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be lower than original price',
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    dimensions: {
      type: String,
      required: [true, 'Dimensions are required (e.g. 12x18 inches)'],
    },
    materialQuality: {
      type: String,
      required: [true, 'Material Quality is required (e.g. 300 GSM Paper)'],
    },
    finishType: {
      type: String,
      enum: ['matte', 'glossy', 'both'],
      default: 'matte',
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for ultra-fast text search
productSchema.index({ title: 'text', description: 'text', animeName: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
