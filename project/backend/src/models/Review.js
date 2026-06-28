import mongoose from 'mongoose';
import { Product } from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating (1-5) is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from reviewing the same product twice
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average ratings and number of reviews
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        numOfReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(stats[0].averageRating * 10) / 10,
        numOfReviews: stats[0].numOfReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        ratings: 0,
        numOfReviews: 0,
      });
    }
  } catch (error) {
    console.error(`Error in calculateAverageRating: ${error.message}`);
  }
};

// Calculate average ratings after saving a review
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Calculate average ratings before removing a review
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calculateAverageRating(this.product);
});

export const Review = mongoose.model('Review', reviewSchema);
