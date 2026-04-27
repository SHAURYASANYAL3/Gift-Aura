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
} from "react";
import {
  BadgeCheck,
  Check,
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
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  images: string[];
  description: string;
  details: string;
  customizable: string[];
  rating: number;
  reviews: number;
  badge?: "Bestseller" | "Limited";
  slotsLeft: number;
  eta: string;
};

type CartItem = Product & {
  cartId: string;
  quantity: number;
  finalPrice: number;
  customization: Record<string, string>;
  previewImage?: string;
};

type UIState = {
  cart: CartItem[];
  wishlist: number[];
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  mobileMenuOpen: boolean;
  toasts: { id: string; message: string }[];
};

type UIAction =
  | { type: "TOGGLE_CART" }
  | { type: "TOGGLE_WISHLIST" }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "OPEN_PRODUCT"; payload: Product }
  | { type: "CLOSE_PRODUCT" }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "SET_QTY"; payload: { cartId: string; delta: number } }
  | { type: "TOGGLE_WISHLIST_ITEM"; payload: number }
  | { type: "ADD_TOAST"; payload: string }
  | { type: "REMOVE_TOAST"; payload: string };

const products: Product[] = [
  {
    id: 1,
    name: "Eternal Bloom Resin Art",
    category: "Resin Art",
    price: 2499,
    images: ["🌸", "🌷", "💐"],
    description: "Preserve real flowers in crystal-clear resin with custom name embed.",
    details:
      "Lab-preserved flowers suspended in premium UV-resistant resin, handcrafted for your most meaningful dates.",
    customizable: ["Name/Date Embed", "Flower Choice", "Base Color"],
    rating: 4.9,
    reviews: 342,
    badge: "Bestseller",
    slotsLeft: 7,
    eta: "Ships in 3–5 days",
  },
  {
    id: 2,
    name: "Couples Portrait Resin",
    category: "Resin Art",
    price: 3499,
    images: ["👫", "🫶", "🌟"],
    description: "Hand-painted portrait embedded in premium resin.",
    details:
      "Your photo gets painted by our in-house artists and sealed inside museum-grade resin for a luxurious keepsake.",
    customizable: ["Photo Upload", "Background Style", "Frame Color"],
    rating: 4.95,
    reviews: 287,
    badge: "Limited",
    slotsLeft: 5,
    eta: "Ships in 4–6 days",
  },
  {
    id: 3,
    name: "Personalized Keychain Soul",
    category: "Personalized Keychains",
    price: 599,
    images: ["🔑", "💫", "🧿"],
    description: "Minimal resin keychains with initials and date.",
    details: "Pocket-sized keepsake crafted with elegant finish and custom text.",
    customizable: ["Text/Initials", "Color", "Shape"],
    rating: 4.8,
    reviews: 891,
    badge: "Bestseller",
    slotsLeft: 14,
    eta: "Ships in 2–4 days",
  },
  {
    id: 4,
    name: "Signature Bangle - Personalized",
    category: "Personalized Bangles",
    price: 1299,
    images: ["💍", "✨", "🪄"],
    description: "Hand-stamped bangle with your quote/date.",
    details: "Available in multiple font and finish options for timeless elegance.",
    customizable: ["Text", "Metal Type", "Font Style"],
    rating: 4.85,
    reviews: 564,
    slotsLeft: 9,
    eta: "Ships in 3–5 days",
  },
  {
    id: 5,
    name: "Memory Frame - Golden Hours",
    category: "Personalized Photo Frames",
    price: 1899,
    images: ["🖼️", "📸", "🤍"],
    description: "Custom wooden frame with engraved names.",
    details:
      "Sustainably sourced wood and hand-engraved finishing, crafted to preserve your photographs beautifully.",
    customizable: ["Photo Upload (1-4)", "Engraving Text", "Wood Finish"],
    rating: 4.88,
    reviews: 423,
    slotsLeft: 12,
    eta: "Ships in 4–7 days",
  },
  {
    id: 6,
    name: "Luxury Gift Hamper - Love Edition",
    category: "Curated Gift Hampers",
    price: 4999,
    images: ["🎁", "🍫", "🕯️"],
    description: "Curated luxury hamper with premium personalized add-ons.",
    details:
      "Includes artisanal goodies, resin keepsake, handwritten note, and premium packaging for unforgettable gifting.",
    customizable: ["Resin Design", "Color Theme", "Personal Message"],
    rating: 4.92,
    reviews: 198,
    badge: "Limited",
    slotsLeft: 4,
    eta: "Ships in 5–7 days",
  },
];

const testimonials = [
  {
    name: "Priya & Arjun",
    occasion: "Proposal Gift",
    quote: "She cried happy tears. It felt deeply personal and truly premium.",
    avatar: "👰",
  },
  {
    name: "Anaya",
    occasion: "Anniversary",
    quote: "The craftsmanship is exceptional. Every detail feels intentional.",
    avatar: "💐",
  },
  {
    name: "Rahul",
    occasion: "Birthday",
    quote: "Fast response, beautiful finish, and luxury packaging. Loved it.",
    avatar: "🎂",
  },
];

const formatINR = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const initialState: UIState = {
  cart: [],
  wishlist: [],
  selectedProduct: null,
  isCartOpen: false,
  isWishlistOpen: false,
  mobileMenuOpen: false,
  toasts: [],
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "TOGGLE_CART":
      return { ...state, isCartOpen: !state.isCartOpen };
    case "TOGGLE_WISHLIST":
      return { ...state, isWishlistOpen: !state.isWishlistOpen };
    case "TOGGLE_MOBILE_MENU":
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    case "OPEN_PRODUCT":
      return { ...state, selectedProduct: action.payload };
    case "CLOSE_PRODUCT":
      return { ...state, selectedProduct: null };
    case "ADD_TO_CART":
      return { ...state, cart: [...state.cart, action.payload], isCartOpen: true };
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((i) => i.cartId !== action.payload) };
    case "SET_QTY":
      return {
        ...state,
        cart: state.cart
          .map((i) =>
            i.cartId === action.payload.cartId
              ? { ...i, quantity: Math.max(1, i.quantity + action.payload.delta) }
              : i,
          )
          .filter(Boolean),
      };
    case "TOGGLE_WISHLIST_ITEM":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    case "ADD_TOAST": {
      const id = `${Date.now()}-${Math.random()}`;
      return { ...state, toasts: [...state.toasts, { id, message: action.payload }] };
    }
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

const UIContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
} | null>(null);

const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside provider");
  return ctx;
};

const ProductCard = memo(function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
}) {
  const { state, dispatch } = useUI();
  const wishlisted = state.wishlist.includes(product.id);

  return (
    <article className="group rounded-3xl border border-emerald-100/70 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative mb-4 h-52 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F9EFE2] via-[#FFF8ED] to-[#E9F3EE]">
        <div className="flex h-full items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110">
          {product.images[0]}
        </div>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-[#F7E7B4]">
            {product.badge}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          onClick={() => {
            dispatch({ type: "TOGGLE_WISHLIST_ITEM", payload: product.id });
            dispatch({ type: "ADD_TOAST", payload: wishlisted ? "Removed from wishlist" : "Added to wishlist" });
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-rose-500"
        >
          <Heart size={16} className={wishlisted ? "fill-current" : ""} />
        </button>
      </div>

      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/70">{product.category}</p>
      <h3 className="mt-2 font-serif text-xl text-emerald-950">{product.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-emerald-950/70">{product.description}</p>
      <div className="mt-3 flex items-center gap-2 text-sm text-amber-500">
        <Star size={14} className="fill-current" /> {product.rating} <span className="text-emerald-800/50">({product.reviews})</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-2xl font-semibold text-[#B58B1A]">₹{formatINR(product.price)}</p>
        <button
          onClick={() => onQuickView(product)}
          className="rounded-full border border-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#7A6020] transition hover:bg-[#FDF5DE]"
        >
          Quick view
        </button>
      </div>
      <p className="mt-3 text-xs font-medium text-rose-700">Only {product.slotsLeft} slots left this week</p>
      <p className="text-xs text-emerald-800/60">{product.eta}</p>
    </article>
  );
});

function Toasts() {
  const { state, dispatch } = useUI();
  useEffect(() => {
    const timers = state.toasts.map((t) =>
      setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: t.id }), 2200),
    );
    return () => timers.forEach(clearTimeout);
  }, [dispatch, state.toasts]);

  return (
    <div className="fixed right-4 top-24 z-[90] space-y-2">
      {state.toasts.map((t) => (
        <div key={t.id} className="rounded-xl bg-emerald-950 px-4 py-3 text-sm text-white shadow-xl">
          {t.message}
        </div>
      ))}
    </div>
  );
}

function ProductModal() {
  const { state, dispatch } = useUI();
  const product = state.selectedProduct;
  const [thumb, setThumb] = useState(0);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const dropRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    setThumb(0);
    setCustom({});
    setUploadPreview("");
  }, [product?.id]);

  if (!product) return null;

  const extraCost = Object.values(custom).filter(Boolean).length * 149 + (uploadPreview ? 199 : 0);
  const finalPrice = product.price + extraCost;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 p-4" onClick={() => dispatch({ type: "CLOSE_PRODUCT" })}>
      <section
        role="dialog"
        aria-modal="true"
        className="mx-auto max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#FFFCF6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-[#FFFCF6]/95 p-5 backdrop-blur">
          <h3 className="font-serif text-2xl text-emerald-950">{product.name}</h3>
          <button aria-label="Close" onClick={() => dispatch({ type: "CLOSE_PRODUCT" })}><X /></button>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F7ECDE] to-[#E8F0EB] text-8xl">
              {product.images[thumb]}
            </div>
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={img + i} onClick={() => setThumb(i)} className={`h-14 w-14 rounded-xl border ${thumb === i ? "border-[#D4AF37]" : "border-emerald-100"}`}>
                  {img}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-emerald-900/70">{product.details}</p>
            <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-sm">
              <p className="font-semibold text-rose-800">Only {product.slotsLeft} artisan slots left this week</p>
              <p className="text-emerald-800/70">{product.eta}</p>
            </div>

            <div className="mt-5 space-y-4 rounded-2xl border border-emerald-100 bg-white p-4">
              <p className="font-semibold text-emerald-950">Customize your gift</p>
              {product.customizable.map((field) => (
                <label key={field} className="block text-sm">
                  <span className="mb-1 block text-emerald-900">{field}</span>
                  <input
                    className="w-full rounded-xl border border-emerald-200 px-3 py-2 outline-none ring-[#D4AF37] focus:ring"
                    placeholder={`Enter ${field.toLowerCase()}`}
                    value={custom[field] ?? ""}
                    onChange={(e) => setCustom((prev) => ({ ...prev, [field]: e.target.value }))}
                  />
                </label>
              ))}
              <label ref={dropRef} className="block cursor-pointer rounded-xl border border-dashed border-[#D4AF37] bg-[#FFF8E8] p-4 text-sm text-center">
                <ImagePlus className="mx-auto mb-1" size={16} />
                Upload memory photo (drag/drop supported)
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              {uploadPreview && (
                <img src={uploadPreview} alt="Customization preview" className="h-24 w-24 rounded-xl object-cover" />
              )}
              <div className="rounded-xl bg-emerald-950 p-4 text-[#FDF1C9]">
                <p className="text-xs uppercase tracking-wide">Live price</p>
                <p className="text-3xl font-semibold">₹{formatINR(finalPrice)}</p>
                <p className="text-xs text-[#F8E8B4]/80">Base ₹{formatINR(product.price)} + custom add-ons</p>
              </div>
              <button
                className="w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B88A16] px-6 py-3 font-semibold text-white"
                onClick={() => {
                  dispatch({
                    type: "ADD_TO_CART",
                    payload: {
                      ...product,
                      cartId: crypto.randomUUID(),
                      quantity: 1,
                      finalPrice,
                      customization: custom,
                      previewImage: uploadPreview,
                    },
                  });
                  dispatch({ type: "CLOSE_PRODUCT" });
                  dispatch({ type: "ADD_TOAST", payload: "Added to cart" });
                }}
              >
                Add to cart • ₹{formatINR(finalPrice)}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CartDrawer() {
  const { state, dispatch } = useUI();
  const subtotal = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
    [state.cart],
  );
  const shipping = subtotal > 2500 ? 0 : 149;

  return (
    <aside className={`fixed inset-0 z-[85] ${state.isCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition ${state.isCartOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => dispatch({ type: "TOGGLE_CART" })}
      />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white transition-transform duration-300 ${state.isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="font-serif text-2xl text-emerald-950">Your Cart</h3>
          <button onClick={() => dispatch({ type: "TOGGLE_CART" })}><X /></button>
        </div>
        <div className="h-[calc(100%-240px)] space-y-4 overflow-y-auto p-5">
          {state.cart.length === 0 ? (
            <p className="rounded-2xl bg-emerald-50 p-4 text-center text-emerald-900/70">Your cart is empty.</p>
          ) : (
            state.cart.map((item) => (
              <div key={item.cartId} className="rounded-2xl border border-emerald-100 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-emerald-950">{item.name}</p>
                    <p className="text-sm text-[#B58B1A]">₹{formatINR(item.finalPrice)}</p>
                  </div>
                  <button onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.cartId })}><X size={16} /></button>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-2 py-1">
                  <button onClick={() => dispatch({ type: "SET_QTY", payload: { cartId: item.cartId, delta: -1 } })}><Minus size={14} /></button>
                  <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => dispatch({ type: "SET_QTY", payload: { cartId: item.cartId, delta: 1 } })}><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 w-full border-t bg-[#FFFDF8] p-5">
          <div className="space-y-1 text-sm text-emerald-900">
            <p className="flex justify-between"><span>Subtotal</span><span>₹{formatINR(subtotal)}</span></p>
            <p className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${formatINR(shipping)}`}</span></p>
            <p className="flex justify-between text-base font-semibold"><span>Total</span><span>₹{formatINR(subtotal + shipping)}</span></p>
          </div>
          <button className="mt-4 w-full rounded-full bg-gradient-to-r from-emerald-900 to-emerald-700 py-3 font-semibold text-white">Pay with Razorpay / Stripe (Placeholder)</button>
          <p className="mt-2 text-xs text-emerald-900/60">Secure checkout structure is ready for payment gateway SDK.</p>
        </div>
      </div>
    </aside>
  );
}

export default function GiftAura() {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState(5000);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const matchesPrice = p.price <= priceFilter;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [search, categoryFilter, priceFilter]);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], []);
  const searchSuggestions = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4), [search]);

  const openProduct = useCallback((p: Product) => dispatch({ type: "OPEN_PRODUCT", payload: p }), [dispatch]);

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gradient-to-b from-[#FFFCF7] via-[#FFF8F3] to-[#F8F2EA] text-emerald-950">
        <header className={`fixed inset-x-0 top-0 z-50 transition-all ${isScrolled ? "border-b border-emerald-100 bg-white/85 backdrop-blur-xl" : "bg-transparent"}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href="#home" className="font-serif text-2xl font-bold tracking-wide"><span className="text-[#D4AF37]">✦</span> Gift Aura</a>
            <nav className="hidden items-center gap-7 text-sm md:flex">
              {[
                ["Home", "home"],
                ["Collections", "collections"],
                ["Best Sellers", "best-sellers"],
                ["Stories", "stories"],
                ["Contact", "contact"],
              ].map(([label, id]) => <a key={id} href={`#${id}`} className="hover:text-[#B88A16]">{label}</a>)}
            </nav>
            <div className="flex items-center gap-2">
              <button aria-label="Open wishlist" onClick={() => dispatch({ type: "TOGGLE_WISHLIST" })} className="relative rounded-full p-2 hover:bg-emerald-50"><Heart size={18} /><span className="absolute -right-1 -top-1 rounded-full bg-[#D4AF37] px-1.5 text-[10px] text-white">{state.wishlist.length}</span></button>
              <button aria-label="Open cart" onClick={() => dispatch({ type: "TOGGLE_CART" })} className="relative rounded-full p-2 hover:bg-emerald-50"><ShoppingCart size={18} /><span className="absolute -right-1 -top-1 rounded-full bg-emerald-900 px-1.5 text-[10px] text-white">{state.cart.length}</span></button>
              <button aria-label="Open menu" onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })} className="rounded-full p-2 hover:bg-emerald-50 md:hidden"><Menu size={18} /></button>
            </div>
          </div>
        </header>

        <main id="home" className="pt-24">
          <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pt-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#FBEFD6,transparent_35%),radial-gradient(circle_at_80%_20%,#EAF2EC,transparent_35%)]" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#9D7720]"><Sparkles size={12} /> handcrafted premium gifting</p>
                <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">Preserve your most precious memories in heirloom gifts.</h1>
                <p className="mt-5 max-w-xl text-emerald-900/70">Warm, luxurious, and deeply personal resin and customized keepsakes designed to make every milestone unforgettable.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#best-sellers" className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B88A16] px-6 py-3 font-semibold text-white">Shop Now</a>
                  <button onClick={() => openProduct(products[0])} className="rounded-full border border-emerald-900/20 px-6 py-3 font-semibold">Customize Your Gift</button>
                </div>
                <p className="mt-8 animate-bounce text-sm text-emerald-900/60">↓ Scroll to explore our collections</p>
              </div>
              <div className="rounded-[2rem] border border-white/60 bg-white/40 p-3 shadow-2xl backdrop-blur">
                <div className="h-[420px] rounded-[1.6rem] bg-gradient-to-br from-[#E3EFE7] via-[#FDF8EA] to-[#F7E8E0] p-6">
                  <p className="text-sm font-medium text-emerald-900/70">Lifestyle Visual Placeholder</p>
                  <div className="mt-10 flex h-64 items-center justify-center rounded-2xl border border-dashed border-emerald-200 text-7xl">🎁</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4" aria-label="Search and filters">
            <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="relative block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800/50" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gifts, categories, styles..." className="w-full rounded-xl border border-emerald-200 py-2 pl-10 pr-3" />
                  {search && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-emerald-100 bg-white p-2 shadow-xl">
                      {searchSuggestions.length ? searchSuggestions.map((s) => <button key={s.id} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-emerald-50" onClick={() => setSearch(s.name)}>{s.name}</button>) : <p className="px-2 py-2 text-sm text-emerald-800/60">No suggestions</p>}
                    </div>
                  )}
                </label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-3 rounded-xl border border-emerald-200 px-3 py-2 text-sm">
                  Max: ₹{formatINR(priceFilter)}
                  <input type="range" min={500} max={6000} step={100} value={priceFilter} onChange={(e) => setPriceFilter(Number(e.target.value))} className="w-full" />
                </label>
              </div>
            </div>
          </section>

          <section id="collections" className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-center font-serif text-4xl">Our Signature Collections</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Resin Art", "🌸", "Eternal blooms and preserved moments"],
                ["Keychains", "🔑", "Carry your memory every day"],
                ["Bangles", "💍", "Wear your story in style"],
              ].map(([name, icon, desc]) => (
                <button key={name} className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="h-44 bg-gradient-to-br from-[#F7ECDF] to-[#E6F0EA] p-5 text-6xl transition group-hover:scale-105">{icon}</div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl">{name}</h3>
                    <p className="mt-2 text-sm text-emerald-900/70">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section id="best-sellers" className="bg-white/60 py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-center font-serif text-4xl">Best Sellers</h2>
              <p className="mt-2 text-center text-emerald-900/60">Loved by thousands, handcrafted for you.</p>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-white" />)
                  : filteredProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={openProduct} />)}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-center font-serif text-4xl">Why Choose Gift Aura</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                [ShieldCheck, "Secure Checkout"],
                [BadgeCheck, "Handmade Luxury"],
                [Truck, "Reliable Delivery"],
                [Sparkles, "Memory Preservation"],
              ].map(([Icon, text]) => (
                <div key={text as string} className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm">
                  <Icon className="mx-auto mb-2 text-[#B88A16]" size={22} />
                  <p className="font-medium">{text as string}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/60 py-16">
            <div className="mx-auto max-w-7xl px-4">
              <h2 className="text-center font-serif text-4xl">Shop by Occasion</h2>
              <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-5">
                {["Anniversary", "Birthday", "Wedding", "Baby Shower", "Proposal"].map((o) => (
                  <button key={o} className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm font-medium transition hover:-translate-y-1 hover:shadow-lg">{o}</button>
                ))}
              </div>
            </div>
          </section>

          <section id="stories" className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-center font-serif text-4xl">Customer Love Stories</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <article key={t.name} className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <p className="text-4xl">{t.avatar}</p>
                  <h3 className="mt-2 font-serif text-2xl">{t.name}</h3>
                  <p className="text-sm text-[#B88A16]">{t.occasion}</p>
                  <div className="mt-3 flex text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-current" />)}</div>
                  <p className="mt-3 text-emerald-900/70">“{t.quote}”</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer id="contact" className="bg-emerald-950 py-14 text-[#F4E8C3]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4">
            <div>
              <h3 className="font-serif text-2xl">Gift Aura</h3>
              <p className="mt-3 text-sm text-[#F4E8C3]/80">Turning moments into premium keepsakes made by hand.</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider">Shop</p>
              <ul className="mt-3 space-y-2 text-sm text-[#F4E8C3]/80"><li>All Products</li><li>Custom Orders</li><li>Gift Hampers</li></ul>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider">Support</p>
              <ul className="mt-3 space-y-2 text-sm text-[#F4E8C3]/80"><li>Shipping</li><li>FAQs</li><li>Returns</li></ul>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider">Newsletter</p>
              <p className="mt-3 text-sm text-[#F4E8C3]/80">Get memory-making gift ideas and early launches.</p>
              <div className="mt-3 flex gap-2"><input className="w-full rounded-full border border-[#F4E8C3]/40 bg-transparent px-3 py-2 text-sm" placeholder="Your email" /><button className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-emerald-950">Join</button></div>
            </div>
          </div>
        </footer>

        <button className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-2xl" aria-label="Chat with us on WhatsApp">
          <MessageCircle size={16} /> Chat with us
        </button>

        <CartDrawer />
        <ProductModal />
        <Toasts />
      </div>
    </UIContext.Provider>
  );
}
