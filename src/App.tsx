import React, { memo, useEffect, useMemo, useReducer, useState } from 'react';
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  gallery: string[];
  description: string;
  details: string;
  customizable: string[];
  rating: number;
  reviews: number;
  tags: Array<'Bestseller' | 'Limited'>;
  slotsLeft: number;
  eta: string;
};

type CartItem = {
  cartId: string;
  productId: number;
  name: string;
  image: string;
  basePrice: number;
  finalPrice: number;
  quantity: number;
  category: string;
  customization: Record<string, string>;
};

type Toast = { id: string; text: string };

type State = {
  cart: CartItem[];
  wishlist: number[];
  toasts: Toast[];
};

type Action =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'QTY'; payload: { cartId: string; delta: number } }
  | { type: 'TOGGLE_WISHLIST'; payload: number }
  | { type: 'TOAST'; payload: Toast }
  | { type: 'DISMISS_TOAST'; payload: string };

const products: Product[] = [
  {
    id: 1,
    name: 'Eternal Bloom Resin Art',
    category: 'Resin Art',
    price: 2499,
    image: '🌸',
    gallery: ['🌸', '💐', '✨'],
    description: 'Preserve real flowers in crystal-clear resin with a custom name embed.',
    details:
      'Each piece is handcrafted with lab-preserved flowers suspended in premium UV-resistant resin for heirloom-level longevity.',
    customizable: ['Name/Date Embed', 'Flower Choice', 'Base Color'],
    rating: 4.9,
    reviews: 342,
    tags: ['Bestseller'],
    slotsLeft: 7,
    eta: 'Ships in 3–5 days',
  },
  {
    id: 2,
    name: 'Couples Portrait Resin',
    category: 'Resin Art',
    price: 3499,
    image: '👫',
    gallery: ['👫', '💞', '🖼️'],
    description: 'Hand-painted couple portraits embedded in resin.',
    details: 'Our artists hand-paint your photos before embedding them in crystal resin.',
    customizable: ['Photo Upload', 'Background Style', 'Frame Color'],
    rating: 4.95,
    reviews: 287,
    tags: ['Limited'],
    slotsLeft: 4,
    eta: 'Ships in 4–6 days',
  },
  {
    id: 3,
    name: 'Personalized Keychain Soul',
    category: 'Personalized Keychains',
    price: 599,
    image: '🔑',
    gallery: ['🔑', '🫶', '✨'],
    description: 'Minimalist resin keychains with embedded names, initials, or birthdates.',
    details: 'Palm-sized keepsakes featuring UV-printed text or patterns.',
    customizable: ['Text/Initials', 'Color', 'Shape'],
    rating: 4.8,
    reviews: 891,
    tags: ['Bestseller'],
    slotsLeft: 12,
    eta: 'Ships in 2–4 days',
  },
  {
    id: 4,
    name: 'Signature Bangle - Personalized',
    category: 'Personalized Bangles',
    price: 1299,
    image: '💍',
    gallery: ['💍', '🌟', '🫰'],
    description: 'Hand-stamped bangles with your name, date, or meaningful quote.',
    details: 'Choose metal, finish, and font style for a deeply personal bracelet.',
    customizable: ['Text', 'Metal Type', 'Font Style'],
    rating: 4.85,
    reviews: 564,
    tags: ['Bestseller'],
    slotsLeft: 8,
    eta: 'Ships in 3–5 days',
  },
  {
    id: 5,
    name: 'Memory Frame - Golden Hours',
    category: 'Personalized Photo Frames',
    price: 1899,
    image: '🖼️',
    gallery: ['🖼️', '📷', '🌅'],
    description: 'Custom wooden frames with engraved names and your favorite photos.',
    details: 'Crafted from sustainable wood with hand-engraved details.',
    customizable: ['Photo Upload (1-4)', 'Engraving Text', 'Wood Finish'],
    rating: 4.88,
    reviews: 423,
    tags: ['Limited'],
    slotsLeft: 6,
    eta: 'Ships in 3–5 days',
  },
  {
    id: 6,
    name: 'Luxury Gift Hamper - Love Edition',
    category: 'Curated Gift Hampers',
    price: 4999,
    image: '🎁',
    gallery: ['🎁', '🍫', '🕯️'],
    description: 'Luxury hamper with personalized resin art and handwritten note.',
    details: 'Includes artisanal chocolates, fragrance candles, and custom gift card.',
    customizable: ['Resin Design', 'Color Theme', 'Personal Message'],
    rating: 4.92,
    reviews: 198,
    tags: ['Limited'],
    slotsLeft: 3,
    eta: 'Ships in 4–7 days',
  },
];

const testimonials = [
  { name: 'Priya & Arjun', quote: 'The resin portrait made our proposal unforgettable.', occasion: 'Proposal Gift', avatar: '👰' },
  { name: 'Anaya', quote: 'A true heirloom. Beautifully emotional and premium.', occasion: 'Anniversary Gift', avatar: '💐' },
  { name: 'Rahul', quote: 'The bangle was thoughtful, elegant, and flawlessly finished.', occasion: 'Birthday Surprise', avatar: '🎂' },
];

const trustSignals = [
  { icon: ShieldCheck, title: 'Secure Checkout', text: 'Ready for Razorpay / Stripe integration.' },
  { icon: Sparkles, title: 'Handmade Luxury', text: 'Every gift is handmade and quality-checked.' },
  { icon: BadgeCheck, title: 'Memory Preservation', text: 'UV-resistant materials for long-term keepsakes.' },
  { icon: Truck, title: 'Careful Delivery', text: 'Premium gift-safe packaging & tracking support.' },
];

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((x) => x.cartId !== action.payload) };
    case 'QTY':
      return {
        ...state,
        cart: state.cart
          .map((x) => (x.cartId === action.payload.cartId ? { ...x, quantity: Math.max(1, x.quantity + action.payload.delta) } : x))
          .filter((x) => x.quantity > 0),
      };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    case 'TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((x) => x.id !== action.payload) };
    default:
      return state;
  }
}

const currency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const ProductCard = memo(function ProductCard({
  p,
  onOpen,
  onQuickAdd,
  onWish,
  wished,
}: {
  p: Product;
  onOpen: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
  onWish: (id: number) => void;
  wished: boolean;
}) {
  return (
    <article className="group rounded-3xl border border-emerald-100/80 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden rounded-t-3xl bg-gradient-to-br from-emerald-50 via-rose-50 to-amber-50">
        <div className="absolute left-3 top-3 flex gap-2">
          {p.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-white">{tag}</span>
          ))}
        </div>
        <button aria-label="Toggle wishlist" onClick={() => onWish(p.id)} className="absolute right-3 top-3 rounded-full bg-white/85 p-2">
          <Heart size={16} className={wished ? 'fill-rose-500 text-rose-500' : 'text-emerald-900'} />
        </button>
        <div className="grid h-full place-items-center text-7xl transition duration-500 group-hover:scale-110">{p.image}</div>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{p.category}</p>
        <h3 className="font-serif text-xl text-emerald-950">{p.name}</h3>
        <p className="text-sm text-emerald-800/80">{p.description}</p>
        <div className="flex items-center justify-between text-xs text-emerald-700">
          <span className="inline-flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" /> {p.rating} ({p.reviews})</span>
          <span>Only {p.slotsLeft} slots left this week</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <strong className="text-xl text-amber-700">{currency(p.price)}</strong>
          <div className="flex gap-2">
            <button onClick={() => onOpen(p)} className="rounded-full border border-amber-500 px-4 py-2 text-sm text-amber-700">Customize</button>
            <button onClick={() => onQuickAdd(p)} className="rounded-full bg-emerald-900 px-4 py-2 text-sm text-white">Quick Add</button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default function GiftAuraApp() {
  const [state, dispatch] = useReducer(reducer, { cart: [], wishlist: [], toasts: [] });
  const [mobileNav, setMobileNav] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [customOnly, setCustomOnly] = useState(false);
  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const onScroll = () => setHeaderSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    const t = setTimeout(() => setLoadingProducts(false), 700);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    state.toasts.forEach((toast) => {
      const t = setTimeout(() => dispatch({ type: 'DISMISS_TOAST', payload: toast.id }), 2200);
      return () => clearTimeout(t);
    });
  }, [state.toasts]);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const textMatch = `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = categoryFilter === 'All' || p.category === categoryFilter;
      const priceMatch = p.price <= maxPrice;
      const customMatch = !customOnly || p.customizable.length > 0;
      return textMatch && categoryMatch && priceMatch && customMatch;
    });
  }, [search, categoryFilter, maxPrice, customOnly]);

  const addToast = (text: string) => dispatch({ type: 'TOAST', payload: { id: crypto.randomUUID(), text } });

  const calculateCustomizationFee = () => {
    const textLength = (customization.message || '').length;
    const premiumFinish = customization.finish === '24K Soft Gold' ? 250 : 0;
    const photoUpload = uploadPreview ? 149 : 0;
    return Math.min(699, Math.floor(textLength / 12) * 49 + premiumFinish + photoUpload);
  };

  const currentPrice = selectedProduct ? selectedProduct.price + calculateCustomizationFee() : 0;

  const addSelectedToCart = (product: Product) => {
    const item: CartItem = {
      cartId: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      finalPrice: selectedProduct?.id === product.id ? currentPrice : product.price,
      quantity: 1,
      category: product.category,
      customization,
    };
    dispatch({ type: 'ADD_TO_CART', payload: item });
    addToast('Added to cart ✨');
    setCartOpen(true);
    setSelectedProduct(null);
    setCustomization({});
    setUploadPreview(null);
  };

  const subtotal = useMemo(() => state.cart.reduce((s, i) => s + i.finalPrice * i.quantity, 0), [state.cart]);
  const shipping = subtotal > 2999 ? 0 : subtotal > 0 ? 149 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FEFDF9] via-[#FFF8F2] to-[#F6F2EA] text-emerald-950">
      <header className={`fixed inset-x-0 top-0 z-50 transition ${headerSolid ? 'border-b border-emerald-100 bg-white/85 shadow-md backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <a href="#home" className="font-serif text-2xl tracking-wide text-emerald-950">Gift <span className="text-amber-600">Aura</span></a>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {['Shop', 'Occasions', 'Stories', 'Contact'].map((i) => <a key={i} href={`#${i.toLowerCase()}`} className="hover:text-amber-700">{i}</a>)}
          </nav>
          <div className="hidden flex-1 px-8 md:block">
            <label className="relative block">
              <Search className="absolute left-3 top-3 text-emerald-600" size={16} />
              <input aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gifts, occasions, categories" className="w-full rounded-full border border-emerald-100 bg-white/80 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber-300" />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWishlistOpen(true)} className="relative rounded-full p-2 hover:bg-white/70"><Heart size={18} /><span className="absolute -right-0.5 -top-0.5 rounded-full bg-amber-500 px-1.5 text-[10px] text-white">{state.wishlist.length}</span></button>
            <button onClick={() => setCartOpen(true)} className="relative rounded-full p-2 hover:bg-white/70"><ShoppingCart size={18} /><span className="absolute -right-0.5 -top-0.5 rounded-full bg-emerald-900 px-1.5 text-[10px] text-white">{state.cart.length}</span></button>
            <button onClick={() => setMobileNav((x) => !x)} className="rounded-full p-2 md:hidden">{mobileNav ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>
        {mobileNav && (
          <div className="border-t border-emerald-100 bg-white px-4 py-4 md:hidden">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gifts" className="mb-3 w-full rounded-xl border border-emerald-100 p-2 text-sm" />
            <div className="grid gap-2 text-sm">{['shop', 'occasions', 'stories', 'contact'].map((id) => <a key={id} href={`#${id}`} onClick={() => setMobileNav(false)}>{id}</a>)}</div>
          </div>
        )}
      </header>

      <section id="home" className="relative overflow-hidden px-4 pt-28 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 py-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs uppercase tracking-[0.2em] text-amber-700">Preserve precious memories</p>
            <h1 className="font-serif text-4xl leading-tight md:text-6xl">Luxury handmade gifts that hold your <span className="text-amber-600">most emotional moments</span>.</h1>
            <p className="mt-4 max-w-xl text-emerald-800/80">Premium personalized resin art, keychains, bangles, hampers and frames—crafted to feel deeply personal and beautifully timeless.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#shop" className="rounded-full bg-emerald-900 px-7 py-3 text-white">Shop Now</a>
              <button onClick={() => setSelectedProduct(products[0])} className="rounded-full border border-amber-500 px-7 py-3 text-amber-700">Customize Your Gift</button>
            </div>
            <p className="mt-8 inline-flex items-center gap-1 text-sm text-emerald-700">Scroll <ChevronDown size={16} className="animate-bounce" /></p>
          </div>
          <div className="relative rounded-[2rem] border border-white/60 bg-gradient-to-br from-emerald-900 via-emerald-800 to-black p-8 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-200">Gift Aura Signature</p>
            <div className="mt-4 grid h-80 place-items-center rounded-3xl bg-white/5 text-8xl backdrop-blur">💝</div>
            <p className="mt-4 text-sm text-emerald-50/80">Lifestyle image/video placeholder. Replace with optimized hero media.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm md:flex md:items-center md:gap-4">
          <select className="w-full rounded-xl border border-emerald-100 p-2 md:w-56" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="mt-3 block text-sm md:mt-0 md:flex-1">Max price: {currency(maxPrice)}<input type="range" min={500} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" /></label>
          <label className="mt-3 flex items-center gap-2 text-sm md:mt-0"><input type="checkbox" checked={customOnly} onChange={(e) => setCustomOnly(e.target.checked)} /> Customizable only</label>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex items-end justify-between"><h2 className="font-serif text-3xl md:text-4xl">Best Sellers</h2><p className="text-sm text-emerald-700">Loved by thousands. Personalized for you.</p></div>
        {loadingProducts ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-white" />)}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((p) => <ProductCard key={p.id} p={p} onOpen={setSelectedProduct} onQuickAdd={addSelectedToCart} onWish={(id) => {dispatch({ type: 'TOGGLE_WISHLIST', payload: id }); addToast('Wishlist updated ♥');}} wished={state.wishlist.includes(p.id)} />)}</div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8" id="occasions">
        <h2 className="mb-6 font-serif text-3xl">Shop by Occasion</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{['Anniversary 💐', 'Birthday 🎂', 'Wedding 👰', 'Baby 👶', 'Proposal 💍'].map((o) => <button key={o} className="rounded-2xl border border-emerald-100 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-md">{o}</button>)}</div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 lg:grid-cols-4 lg:px-8">
        {trustSignals.map((item) => (
          <div key={item.title} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
            <item.icon size={18} className="text-amber-700" />
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <p className="text-sm text-emerald-800/75">{item.text}</p>
          </div>
        ))}
      </section>

      <section id="stories" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between"><h2 className="font-serif text-3xl">Customer Love Stories</h2><div className="flex gap-2"><button className="rounded-full border p-2"><ChevronLeft size={14} /></button><button className="rounded-full border p-2"><ChevronRight size={14} /></button></div></div>
        <div className="grid gap-5 md:grid-cols-3">{testimonials.map((t) => <article key={t.name} className="rounded-2xl border border-emerald-100 bg-white p-6"><p className="text-3xl">{t.avatar}</p><p className="mt-3 text-sm text-emerald-800/80">“{t.quote}”</p><p className="mt-4 font-medium">{t.name}</p><p className="text-xs uppercase tracking-wider text-amber-700">{t.occasion}</p></article>)}</div>
      </section>

      <footer id="contact" className="mt-8 bg-emerald-950 px-4 py-12 text-emerald-50 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div><h3 className="font-serif text-2xl">Gift Aura</h3><p className="mt-3 text-sm text-emerald-100/80">Turning memories into timeless gifts with handcrafted emotion.</p></div>
          <div><h4 className="font-semibold">Shop</h4><ul className="mt-3 space-y-2 text-sm text-emerald-100/80"><li>All Products</li><li>Custom Orders</li><li>Gift Hampers</li></ul></div>
          <div><h4 className="font-semibold">Support</h4><ul className="mt-3 space-y-2 text-sm text-emerald-100/80"><li>Shipping</li><li>FAQs</li><li>Returns</li></ul></div>
          <form className="rounded-2xl border border-white/20 p-4"><h4 className="font-semibold">Join our memory letters</h4><p className="mt-2 text-sm text-emerald-100/80">Get emotional gifting ideas and launch access.</p><input placeholder="Your email" className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 p-2 text-sm" /><button type="button" className="mt-3 w-full rounded-xl bg-amber-500 py-2 text-sm font-semibold text-emerald-950">Subscribe</button></form>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" aria-label="Chat with us on WhatsApp" rel="noreferrer" className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-xl">
        <MessageCircle size={18} />
        <span className="hidden text-sm sm:block">Chat with us</span>
      </a>

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur">
              <h3 className="font-serif text-2xl">{selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} aria-label="Close modal"><X /></button>
            </div>
            <div className="grid gap-6 p-5 lg:grid-cols-2">
              <div>
                <div className="grid h-72 place-items-center rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 text-8xl">{selectedProduct.gallery[activeImage]}</div>
                <div className="mt-3 flex gap-2">{selectedProduct.gallery.map((g, idx) => <button key={idx} onClick={() => setActiveImage(idx)} className={`grid h-16 w-16 place-items-center rounded-xl border text-2xl ${idx === activeImage ? 'border-amber-500' : 'border-emerald-100'}`}>{g}</button>)}</div>
              </div>
              <div>
                <p className="text-sm text-emerald-800/80">{selectedProduct.details}</p>
                <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Only {selectedProduct.slotsLeft} slots left this week · {selectedProduct.eta}</p>
                <div className="mt-4 space-y-3 rounded-2xl border border-emerald-100 bg-[#FFFCF7] p-4">
                  <h4 className="font-semibold">Personalization Studio</h4>
                  <input placeholder="Gift message" value={customization.message || ''} onChange={(e) => setCustomization((s) => ({ ...s, message: e.target.value }))} className="w-full rounded-xl border border-emerald-100 p-2 text-sm" />
                  <select value={customization.finish || ''} onChange={(e) => setCustomization((s) => ({ ...s, finish: e.target.value }))} className="w-full rounded-xl border border-emerald-100 p-2 text-sm">
                    <option value="">Choose finish</option><option>Classic Ivory</option><option>Emerald Luxe</option><option>24K Soft Gold</option>
                  </select>
                  <div>
                    <label className="mb-1 block text-sm">Theme color</label>
                    <input type="color" value={customization.color || '#d4af37'} onChange={(e) => setCustomization((s) => ({ ...s, color: e.target.value }))} className="h-10 w-16 rounded" />
                  </div>
                  <label className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-emerald-200 p-4 text-center text-sm">
                    <ImagePlus size={16} className="mb-1" /> Upload reference photo (drag-drop enabled by browser)
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setUploadPreview(String(reader.result));
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {uploadPreview && <img src={uploadPreview} alt="Customization upload preview" className="h-24 w-24 rounded-xl object-cover" />}
                </div>
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm">Base: {currency(selectedProduct.price)} · Customization: {currency(calculateCustomizationFee())} · Final: <strong>{currency(currentPrice)}</strong></div>
                <button onClick={() => addSelectedToCart(selectedProduct)} className="mt-4 w-full rounded-full bg-emerald-900 py-3 text-white">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {wishlistOpen && (
        <div className="fixed inset-0 z-[65] bg-black/40 p-4" onClick={() => setWishlistOpen(false)}>
          <div className="ml-auto h-full w-full max-w-md overflow-auto rounded-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-serif text-2xl">Wishlist</h3><button onClick={() => setWishlistOpen(false)}><X /></button></div>
            <div className="space-y-3">{state.wishlist.length === 0 ? <p className="text-sm">No saved items yet.</p> : state.wishlist.map((id) => {
              const p = products.find((x) => x.id === id)!;
              return <div key={id} className="flex items-center justify-between rounded-xl border p-3"><div><p>{p.name}</p><p className="text-sm text-amber-700">{currency(p.price)}</p></div><button onClick={() => setSelectedProduct(p)} className="text-sm text-emerald-700">View</button></div>;
            })}</div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4"><h3 className="font-serif text-2xl">Your Cart</h3><button onClick={() => setCartOpen(false)}><X /></button></div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {state.cart.length === 0 ? <p className="pt-12 text-center text-sm">Your cart is empty. Start crafting your gift ✨</p> : state.cart.map((item) => (
                <div key={item.cartId} className="rounded-2xl border border-emerald-100 p-3">
                  <div className="flex items-start justify-between"><p className="font-medium">{item.image} {item.name}</p><button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.cartId })}><X size={16} /></button></div>
                  <p className="text-xs text-emerald-700">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between"><strong className="text-amber-700">{currency(item.finalPrice * item.quantity)}</strong><div className="flex items-center gap-2"><button onClick={() => dispatch({ type: 'QTY', payload: { cartId: item.cartId, delta: -1 } })} className="rounded-full border p-1"><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => dispatch({ type: 'QTY', payload: { cartId: item.cartId, delta: 1 } })} className="rounded-full border p-1"><Plus size={14} /></button></div></div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t p-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping estimate</span><span>{shipping === 0 ? 'Free' : currency(shipping)}</span></div>
              <div className="flex justify-between text-base font-semibold"><span>Order total</span><span>{currency(total)}</span></div>
              <button className="w-full rounded-full bg-emerald-900 py-3 text-white">Proceed to Secure Checkout</button>
              <p className="text-xs text-emerald-700">Payment placeholder: wire to Razorpay / Stripe intent API here.</p>
            </div>
          </aside>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-[80] flex -translate-x-1/2 flex-col gap-2">
        {state.toasts.map((t) => <div key={t.id} className="rounded-full bg-emerald-950 px-4 py-2 text-sm text-white shadow-lg">{t.text}</div>)}
      </div>
    </div>
  );
}
