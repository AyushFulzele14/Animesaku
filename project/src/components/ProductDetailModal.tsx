import { useEffect, useState, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Info, MessageSquare } from 'lucide-react';
import { api, resolveAssetUrl } from '../lib/api';
import { useAuth, useCart } from '../hooks';
import { Product } from '../types';
import { formatINR } from '../utils/currency';
import { WishlistButton } from './WishlistButton';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetails {
  _id: string;
  title: string;
  animeName: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string }>;
  type: 'poster' | 'sticker';
  ratings: number;
  numOfReviews: number;
  stockQuantity: number;
  dimensions?: string;
  materialQuality?: string;
  reviews: Review[];
}

interface ProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ProductDetails>(`/products/${productId}`);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      void fetchDetails();
      setReviewMessage(null);
      setNewComment('');
      setNewRating(5);
    }
  }, [productId, fetchDetails]);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId || !newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage(null);

    try {
      await api.post(`/products/${productId}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviewMessage('Thank you! Your review has been saved.');
      setNewComment('');
      // Reload details to display updated reviews and average ratings
      await fetchDetails();
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!details) return;
    const prod: Product = {
      id: details._id,
      title: details.title,
      animeName: details.animeName,
      price: details.price,
      discountPrice: details.discountPrice,
      image: resolveAssetUrl(details.images?.[0]?.url),
      category: details.type,
      type: details.type,
      rating: details.ratings,
      reviews: details.numOfReviews,
      description: details.description,
    };
    void addToCart(prod);
  };

  return (
    <AnimatePresence>
      {productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl bg-matte-black border border-primary-red/30 rounded-3xl overflow-hidden shadow-neon-red-lg z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-red/20 bg-black/60 sticky top-0 z-20">
              <h2 className="text-xl font-bold text-silver-white line-clamp-1">
                {loading ? 'Loading Product...' : details?.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-primary-red/20 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-silver-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
              {loading && (
                <div className="text-center py-20 text-silver-white/60">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-red mx-auto mb-4" />
                  Loading merchandise details...
                </div>
              )}

              {error && (
                <div className="text-center py-20 text-primary-red bg-primary-red/10 border border-primary-red/20 rounded-2xl p-6">
                  <p className="font-semibold">{error}</p>
                  <button onClick={fetchDetails} className="mt-4 px-4 py-2 bg-primary-red text-black rounded-xl font-bold">
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {/* Left Column: Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-primary-red/20 bg-black">
                      <img
                        src={resolveAssetUrl(details.images?.[0]?.url)}
                        alt={details.title}
                        className="w-full h-full object-contain"
                      />
                      {details.discountPrice && details.discountPrice > 0 && (
                        <span className="absolute top-4 right-4 bg-primary-red px-3 py-1 rounded-full text-white text-xs font-bold shadow-neon-red">
                          Sale
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/40 border border-primary-red/10 rounded-2xl">
                      <div>
                        <p className="text-xs text-silver-white/40 uppercase tracking-wider">Wishlist</p>
                        <p className="text-sm text-silver-white/80 font-medium">Save for later</p>
                      </div>
                      <WishlistButton productId={details._id} productName={details.title} />
                    </div>
                  </div>

                  {/* Right Column: Info & Checkout Actions */}
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-primary-red uppercase">
                        {details.animeName}
                      </span>
                      <h1 className="text-3xl font-extrabold text-silver-white mt-1">{details.title}</h1>
                      
                      {/* Ratings Summary */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(details.ratings)
                                  ? 'fill-primary-red text-primary-red'
                                  : 'text-silver-white/20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-silver-white/60">
                          {details.ratings.toFixed(1)} ({details.numOfReviews} review{details.numOfReviews === 1 ? '' : 's'})
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="p-4 bg-black/60 border border-primary-red/20 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-silver-white/50 mb-1">Price</p>
                        <div className="flex items-baseline gap-2">
                          {details.discountPrice && details.discountPrice > 0 ? (
                            <>
                              <span className="text-2xl font-bold text-primary-red">
                                {formatINR(details.discountPrice)}
                              </span>
                              <span className="text-sm text-silver-white/40 line-through">
                                {formatINR(details.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-silver-white">
                              {formatINR(details.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="text-right">
                        <p className="text-xs text-silver-white/50 mb-1">Status</p>
                        {details.stockQuantity > 0 ? (
                          details.stockQuantity < 10 ? (
                            <span className="text-sm font-bold text-yellow-500 animate-pulse">
                              Only {details.stockQuantity} left!
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-green-500">In Stock</span>
                          )
                        ) : (
                          <span className="text-sm font-bold text-primary-red">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-bold uppercase text-silver-white/60 tracking-wider flex items-center gap-1.5 mb-2">
                        <Info className="w-4 h-4 text-primary-red" /> Description
                      </h3>
                      <p className="text-sm text-silver-white/80 leading-relaxed bg-black/30 p-4 border border-primary-red/10 rounded-2xl">
                        {details.description}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-black/40 border border-primary-red/10 rounded-2xl">
                        <p className="text-xs text-silver-white/40 uppercase">Dimensions</p>
                        <p className="text-sm font-semibold text-silver-white mt-0.5">
                          {details.dimensions || (details.type === 'poster' ? '12 x 18 inches' : '3 x 3 inches')}
                        </p>
                      </div>
                      <div className="p-3 bg-black/40 border border-primary-red/10 rounded-2xl">
                        <p className="text-xs text-silver-white/40 uppercase">Material Quality</p>
                        <p className="text-sm font-semibold text-silver-white mt-0.5">
                          {details.materialQuality || (details.type === 'poster' ? '300 GSM Matte Paper' : 'Premium Vinyl (Waterproof)')}
                        </p>
                      </div>
                    </div>

                    {/* Add to Cart Action */}
                    <button
                      onClick={handleAddToCart}
                      disabled={details.stockQuantity <= 0}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-red to-dark-red hover:shadow-neon-red disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-300"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Row: Customer Reviews & Ratings Submission */}
              {!loading && !error && details && (
                <div className="border-t border-primary-red/20 pt-8 space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-primary-red" />
                    <h2 className="text-2xl font-bold text-silver-white">Customer Reviews</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    {/* Review List */}
                    <div className="space-y-4">
                      {details.reviews.length === 0 ? (
                        <div className="p-6 text-center text-silver-white/50 bg-black/30 border border-primary-red/10 rounded-2xl">
                          No reviews yet for this product. Be the first to share your experience!
                        </div>
                      ) : (
                        details.reviews.map((rev) => (
                          <div key={rev._id} className="p-4 bg-black/40 border border-primary-red/10 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-silver-white">{rev.name}</span>
                              <span className="text-xs text-silver-white/40">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating
                                      ? 'fill-primary-red text-primary-red'
                                      : 'text-silver-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-silver-white/70 leading-relaxed">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Submit Form */}
                    <div className="p-6 bg-black/60 border border-primary-red/20 rounded-3xl self-start space-y-4">
                      <h3 className="text-lg font-bold text-silver-white">Write a Review</h3>
                      
                      {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          {/* Rating selector */}
                          <div>
                            <label className="block text-xs text-silver-white/60 mb-1">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="p-1"
                                >
                                  <Star
                                    className={`w-6 h-6 transition-all ${
                                      star <= newRating
                                        ? 'fill-primary-red text-primary-red'
                                        : 'text-silver-white/20 hover:text-primary-red/50'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comment field */}
                          <div>
                            <label className="block text-xs text-silver-white/60 mb-1">Comment</label>
                            <textarea
                              required
                              rows={3}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Describe your purchase..."
                              className="input w-full resize-none bg-black/60 border-primary-red/30 focus:border-primary-red transition-all"
                            />
                          </div>

                          {reviewMessage && (
                            <div className="text-xs text-silver-white bg-primary-red/10 border border-primary-red/30 p-3 rounded-xl">
                              {reviewMessage}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submittingReview || !newComment.trim()}
                            className="w-full bg-primary-red text-black font-bold py-2 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors duration-200"
                          >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </form>
                      ) : (
                        <p className="text-sm text-silver-white/50 text-center py-4 border border-dashed border-primary-red/20 rounded-2xl">
                          Please log in to leave a review.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
