import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import {
  CheckCircle2,
  ChevronDown,
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
  category: string;
  price: number;
  image: string;
  gallery: string[];
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

type StoreState = { cart: CartItem[]; wishlist: number[] };
type Action =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_CART'; payload: string }
  | { type: 'QTY'; payload: { cartId: string; qty: number } }
  | { type: 'WISH'; payload: number };

const products: Product[] = [
  {
    id: 1,
    name: 'Eternal Bloom Resin Art',
    category: 'Resin Art',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Preserve real flowers in crystal-clear resin with your names.',
    details: 'Handcrafted archival resin piece that preserves flowers and heartfelt dates for generations.',
    customizable: ['Name / Date', 'Flower Choice', 'Base Color'],
    rating: 4.9,
    reviews: 342,
    badge: 'Bestseller',
    slotsLeft: 7,
    shipDays: '3–5 days',
  },
  {
    id: 2,
    name: 'Couple Portrait Resin',
    category: 'Resin Art',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Museum-style portrait preserved in luxury resin block.',
    details: 'Upload your photo and choose style direction for a handcrafted portrait keepsake.',
    customizable: ['Photo Upload', 'Background Style', 'Frame Tone'],
    rating: 4.95,
    reviews: 287,
    badge: 'Limited',
    slotsLeft: 5,
    shipDays: '4–6 days',
  },
  {
    id: 3,
    name: 'Personalized Keychain Soul',
    category: 'Personalized Keychains',
    price: 599,
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1625591340248-6d6d5969f761?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Minimal keepsake keychain with initials and color themes.',
    details: 'Pocket-friendly personalized accessory for daily emotional connection.',
    customizable: ['Text / Initials', 'Shape', 'Accent Color'],
    rating: 4.8,
    reviews: 891,
    badge: 'Bestseller',
    slotsLeft: 12,
    shipDays: '2–4 days',
  },
  {
    id: 4,
    name: 'Signature Personalized Bangle',
    category: 'Personalized Bangles',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611107683227-e9060eccd846?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Elegant engraved bangle crafted for everyday luxury.',
    details: 'Hand-finished metal personalization with premium gift-ready packaging.',
    customizable: ['Text', 'Metal Type', 'Font Style'],
    rating: 4.85,
    reviews: 564,
    slotsLeft: 9,
    shipDays: '3–4 days',
  },
  {
    id: 5,
    name: 'Memory Frame Golden Hours',
    category: 'Personalized Photo Frames',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Premium wood frame with custom engraving and your photos.',
    details: 'A story-driven frame experience for weddings, anniversaries, and family memories.',
    customizable: ['Photo Upload', 'Engraving Text', 'Wood Finish'],
    rating: 4.88,
    reviews: 423,
    badge: 'Bestseller',
    slotsLeft: 8,
    shipDays: '3–5 days',
  },
  {
    id: 6,
    name: 'Luxury Gift Hamper Love Edition',
    category: 'Curated Gift Hampers',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1459257831348-f0cdd359235f?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Curated premium hamper with customized keepsakes and note.',
    details: 'High-converting luxury hamper for festive and milestone gifting moments.',
    customizable: ['Theme', 'Message Card', 'Resin Add-on'],
    rating: 4.92,
    reviews: 198,
    badge: 'Limited',
    slotsLeft: 4,
    shipDays: '4–7 days',
  },
];

const testimonials = [
  {
    name: 'Priya & Arjun',
    text: 'Gift Aura made our proposal unforgettable. The quality felt truly premium.',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Anaya',
    text: 'Luxury packaging, emotional customization, and very smooth delivery.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Rahul',
    text: 'Best premium gifting experience online. Super easy to personalize.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_CART':
      return { ...state, cart: state.cart.filter((i) => i.cartId !== action.payload) };
    case 'QTY':
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.cartId === action.payload.cartId ? { ...i, quantity: Math.max(1, action.payload.qty) } : i,
        ),
      };
    case 'WISH':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    default:
      return state;
  }
}

const Store = createContext<{ state: StoreState; dispatch: React.Dispatch<Action> } | null>(null);

function useStore() {
  const ctx = useContext(Store);
  if (!ctx) throw new Error('Store missing');
  return ctx;
}

export default function GiftAura() {
  const [state, dispatch] = useReducer(reducer, { cart: [], wishlist: [] });
  return (
    <Store.Provider value={{ state, dispatch }}>
      <Page />
    </Store.Provider>
  );
}

function Page() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()) &&
          (selectedCategory === 'All' || p.category === selectedCategory) &&
          p.price <= maxPrice,
      ),
    [search, selectedCategory, maxPrice],
  );
  const subtotal = state.cart.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0);

  const toast = useCallback((text: string) => {
    setToasts((p) => [...p, text]);
    setTimeout(() => setToasts((p) => p.slice(1)), 1800);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf4] via-[#f9f4ea] to-[#fff] text-emerald-950">
      <header className="sticky top-0 z-50 border-b border-[#d4af37]/15 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <a href="#home" className="font-serif text-2xl font-semibold text-[#9f7a1d]">Gift Aura</a>
          <nav className="ml-6 hidden gap-5 text-sm md:flex">
            <a href="#shop" className="hover:text-[#9f7a1d]">Shop</a>
            <a href="#stories" className="hover:text-[#9f7a1d]">Stories</a>
            <a href="#contact" className="hover:text-[#9f7a1d]">Contact</a>
          </nav>
          <div className="ml-auto hidden w-64 items-center rounded-full border border-[#d4af37]/30 bg-white px-3 py-2 sm:flex">
            <Search className="h-4 w-4 text-emerald-900/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search premium gifts" className="w-full bg-transparent px-2 text-sm outline-none" />
          </div>
          <button onClick={() => setWishOpen(true)} className="relative rounded-full p-2 hover:bg-[#f5efe3]" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {!!state.wishlist.length && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[#9f7a1d] px-1 text-[10px] text-white">{state.wishlist.length}</span>}
          </button>
          <button onClick={() => setCartOpen(true)} className="relative rounded-full p-2 hover:bg-[#f5efe3]" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {!!state.cart.length && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[#9f7a1d] px-1 text-[10px] text-white">{state.cart.length}</span>}
          </button>
        </div>
        {menuOpen && <div className="grid gap-2 border-t px-4 py-3 text-sm md:hidden"><a href="#shop">Shop</a><a href="#stories">Stories</a><a href="#contact">Contact</a></div>}
      </header>

      <section id="home" className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#fffaf1] px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#9f7a1d]"><Sparkles className="h-3.5 w-3.5" /> Premium Handmade Keepsakes</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">Preserve Emotions in Luxury Personalized Gifts.</h1>
          <p className="mt-4 max-w-xl text-emerald-900/75">From resin art to curated hampers, Gift Aura transforms moments into heirloom-quality memories.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#shop" className="rounded-full bg-[#9f7a1d] px-6 py-3 text-center text-sm font-semibold text-white shadow-glow">Shop Now</a>
            <button onClick={() => setProduct(products[0])} className="rounded-full border border-[#9f7a1d]/40 px-6 py-3 text-sm font-semibold text-[#9f7a1d]">Customize Your Gift</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/20 shadow-xl">
          <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1600&q=80" alt="Luxury personalized gifts" className="h-[420px] w-full object-cover" />
          <div className="absolute left-4 top-4 rounded-full bg-[#9f7a1d] px-3 py-1 text-xs text-white">Only 7 artisan slots left this week</div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-12">
        <SectionTitle title="Best Sellers" subtitle="Elegant handcrafted gifts with premium personalization." />
        <div className="mb-6 grid gap-3 rounded-2xl border border-[#d4af37]/20 bg-white/90 p-4 md:grid-cols-3">
          <label className="text-sm">
            Category
            <div className="relative mt-1">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-[#d4af37]/30 p-2 pr-9 text-sm">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-emerald-900/40" />
            </div>
          </label>
          <label className="text-sm md:col-span-2">
            Max price: ₹{maxPrice}
            <input type="range" min={500} max={6000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#9f7a1d]" />
          </label>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              product={p}
              wished={state.wishlist.includes(p.id)}
              onWish={() => {
                dispatch({ type: 'WISH', payload: p.id });
                toast('Wishlist updated');
              }}
              onQuick={() => {
                dispatch({
                  type: 'ADD_TO_CART',
                  payload: { ...p, cartId: crypto.randomUUID(), quantity: 1, finalPrice: p.price, customization: {} },
                });
                toast('Added to cart');
              }}
              onCustomize={() => setProduct(p)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionTitle title="Why Choose Gift Aura" subtitle="Luxury finishing, trust, and emotional storytelling in one seamless buying journey." />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [Sparkles, 'Handmade Luxury'],
            [CheckCircle2, 'Memory Preservation'],
            [ShieldCheck, 'Secure Checkout'],
            [Truck, 'Fast Premium Delivery'],
          ].map(([Icon, text]) => (
            <div key={text} className="rounded-2xl border border-[#d4af37]/20 bg-white p-5">
              <Icon className="mb-2 h-5 w-5 text-[#9f7a1d]" />
              <p className="font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stories" className="bg-white/60 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <SectionTitle title="Customer Love Stories" subtitle="Real testimonials that strengthen trust and conversion confidence." />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.name} className="rounded-2xl border border-[#d4af37]/20 bg-white p-5">
                <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                <p className="mt-3 font-serif text-lg">{t.name}</p>
                <div className="my-2 flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#d4af37] text-[#d4af37]" />)}</div>
                <p className="text-sm text-emerald-900/75">“{t.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#0f2f2a] px-4 py-12 text-[#f7f2e8]">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl">Gift Aura</p>
            <p className="mt-2 text-sm text-white/80">Turning memories into timeless handmade keepsakes.</p>
          </div>
          <div><p className="text-sm uppercase tracking-[0.15em]">Shop</p><ul className="mt-2 space-y-1 text-sm text-white/85"><li>Resin Art</li><li>Keychains</li><li>Gift Hampers</li></ul></div>
          <div><p className="text-sm uppercase tracking-[0.15em]">Help</p><ul className="mt-2 space-y-1 text-sm text-white/85"><li>Shipping</li><li>FAQs</li><li>Returns</li></ul></div>
          <div>
            <p className="text-sm uppercase tracking-[0.15em]">Newsletter</p>
            <div className="mt-2 flex"><input placeholder="Your email" className="w-full rounded-l-full bg-white/10 px-3 py-2 text-sm outline-none" /><button className="rounded-r-full bg-[#9f7a1d] px-4 text-sm">Join</button></div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg" target="_blank" rel="noreferrer">
        <MessageCircle className="h-4 w-4" /> Chat with us
      </a>

      {product && <ProductModal product={product} onClose={() => setProduct(null)} onAdd={(item) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
        toast('Customized gift added');
      }} />}
      {cartOpen && <Cart onClose={() => setCartOpen(false)} subtotal={subtotal} />}
      {wishOpen && <Wishlist onClose={() => setWishOpen(false)} onSelect={(p) => { setProduct(p); setWishOpen(false); }} />}

      <div className="fixed right-4 top-24 z-[100] space-y-2">{toasts.map((t, i) => <div key={`${t}-${i}`} className="rounded-xl bg-white px-3 py-2 text-xs shadow-lg">{t}</div>)}</div>
    </div>
  );
}

const SectionTitle = memo(({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8 text-center">
    <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
    <p className="mt-2 text-sm text-emerald-900/70">{subtitle}</p>
  </div>
));

const Card = memo(function Card({ product, wished, onWish, onQuick, onCustomize }: { product: Product; wished: boolean; onWish: () => void; onQuick: () => void; onCustomize: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-[#9f7a1d] px-3 py-1 text-[10px] font-semibold uppercase text-white">{product.badge}</span>}
        <button onClick={onWish} className="absolute right-3 top-3 rounded-full bg-white/95 p-2" aria-label="wishlist"><Heart className={`h-4 w-4 ${wished ? 'fill-red-500 text-red-500' : ''}`} /></button>
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9f7a1d]">{product.category}</p>
        <h3 className="mt-2 font-serif text-xl">{product.name}</h3>
        <p className="mt-2 text-sm text-emerald-900/70">{product.description}</p>
        <div className="mt-3 flex items-center gap-2 text-xs"><Star className="h-4 w-4 fill-[#d4af37] text-[#d4af37]" />{product.rating} ({product.reviews}) <span className="ml-auto text-[#9f7a1d]">{product.slotsLeft} slots left</span></div>
        <div className="mt-4 flex items-center justify-between"><span className="text-2xl font-semibold text-[#9f7a1d]">₹{product.price}</span><div className="flex gap-2"><button onClick={onQuick} className="rounded-full border border-[#d4af37]/40 px-3 py-2 text-xs">Quick Add</button><button onClick={onCustomize} className="rounded-full bg-[#9f7a1d] px-3 py-2 text-xs font-semibold text-white">Customize</button></div></div>
      </div>
    </article>
  );
});

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (item: CartItem) => void }) {
  const [active, setActive] = useState(product.gallery[0]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [uploadPreview, setUploadPreview] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const extra = (form['Gift Wrap'] === 'Luxury' ? 199 : 0) + (uploadPreview ? 149 : 0);

  const add = () => {
    onAdd({ ...product, cartId: crypto.randomUUID(), quantity: 1, finalPrice: product.price + extra, customization: form, uploadPreview });
    onClose();
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-3" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b bg-white/95 p-4"><h3 className="font-serif text-2xl">{product.name}</h3><button onClick={onClose}><X /></button></div>
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <img src={active} alt={product.name} className="h-72 w-full rounded-2xl object-cover" />
            <div className="mt-3 grid grid-cols-3 gap-2">{product.gallery.map((g) => <button key={g} onClick={() => setActive(g)} className="overflow-hidden rounded-lg border"><img src={g} alt="thumb" className="h-16 w-full object-cover" /></button>)}</div>
          </div>
          <div>
            <p className="text-sm text-emerald-900/75">{product.details}</p>
            <p className="mt-2 rounded-lg bg-[#fff7e9] px-3 py-2 text-xs text-[#9f7a1d]">Only {product.slotsLeft} slots left • Ships in {product.shipDays}</p>
            <div className="mt-4 space-y-3">
              {product.customizable.map((field) => <label key={field} className="block text-sm"><span className="mb-1 block">{field}</span><input className="w-full rounded-xl border border-[#d4af37]/30 px-3 py-2" onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))} /></label>)}
              <label className="block text-sm"><span className="mb-1 block">Gift Wrap</span><select onChange={(e) => setForm((p) => ({ ...p, 'Gift Wrap': e.target.value }))} className="w-full rounded-xl border border-[#d4af37]/30 px-3 py-2"><option>Standard</option><option>Luxury</option></select></label>
              <label className="block text-sm"><span className="mb-1 block">Accent Color</span><input type="color" className="h-11 w-full rounded-xl border border-[#d4af37]/30" onChange={(e) => setForm((p) => ({ ...p, Color: e.target.value }))} /></label>
              <label
                onDragOver={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
                className={`block cursor-pointer rounded-xl border-2 border-dashed p-4 text-center text-sm ${dragging ? 'border-[#9f7a1d] bg-[#fff7e9]' : 'border-[#d4af37]/35'}`}
              >
                <ImagePlus className="mx-auto mb-2 h-5 w-5" /> Upload image / drag-drop
                <input type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => onFile(e.target.files?.[0])} />
                {uploadPreview && <img src={uploadPreview} alt="preview" className="mx-auto mt-3 h-20 w-20 rounded-lg object-cover" />}
              </label>
              <div className="rounded-xl bg-[#faf6ef] p-3 text-sm"><p>Base: ₹{product.price}</p><p>Add-ons: ₹{extra}</p><p className="font-semibold text-[#9f7a1d]">Total: ₹{product.price + extra}</p></div>
            </div>
            <button onClick={add} className="mt-4 w-full rounded-full bg-[#9f7a1d] px-6 py-3 font-semibold text-white">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cart({ onClose, subtotal }: { onClose: () => void; subtotal: number }) {
  const { state, dispatch } = useStore();
  const shipping = subtotal > 2999 ? 0 : 149;
  return (
    <div className="fixed inset-0 z-[75] flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <aside className="w-full max-w-md bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between border-b pb-3"><h3 className="font-serif text-2xl">Your Cart</h3><button onClick={onClose}><X /></button></div>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto">
          {!state.cart.length ? <p className="py-10 text-center text-sm text-emerald-900/70">Cart is empty.</p> : state.cart.map((item) => (
            <div key={item.cartId} className="rounded-xl border border-[#d4af37]/20 p-3">
              <div className="flex justify-between gap-3"><p className="font-medium">{item.name}</p><button onClick={() => dispatch({ type: 'REMOVE_CART', payload: item.cartId })}><X className="h-4 w-4" /></button></div>
              <p className="text-xs text-emerald-900/70">₹{item.finalPrice} x {item.quantity}</p>
              <div className="mt-2 flex items-center gap-2"><button className="rounded border px-2" onClick={() => dispatch({ type: 'QTY', payload: { cartId: item.cartId, qty: item.quantity - 1 } })}>-</button><span>{item.quantity}</span><button className="rounded border px-2" onClick={() => dispatch({ type: 'QTY', payload: { cartId: item.cartId, qty: item.quantity + 1 } })}>+</button></div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#faf6ef] p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping ? `₹${shipping}` : 'Free'}</span></div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>₹{subtotal + shipping}</span></div>
          <button className="mt-3 w-full rounded-full bg-[#9f7a1d] py-3 text-white">Pay with Razorpay / Stripe (placeholder)</button>
        </div>
      </aside>
    </div>
  );
}

function Wishlist({ onClose, onSelect }: { onClose: () => void; onSelect: (p: Product) => void }) {
  const { state } = useStore();
  const list = products.filter((p) => state.wishlist.includes(p.id));
  return (
    <div className="fixed inset-0 z-[73] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-serif text-2xl">Wishlist</h3><button onClick={onClose}><X /></button></div>
        {!list.length ? <p className="text-sm">No saved gifts yet.</p> : <div className="grid gap-3 sm:grid-cols-2">{list.map((p) => <button key={p.id} className="flex items-center gap-3 rounded-xl border p-3 text-left" onClick={() => onSelect(p)}><img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" /><span><span className="block font-medium">{p.name}</span><span className="text-xs text-emerald-900/70">Customize now</span></span></button>)}</div>}
      </div>
    </div>
  );
}
