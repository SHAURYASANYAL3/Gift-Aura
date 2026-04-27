import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Menu,
  MessageCircle,
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
  category: 'Resin Art' | 'Personalized Keychains' | 'Personalized Bangles' | 'Curated Gift Hampers' | 'Personalized Photo Frames';
  price: number;
  images: string[];
  icon: string;
  description: string;
  details: string;
  customizable: string[];
  rating: number;
  reviews: number;
  badge?: 'Bestseller' | 'Limited';
  slotsLeft: number;
  shipDays: string;
};

type CartItem = Product & {
  cartId: string;
  quantity: number;
  finalPrice: number;
  customization: Record<string, string>;
  uploadPreview?: string;
};

type Toast = { id: string; message: string };

type StoreState = {
  cart: CartItem[];
  wishlist: number[];
};

type StoreAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartId: string; quantity: number } }
  | { type: 'TOGGLE_WISHLIST'; payload: number }
  | { type: 'MOVE_TO_WISHLIST'; payload: CartItem };

const products: Product[] = [
  {
    id: 1,
    name: 'Eternal Bloom Resin Art',
    category: 'Resin Art',
    price: 2499,
    images: ['🌸', '🪷', '✨'],
    icon: '🌸',
    description: 'Preserve real flowers in crystal-clear resin with a custom name embed.',
    details:
      'Each piece is handcrafted with UV-resistant resin, archival florals, and artisan finishing to preserve your milestone moments forever.',
    customizable: ['Name/Date Embed', 'Flower Choice', 'Base Color'],
    rating: 4.9,
    reviews: 342,
    badge: 'Bestseller',
    slotsLeft: 7,
    shipDays: '3-5 days',
  },
  {
    id: 2,
    name: 'Couples Portrait Resin',
    category: 'Resin Art',
    price: 3499,
    images: ['👫', '💞', '🖼️'],
    icon: '👫',
    description: 'Hand-painted portrait embedded in premium resin for unforgettable gifting.',
    details:
      'Our artists hand-paint your memory, then encapsulate it in crystal resin with luxury polish and custom frame finishes.',
    customizable: ['Photo Upload', 'Background Style', 'Frame Color'],
    rating: 4.95,
    reviews: 287,
    badge: 'Limited',
    slotsLeft: 5,
    shipDays: '4-6 days',
  },
  {
    id: 3,
    name: 'Personalized Keychain Soul',
    category: 'Personalized Keychains',
    price: 599,
    images: ['🔑', '💛', '🪄'],
    icon: '🔑',
    description: 'Minimalist resin keychain with names, initials, and symbolic charms.',
    details:
      'Compact, lightweight, and deeply personal. Add initials, hues, and shape to carry your memory wherever you go.',
    customizable: ['Text/Initials', 'Color', 'Shape'],
    rating: 4.8,
    reviews: 891,
    badge: 'Bestseller',
    slotsLeft: 12,
    shipDays: '2-4 days',
  },
  {
    id: 4,
    name: 'Signature Bangle - Personalized',
    category: 'Personalized Bangles',
    price: 1299,
    images: ['💍', '🌙', '✨'],
    icon: '💍',
    description: 'Hand-finished personalized bangle in timeless minimalist luxury.',
    details:
      'A handcrafted keepsake with your quote or date, available in elegant metal finishes and type styles.',
    customizable: ['Text', 'Metal Type', 'Font Style'],
    rating: 4.85,
    reviews: 564,
    slotsLeft: 9,
    shipDays: '3-4 days',
  },
  {
    id: 5,
    name: 'Memory Frame - Golden Hours',
    category: 'Personalized Photo Frames',
    price: 1899,
    images: ['🖼️', '🌿', '💫'],
    icon: '🖼️',
    description: 'Custom engraved frame for your favorite photographs and moments.',
    details:
      'Crafted in premium wood finishes with elegant engraving and multi-photo arrangements for emotional storytelling.',
    customizable: ['Photo Upload (1-4)', 'Engraving Text', 'Wood Finish'],
    rating: 4.88,
    reviews: 423,
    badge: 'Bestseller',
    slotsLeft: 8,
    shipDays: '3-5 days',
  },
  {
    id: 6,
    name: 'Luxury Gift Hamper - Love Edition',
    category: 'Curated Gift Hampers',
    price: 4999,
    images: ['🎁', '🍫', '🕯️'],
    icon: '🎁',
    description: 'Signature hamper with personalized resin keepsake and premium treats.',
    details:
      'The highest-converting premium gifting format: personalization + curation + handwritten emotion in one luxury box.',
    customizable: ['Resin Design', 'Color Theme', 'Personal Message'],
    rating: 4.92,
    reviews: 198,
    badge: 'Limited',
    slotsLeft: 4,
    shipDays: '4-7 days',
  },
];

const testimonials = [
  {
    name: 'Priya & Arjun',
    occasion: 'Proposal Gift',
    quote: 'She cried happy tears. Gift Aura made our proposal feel eternal.',
    avatar: '👰',
  },
  {
    name: 'Anaya',
    occasion: 'Anniversary',
    quote: 'Luxury packaging, stunning quality, and deeply emotional detailing.',
    avatar: '💐',
  },
  {
    name: 'Rahul',
    occasion: 'Birthday',
    quote: 'Everything felt premium, personalized, and genuinely heartfelt.',
    avatar: '🎂',
  },
];

const reducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((item) => item.cartId !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.cartId === action.payload.cartId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item,
        ),
      };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    case 'MOVE_TO_WISHLIST':
      return {
        cart: state.cart.filter((item) => item.cartId !== action.payload.cartId),
        wishlist: state.wishlist.includes(action.payload.id)
          ? state.wishlist
          : [...state.wishlist, action.payload.id],
      };
    default:
      return state;
  }
};

const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
} | null>(null);

function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { cart: [], wishlist: [] });
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

const SectionTitle = memo(function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-serif text-3xl md:text-4xl text-emerald-950">{title}</h2>
      {subtitle && <p className="mt-3 text-sm md:text-base text-emerald-800/80">{subtitle}</p>}
    </div>
  );
});

export default function GiftAura() {
  return (
    <StoreProvider>
      <GiftAuraPage />
    </StoreProvider>
  );
}

function GiftAuraPage() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(6000);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const addToast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2200);
  }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], []);

  const searchSuggestions = useMemo(
    () =>
      search.length < 1
        ? []
        : products
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 4)
            .map((p) => p.name),
    [search],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesPrice = p.price <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      }),
    [search, selectedCategory, priceRange],
  );

  const cartSubtotal = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
    [state.cart],
  );
  const shipping = cartSubtotal > 2999 ? 0 : 149;

  return (
    <div className="min-h-screen bg-[#faf6ef] text-emerald-950">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#fffaf1]/90 shadow-lg backdrop-blur-md border-b border-[#d4af37]/20' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button className="md:hidden" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          <a href="#home" className="font-serif text-2xl font-semibold text-[#9f7a1d]">✨ Gift Aura</a>

          <nav className="ml-8 hidden items-center gap-6 text-sm md:flex">
            {['Shop', 'Occasion', 'Stories', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#9f7a1d] transition-colors">{item}</a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-emerald-900/40" />
              <input
                aria-label="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search heartfelt gifts"
                className="w-48 rounded-full border border-[#d4af37]/35 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#d4af37]/40"
              />
              {searchSuggestions.length > 0 && (
                <div className="absolute mt-2 w-full rounded-xl border border-[#d4af37]/20 bg-white p-2 text-xs shadow-xl">
                  {searchSuggestions.map((s) => (
                    <button key={s} className="block w-full rounded-md px-2 py-1 text-left hover:bg-[#faf6ef]" onClick={() => setSearch(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setWishlistOpen(true)} className="relative rounded-full p-2 hover:bg-white/70" aria-label="Open wishlist">
              <Heart className="h-5 w-5" />
              {state.wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9f7a1d] px-1 text-[10px] text-white">{state.wishlist.length}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative rounded-full p-2 hover:bg-white/70" aria-label="Open cart">
              <ShoppingCart className="h-5 w-5" />
              {state.cart.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9f7a1d] px-1 text-[10px] text-white">{state.cart.length}</span>}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[#d4af37]/20 bg-white/95 p-4 md:hidden">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-emerald-900/40" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gifts" className="w-full rounded-full border border-[#d4af37]/35 py-2 pl-9 pr-3 text-sm" />
            </div>
            <div className="grid gap-2 text-sm">
              {['Shop', 'Occasion', 'Stories', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="rounded-md px-2 py-1 hover:bg-[#faf6ef]">{item}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-20" id="home">
        <section className="relative overflow-hidden px-4 pb-20 pt-12 md:pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#d4af3725,transparent_35%),radial-gradient(circle_at_bottom_left,#ecb9bf30,transparent_40%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#9f7a1d]"><Sparkles className="h-3.5 w-3.5" /> Handcrafted luxury keepsakes</p>
              <h1 className="font-serif text-4xl leading-tight md:text-6xl">Turning Precious Memories Into Timeless Gifts.</h1>
              <p className="mt-4 max-w-xl text-emerald-900/75">Premium personalized gifting in resin, metal, and curated luxury hampers—crafted to make hearts pause and smile.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#shop" className="inline-flex items-center justify-center rounded-full bg-[#9f7a1d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#d4af37]/30 transition hover:scale-[1.02]">Shop Now</a>
                <button onClick={() => setSelectedProduct(products[0])} className="inline-flex items-center justify-center rounded-full border border-[#9f7a1d]/50 px-6 py-3 text-sm font-semibold text-[#9f7a1d] transition hover:bg-[#fffaf1]">Customize Your Gift</button>
              </div>
              <p className="mt-8 animate-bounce text-xs tracking-[0.2em] text-emerald-900/60">SCROLL TO EXPLORE</p>
            </div>
            <div className="relative rounded-3xl border border-[#d4af37]/25 bg-gradient-to-br from-[#fffef8] to-[#f7ede1] p-6 shadow-2xl">
              <div className="absolute right-4 top-4 rounded-full bg-[#9f7a1d] px-3 py-1 text-xs text-white">Only 7 slots left this week</div>
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[#f3e3cd] text-[120px]">🎁</div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-medium">Handmade with archival resin</span>
                <span className="text-[#9f7a1d]">Ships in 3-5 days</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14" id="shop">
          <SectionTitle title="Shop Signature Collections" subtitle="Find your perfect keepsake through intelligent search, category, and price filtering." />
          <div className="mb-8 grid gap-3 rounded-2xl border border-[#d4af37]/25 bg-white/80 p-4 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block">Category</span>
              <div className="relative">
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-[#d4af37]/35 bg-white px-3 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#d4af37]/35">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-emerald-900/50" />
              </div>
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block">Max price: ₹{priceRange}</span>
              <input type="range" min={500} max={6000} step={100} value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-[#9f7a1d]" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(loading ? Array.from({ length: 6 }) : filteredProducts).map((entry, idx) =>
              loading ? (
                <div key={`s-${idx}`} className="animate-pulse rounded-2xl border border-[#d4af37]/15 bg-white p-4">
                  <div className="mb-4 h-44 rounded-xl bg-[#f4ebdc]" />
                  <div className="h-4 w-3/4 rounded bg-[#f1e4cf]" />
                  <div className="mt-2 h-3 w-full rounded bg-[#f1e4cf]" />
                </div>
              ) : (
                <ProductCard
                  key={(entry as Product).id}
                  product={entry as Product}
                  wished={state.wishlist.includes((entry as Product).id)}
                  onCustomize={() => setSelectedProduct(entry as Product)}
                  onQuickAdd={(product) => {
                    dispatch({
                      type: 'ADD_TO_CART',
                      payload: {
                        ...product,
                        cartId: crypto.randomUUID(),
                        quantity: 1,
                        finalPrice: product.price,
                        customization: {},
                      },
                    });
                    addToast('Added to cart');
                  }}
                  onToggleWish={(id) => {
                    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
                    addToast('Wishlist updated');
                  }}
                />
              ),
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <SectionTitle title="Why Choose Gift Aura" subtitle="Craftsmanship, trust, and emotional storytelling in every order." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Handmade Luxury', 'Each piece is made by artisans, never mass-produced.', <Sparkles key="s" className="h-5 w-5" />],
              ['Memory Preservation', 'We preserve flowers, photos, names, and moments beautifully.', <CheckCircle2 key="c" className="h-5 w-5" />],
              ['Secure Checkout', 'Razorpay / Stripe ready checkout layer with payment placeholders.', <ShieldCheck key="sh" className="h-5 w-5" />],
              ['Fast Dispatch', 'Premium packaging and insured shipping across India.', <Truck key="t" className="h-5 w-5" />],
            ].map(([title, desc, icon]) => (
              <div key={String(title)} className="rounded-2xl border border-[#d4af37]/20 bg-white p-5">
                <div className="mb-3 inline-flex rounded-full bg-[#f3e5c9] p-2 text-[#9f7a1d]">{icon}</div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm text-emerald-900/70">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/60 px-4 py-16" id="occasion">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="Shop by Occasion" subtitle="Guided gifting journeys that reduce decision fatigue and improve conversions." />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {['Anniversary 💐', 'Birthday 🎂', 'Wedding 👰', 'Baby Shower 🧸', 'Proposal 💍'].map((o) => (
                <button key={o} className="group rounded-2xl border border-[#d4af37]/25 bg-[#fffaf1] p-6 text-left transition hover:-translate-y-1 hover:shadow-lg">
                  <p className="font-serif text-lg">{o}</p>
                  <p className="mt-2 text-xs text-emerald-900/70">Curated premium picks <ArrowRight className="inline h-3 w-3" /></p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16" id="stories">
          <SectionTitle title="Customer Love Stories" subtitle="Emotion-first testimonials to improve trust and purchase confidence." />
          <TestimonialCarousel />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="rounded-2xl border border-[#d4af37]/20 bg-white px-6 py-7">
            <div className="grid gap-3 text-sm md:grid-cols-4">
              {['Secure Checkout', '100% Handmade', 'Premium Gift Packaging', 'Memory Preservation Specialists'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 rounded-xl bg-[#faf6ef] px-3 py-2"><CheckCircle2 className="h-4 w-4 text-[#9f7a1d]" />{badge}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#0f2f2a] px-4 py-14 text-[#f9f5ee]">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-serif text-2xl">Gift Aura</h3>
            <p className="mt-3 text-sm text-[#f9f5ee]/80">Turning your milestones into timeless handcrafted keepsakes.</p>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em]">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#f9f5ee]/85"><li>All Products</li><li>Custom Orders</li><li>Gift Hampers</li></ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em]">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-[#f9f5ee]/85"><li>Shipping</li><li>FAQs</li><li>Returns</li></ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="mt-3 text-sm text-[#f9f5ee]/85">Receive heartfelt gifting inspiration and early-access launches.</p>
            <div className="mt-3 flex">
              <input aria-label="Email" placeholder="Your email" className="w-full rounded-l-full border border-white/25 bg-white/10 px-4 py-2 text-sm outline-none" />
              <button className="rounded-r-full bg-[#9f7a1d] px-4 py-2 text-sm font-semibold">Join</button>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp" className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-xl">
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Chat with us</span>
        <span className="pointer-events-none absolute -top-10 right-0 hidden whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[11px] group-hover:block">Need a custom gift idea?</span>
      </a>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} subtotal={cartSubtotal} shipping={shipping} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} onCustomize={setSelectedProduct} />
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onToast={addToast} />}

      <div className="fixed right-4 top-24 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-xl border border-[#d4af37]/30 bg-white px-3 py-2 text-xs shadow-lg">{t.message}</div>
        ))}
      </div>
    </div>
  );
}

const ProductCard = memo(function ProductCard({
  product,
  wished,
  onCustomize,
  onQuickAdd,
  onToggleWish,
}: {
  product: Product;
  wished: boolean;
  onCustomize: () => void;
  onQuickAdd: (product: Product) => void;
  onToggleWish: (id: number) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8e7ce] to-[#f4f0e8] text-7xl">
        <div className="transition duration-500 group-hover:scale-110">{product.icon}</div>
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-[#9f7a1d] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{product.badge}</span>}
        <button onClick={() => onToggleWish(product.id)} aria-label="Add to wishlist" className="absolute right-3 top-3 rounded-full bg-white/90 p-2">
          <Heart className={`h-4 w-4 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9f7a1d]">{product.category}</p>
        <h3 className="mt-2 font-serif text-xl">{product.name}</h3>
        <p className="mt-2 text-sm text-emerald-900/70">{product.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-900/70">
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#d4af37] text-[#d4af37]" /> {product.rating}</span>
          <span>({product.reviews} reviews)</span>
          <span className="ml-auto text-[#9f7a1d]">{product.slotsLeft} slots left</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-semibold text-[#9f7a1d]">₹{product.price}</span>
          <div className="flex gap-2">
            <button onClick={() => onQuickAdd(product)} className="rounded-full border border-[#d4af37]/40 px-3 py-2 text-xs">Quick Add</button>
            <button onClick={onCustomize} className="rounded-full bg-[#9f7a1d] px-3 py-2 text-xs font-semibold text-white">Customize</button>
          </div>
        </div>
      </div>
    </article>
  );
});

function ProductModal({ product, onClose, onToast }: { product: Product; onClose: () => void; onToast: (message: string) => void }) {
  const { dispatch } = useStore();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [customForm, setCustomForm] = useState<Record<string, string>>({});
  const [uploadPreview, setUploadPreview] = useState<string>();
  const [dragging, setDragging] = useState(false);

  const extraCost = useMemo(() => {
    let total = 0;
    if (customForm['Gift Wrap'] === 'Luxury') total += 199;
    if ((customForm['Message'] || '').length > 40) total += 99;
    if (uploadPreview) total += 149;
    return total;
  }, [customForm, uploadPreview]);

  const finalPrice = product.price + extraCost;

  const onFileChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    onFileChange(e.dataTransfer.files?.[0]);
  };

  const addToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        ...product,
        cartId: crypto.randomUUID(),
        quantity: 1,
        finalPrice,
        customization: customForm,
        uploadPreview,
      },
    });
    onToast('Customized gift added to cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 p-4 backdrop-blur">
          <h3 className="font-serif text-2xl">{product.name}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <div className="flex h-72 items-center justify-center rounded-2xl bg-[#f4ead7] text-8xl">{activeImage}</div>
            <div className="mt-3 flex gap-2">
              {product.images.map((img) => (
                <button key={img} className={`flex h-16 w-16 items-center justify-center rounded-xl border text-2xl ${img === activeImage ? 'border-[#9f7a1d]' : 'border-[#d4af37]/30'}`} onClick={() => setActiveImage(img)}>{img}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-emerald-900/75">{product.details}</p>
            <p className="mt-3 rounded-lg bg-[#fff7e8] px-3 py-2 text-xs text-[#9f7a1d]">Only {product.slotsLeft} customization slots left this week • Ships in {product.shipDays}</p>

            <div className="mt-4 space-y-3">
              {product.customizable.map((field) => (
                <label key={field} className="block text-sm">
                  <span className="mb-1 block">{field}</span>
                  <input
                    value={customForm[field] ?? ''}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full rounded-xl border border-[#d4af37]/35 px-3 py-2 outline-none focus:ring-2 focus:ring-[#d4af37]/35"
                    placeholder={`Enter ${field.toLowerCase()}`}
                  />
                </label>
              ))}

              <label className="block text-sm">
                <span className="mb-1 block">Gift Wrap</span>
                <select onChange={(e) => setCustomForm((p) => ({ ...p, 'Gift Wrap': e.target.value }))} className="w-full rounded-xl border border-[#d4af37]/35 px-3 py-2">
                  <option>Standard</option>
                  <option>Luxury</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block">Accent Color</span>
                <input type="color" onChange={(e) => setCustomForm((p) => ({ ...p, AccentColor: e.target.value }))} className="h-11 w-full rounded-xl border border-[#d4af37]/35" />
              </label>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`block cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center ${dragging ? 'border-[#9f7a1d] bg-[#fff6e8]' : 'border-[#d4af37]/35'}`}
              >
                <ImagePlus className="mx-auto mb-2 h-5 w-5" />
                Upload reference image (drag & drop)
                <input type="file" className="hidden" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => onFileChange(e.target.files?.[0])} />
                {uploadPreview && <img src={uploadPreview} alt="Upload preview" className="mx-auto mt-3 h-24 w-24 rounded-lg object-cover" />}
              </label>

              <div className="rounded-xl bg-[#faf6ef] p-4 text-sm">
                <p>Base price: ₹{product.price}</p>
                <p>Customization add-ons: ₹{extraCost}</p>
                <p className="mt-1 text-lg font-semibold text-[#9f7a1d]">Total: ₹{finalPrice}</p>
              </div>
            </div>

            <button onClick={addToCart} className="mt-5 w-full rounded-full bg-[#9f7a1d] px-6 py-3 font-semibold text-white">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({ open, onClose, subtotal, shipping }: { open: boolean; onClose: () => void; subtotal: number; shipping: number }) {
  const { state, dispatch } = useStore();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex" onClick={onClose}>
      <div className="flex-1 bg-black/25" />
      <aside className="w-full max-w-md bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h3 className="font-serif text-2xl">Your Cart</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="max-h-[56vh] space-y-3 overflow-y-auto pr-1">
          {state.cart.length === 0 ? <p className="py-10 text-center text-sm text-emerald-900/70">Your cart is empty.</p> : state.cart.map((item) => (
            <div key={item.cartId} className="rounded-xl border border-[#d4af37]/25 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-emerald-900/70">₹{item.finalPrice} × {item.quantity}</p>
                </div>
                <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.cartId })}><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId: item.cartId, quantity: item.quantity - 1 } })} className="rounded border px-2">-</button>
                <span className="min-w-7 text-center">{item.quantity}</span>
                <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId: item.cartId, quantity: item.quantity + 1 } })} className="rounded border px-2">+</button>
                <button onClick={() => dispatch({ type: 'MOVE_TO_WISHLIST', payload: item })} className="ml-auto text-xs text-[#9f7a1d]">Move to wishlist</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-[#faf6ef] p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>₹{subtotal + shipping}</span></div>
          <button className="mt-2 w-full rounded-full bg-[#9f7a1d] py-3 text-white">Pay with Razorpay / Stripe (placeholder)</button>
          <p className="text-[11px] text-emerald-900/70">Integration note: call your backend intent API before launching payment gateway SDK.</p>
        </div>
      </aside>
    </div>
  );
}

function WishlistModal({ open, onClose, onCustomize }: { open: boolean; onClose: () => void; onCustomize: (p: Product) => void }) {
  const { state } = useStore();
  const wishedProducts = useMemo(() => products.filter((p) => state.wishlist.includes(p.id)), [state.wishlist]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-2xl">Wishlist</h3>
          <button onClick={onClose}><X /></button>
        </div>
        {wishedProducts.length === 0 ? <p className="text-sm text-emerald-900/70">No items yet.</p> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {wishedProducts.map((p) => (
              <button key={p.id} className="flex items-center gap-3 rounded-xl border p-3 text-left" onClick={() => { onCustomize(p); onClose(); }}>
                <span className="text-3xl">{p.icon}</span>
                <span>
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-xs text-emerald-900/70">Customize now</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 2800);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const active = testimonials[index];

  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial" className="rounded-full border p-2"><ChevronLeft className="h-4 w-4" /></button>
        <div className="text-center">
          <p className="text-5xl">{active.avatar}</p>
          <p className="mt-2 font-serif text-xl">{active.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#9f7a1d]">{active.occasion}</p>
          <div className="my-3 flex justify-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#d4af37] text-[#d4af37]" />)}</div>
          <p className="max-w-xl text-sm italic text-emerald-900/80">“{active.quote}”</p>
        </div>
        <button onClick={() => setIndex((i) => (i + 1) % testimonials.length)} aria-label="Next testimonial" className="rounded-full border p-2"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
