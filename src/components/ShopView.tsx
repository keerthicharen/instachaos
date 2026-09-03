import React, { useState } from 'react';
import { ShoppingBag, Star, Heart, Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ShopViewProps {
  products: Product[];
}

export const ShopView: React.FC<ShopViewProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Home', 'Accessories', 'Apparel', 'Tech', 'Beauty'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setActiveProduct(null);
    setShowCartDrawer(true);
  };

  const handleCheckout = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setOrderPlaced(false);
      setShowCartDrawer(false);
    }, 2500);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div id="shop-screen" className="max-w-xl mx-auto pb-20 pt-2 px-3">
      {/* Top Shop Bar */}
      <div className="flex items-center justify-between py-2 mb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Shop</span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80">
              Instagram Commerce
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Discover curated collections from authentic creators</p>
        </div>

        {/* Cart Icon */}
        <button
          id="shop-bag-btn"
          onClick={() => setShowCartDrawer(true)}
          className="relative p-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-slate-800 dark:text-slate-100" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a]">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const isFavorited = wishlist[product.id];

          return (
            <div
              key={product.id}
              onClick={() => setActiveProduct(product)}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Product Thumbnail */}
              <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800/70 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Wishlist Heart */}
                <button
                  onClick={(e) => handleToggleWishlist(product.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/60 rounded-full backdrop-blur-xs transition-transform active:scale-125 border border-slate-200/40 dark:border-slate-700/40"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-white'
                    }`}
                  />
                </button>

                {/* Price pill */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-white font-bold text-xs shadow-md border border-white/10">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src={product.brandAvatar}
                    alt={product.brand}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <span className="text-[11px] text-slate-500 truncate font-medium">
                    {product.brand}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {product.title}
                </h3>

                <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img
                    src={activeProduct.brandAvatar}
                    alt={activeProduct.brand}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeProduct.brand}
                  </span>
                </div>
                <button
                  onClick={() => setActiveProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Main Image */}
              <div className="my-4 rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
                <img
                  src={activeProduct.images[0]}
                  alt={activeProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Price */}
              <div className="mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeProduct.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    ${activeProduct.price.toFixed(2)}
                  </span>
                  {activeProduct.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ${activeProduct.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    In Stock
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {activeProduct.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {activeProduct.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md font-medium border border-slate-200/50 dark:border-slate-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Buy Button */}
              <button
                id="add-to-bag-btn"
                onClick={() => handleAddToCart(activeProduct)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Your Shopping Bag ({totalCartCount})</span>
                  </h3>
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items list */}
                <div className="py-4 space-y-3 max-h-60 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Your shopping bag is empty.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-xs">
                          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {item.product.title}
                          </h4>
                          <div className="text-slate-500">
                            Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                          </div>
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Checkout summary */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-bold text-emerald-600">Free</span>
                  </div>

                  {orderPlaced ? (
                    <div className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg">
                      <Check className="w-4 h-4" />
                      <span>Order Placed Successfully!</span>
                    </div>
                  ) : (
                    <button
                      id="checkout-btn"
                      onClick={handleCheckout}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Checkout • ${cartSubtotal.toFixed(2)}</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
