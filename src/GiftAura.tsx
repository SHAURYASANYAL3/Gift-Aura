import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: "Resin Art" | "Personalized Keychains" | "Personalized Bangles" | "Curated Gift Hampers" | "Personalized Photo Frames";
  price: number;
  image: string;
  gallery: string[];
  description: string;
  details: string;
  customizable: string[];
  rating: number;
  reviews: number;
  tags: string[];
  isLimited?: boolean;
  bestseller?: boolean;
};

type Occasion = { name: string; emoji: string; subtitle: string };

type CartItem = {
  cartId: string;
  product: Product;
  quantity: number;
  finalPrice: number;
  customization: Record<string, string>;
  uploadPreview?: string;
};

type Toast = {
  id: number;
  title: string;
  message: string;
};

type StoreState = {
  cart: CartItem[];
  wishlist: number[];
  toasts: Toast[];
};

type Action =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { cartId: string; delta: number } }
  | { type: "TOGGLE_WISHLIST"; payload: number }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: number };

const productData: Product[] = [
  {
    id: 1,
    name: "Eternal Bloom Resin Art",
    category: "Resin Art",
    price: 2499,
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Preserve real flowers in crystal-clear resin with a custom name embed.",
    details: "Handcrafted with UV-resistant resin and real preserved petals, designed to turn intimate moments into a forever keepsake.",
    customizable: ["Name/Date Embed", "Flower Choice", "Base Color"],
    rating: 4.9,
    reviews: 342,
    tags: ["anniversary", "wedding", "memory"],
    bestseller: true,
  },
  {
    id: 2,
    name: "Couples Portrait Resin",
    category: "Resin Art",
    price: 3499,
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Hand-painted portraits embedded in resin for proposals and anniversaries.",
    details: "Your couple photo is artistically interpreted and sealed in museum-grade resin with premium finishing edges.",
    customizable: ["Photo Upload", "Background Style", "Frame Color"],
    rating: 4.95,
    reviews: 287,
    tags: ["proposal", "anniversary", "luxury"],
    bestseller: true,
  },
  {
    id: 3,
    name: "Personalized Keychain Soul",
    category: "Personalized Keychains",
    price: 599,
    image: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Minimal resin keychains with names, initials, or birthdates.",
    details: "Compact, modern and emotional: keeps your person close, every day.",
    customizable: ["Text/Initials", "Color", "Shape"],
    rating: 4.8,
    reviews: 891,
    tags: ["birthday", "friendship", "everyday"],
  },
  {
    id: 4,
    name: "Signature Bangle - Personalized",
    category: "Personalized Bangles",
    price: 1299,
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617038191038-2bf0e6ba1ee6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1603974372035-96f65f7c7f8e?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Hand-stamped bangles with your date, name, or meaningful quote.",
    details: "Refined handcrafted finish in gold/silver shades with careful personalization details.",
    customizable: ["Text", "Metal Type", "Font Style"],
    rating: 4.85,
    reviews: 564,
    tags: ["birthday", "wedding", "self-love"],
  },
  {
    id: 5,
    name: "Memory Frame - Golden Hours",
    category: "Personalized Photo Frames",
    price: 1899,
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616627601291-0493560e5f89?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Custom wooden photo frames with engraved names and premium detailing.",
    details: "Sustainable wood base and hand-finished engraving for timeless shelf-worthy moments.",
    customizable: ["Photo Upload (1-4)", "Engraving Text", "Wood Finish"],
    rating: 4.88,
    reviews: 423,
    tags: ["baby", "family", "anniversary"],
  },
  {
    id: 6,
    name: "Luxury Gift Hamper - Love Edition",
    category: "Curated Gift Hampers",
    price: 4999,
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1619994403073-2cec25d2f8ea?auto=format&fit=crop&w=900&q=80",
    ],
    description: "Curated luxury hamper with resin art, candles, chocolates, and note.",
    details: "Signature premium hamper, hand-packed with emotional storytelling and personalized touches.",
    customizable: ["Resin Design", "Color Theme", "Personal Message"],
    rating: 4.92,
    reviews: 198,
    tags: ["wedding", "premium", "corporate"],
    isLimited: true,
    bestseller: true,
  },
];

const testimonials = [
  {
    name: "Priya & Arjun",
    occasion: "Proposal Gift",
    quote: "She said yes! The resin portrait made the moment unforgettable.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Anaya",
    occasion: "Anniversary Gift",
    quote: "Every detail feels couture. It is my favorite memory on display.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Rahul",
    occasion: "Birthday Surprise",
    quote: "Premium quality, emotional impact, and great craftsmanship.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

const occasions: Occasion[] = [
  { name: "Anniversary", emoji: "💐", subtitle: "Celebrate forever" },
  { name: "Birthday", emoji: "🎂", subtitle: "Moments that sparkle" },
  { name: "Wedding", emoji: "💍", subtitle: "Handcrafted elegance" },
  { name: "Baby", emoji: "🍼", subtitle: "First memory keepsakes" },
  { name: "Proposal", emoji: "✨", subtitle: "Say it beautifully" },
  { name: "Festive", emoji: "🎁", subtitle: "Luxury gifting" },
];

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  toasts: [],
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "ADD_TO_CART":
      return { ...state, cart: [...state.cart, action.payload] };
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((item) => item.cartId !== action.payload) };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.cartId === action.payload.cartId
              ? { ...item, quantity: Math.max(1, item.quantity + action.payload.delta) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "TOGGLE_WISHLIST":
      return state.wishlist.includes(action.payload)
        ? { ...state, wishlist: state.wishlist.filter((id) => id !== action.payload) }
        : { ...state, wishlist: [...state.wishlist, action.payload] };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.payload) };
    default:
      return state;
  }
}

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-10 text-center">
    <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-4 py-1 text-xs tracking-[0.2em] text-emerald-900/70 uppercase">
      <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Gift Aura
    </p>
    <h2 className="font-serif text-3xl font-semibold text-emerald-950 sm:text-4xl">{title}</h2>
    {subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm text-emerald-900/70 sm:text-base">{subtitle}</p>}
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
    <div className="h-44 rounded-2xl bg-emerald-100/50" />
    <div className="mt-4 h-4 w-1/3 rounded bg-emerald-100/70" />
    <div className="mt-2 h-6 w-2/3 rounded bg-emerald-100/70" />
    <div className="mt-3 h-4 w-full rounded bg-emerald-100/70" />
  </div>
);

const ProductCard = memo(function ProductCard({
  product,
  onOpen,
  onAdd,
  isWished,
  onWish,
}: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  isWished: boolean;
  onWish: (id: number) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white/80 shadow-lg shadow-[#D4AF37]/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden">
        <img src={product.image} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.bestseller && <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold text-white">Bestseller</span>}
          {product.isLimited && <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Limited</span>}
        </div>
        <button
          aria-label="Add to wishlist"
          onClick={() => onWish(product.id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-emerald-900 shadow transition hover:scale-105"
        >
          <Heart className={`h-4 w-4 ${isWished ? "fill-rose-500 text-rose-500" : "text-emerald-900"}`} />
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-900/55">{product.category}</p>
        <h3 className="mt-1 font-serif text-xl text-emerald-950">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-emerald-900/65">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-semibold text-[#B78F1E]">{formatINR(product.price)}</p>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-xs text-emerald-900/70">{product.rating.toFixed(1)} ({product.reviews})</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpen(product)}
            className="rounded-xl border border-emerald-900/20 px-3 py-2 text-sm font-medium text-emerald-900 transition hover:bg-emerald-900 hover:text-white"
          >
            Quick View
          </button>
          <button
            onClick={() => onAdd(product)}
            className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B78F1E] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Quick Add
          </button>
        </div>
      </div>
    </article>
  );
});

export default function GiftAura() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState(5000);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [customOnly, setCustomOnly] = useState(false);
  const [customForm, setCustomForm] = useState<Record<string, string>>({});
  const [uploadPreview, setUploadPreview] = useState<string>("");

  const shopRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = useCallback((title: string, message: string) => {
    const id = Date.now();
    dispatch({ type: "ADD_TOAST", payload: { id, title, message } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: id }), 2500);
  }, []);

  const filteredProducts = useMemo(() => {
    return productData.filter((product) => {
      const inSearch = `${product.name} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const inPrice = product.price <= priceFilter;
      const inCategory = categoryFilter === "All" || product.category === categoryFilter;
      const inCustom = !customOnly || product.customizable.length > 0;
      return inSearch && inPrice && inCategory && inCustom;
    });
  }, [search, priceFilter, categoryFilter, customOnly]);

  const wishlistProducts = useMemo(
    () => productData.filter((product) => state.wishlist.includes(product.id)),
    [state.wishlist],
  );

  const subtotal = useMemo(() => state.cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0), [state.cart]);
  const shipping = subtotal > 2999 ? 0 : 149;

  const dynamicPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const engraving = customForm.engraving?.trim() ? 149 : 0;
    const premiumColor = customForm.color && customForm.color !== "Classic Gold" ? 99 : 0;
    const rush = customForm.rush === "yes" ? 299 : 0;
    return selectedProduct.price + engraving + premiumColor + rush;
  }, [customForm, selectedProduct]);

  const addProductToCart = useCallback(
    (product: Product, withModalData?: boolean) => {
      const item: CartItem = {
        cartId: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        finalPrice: withModalData ? dynamicPrice : product.price,
        customization: withModalData ? customForm : {},
        uploadPreview: withModalData ? uploadPreview : undefined,
      };
      dispatch({ type: "ADD_TO_CART", payload: item });
      showToast("Added to Cart", `${product.name} is ready to be handcrafted ✨`);
      setIsCartOpen(true);
      if (withModalData) {
        setSelectedProduct(null);
        setCustomForm({});
        setUploadPreview("");
      }
    },
    [customForm, dynamicPrice, showToast, uploadPreview],
  );

  const onFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    onFileUpload(e.dataTransfer.files[0]);
  };

  const navBg = scrollY > 40 ? "bg-[#FCF7EE]/85 backdrop-blur-xl border-b border-[#D4AF37]/20" : "bg-transparent";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-[#FBF5EE] to-[#F6EFE7] text-emerald-950">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navBg}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6" aria-label="Main navigation">
          <button className="font-serif text-2xl tracking-wide text-emerald-950">Gift <span className="text-[#B78F1E]">Aura</span></button>

          <div className="hidden items-center gap-7 text-sm text-emerald-900/80 md:flex">
            {[
              ["Home", "#home"],
              ["Shop", "#shop"],
              ["Why Us", "#why"],
              ["Stories", "#stories"],
              ["Contact", "#contact"],
            ].map(([name, href]) => (
              <a key={name} href={href} className="transition hover:text-[#B78F1E]">{name}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button aria-label="Open wishlist" onClick={() => setShowWishlist(true)} className="relative rounded-full p-2 hover:bg-emerald-900/5">
              <Heart className="h-5 w-5" />
              {state.wishlist.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#D4AF37] px-1.5 text-[10px] text-white">{state.wishlist.length}</span>}
            </button>
            <button aria-label="Open cart" onClick={() => setIsCartOpen(true)} className="relative rounded-full p-2 hover:bg-emerald-900/5">
              <ShoppingCart className="h-5 w-5" />
              {state.cart.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#D4AF37] px-1.5 text-[10px] text-white">{state.cart.length}</span>}
            </button>
            <button className="rounded-full p-2 md:hidden" onClick={() => setMobileMenuOpen((s) => !s)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
          <div className="border-t border-emerald-900/10 bg-[#FCF7EE] px-4 pb-4 pt-2 md:hidden">
            {[
              ["Shop", "#shop"],
              ["Why Us", "#why"],
              ["Stories", "#stories"],
            ].map(([name, href]) => (
              <a key={name} href={href} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-emerald-900/80">{name}</a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section id="home" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80" alt="Gift unboxing moment" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/65 to-black/45" />
          </div>

          <div className="relative mx-auto max-w-6xl py-16 text-left text-white md:py-24">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs tracking-[0.2em] uppercase">
              Premium Handmade Personalized Gifts
            </p>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              Turn your most emotional moments into heirloom-worthy keepsakes.
            </h1>
            <p className="mt-5 max-w-2xl text-sm text-white/90 sm:text-lg">
              Gift Aura preserves love stories with handcrafted resin art, bespoke keychains, signature bangles, curated hampers, and memory frames.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B78F1E] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[#D4AF37]/30 transition hover:scale-[1.02]"
              >
                Shop Now
              </button>
              <button
                onClick={() => setSelectedProduct(productData[0])}
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
              >
                Customize Your Gift
              </button>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-sm text-white/80"><ChevronDown className="h-4 w-4 animate-bounce" /> Scroll to explore</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-label="Search and filters">
          <div className="grid gap-3 rounded-3xl border border-[#D4AF37]/20 bg-white/75 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-900/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gifts, occasion, category..." className="w-full rounded-xl border border-emerald-900/15 bg-white pl-9 pr-3 py-3 text-sm outline-none ring-[#D4AF37] focus:ring" />
            </label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-emerald-900/15 bg-white px-3 py-3 text-sm outline-none ring-[#D4AF37] focus:ring">
              <option>All</option>
              {[...new Set(productData.map((p) => p.category))].map((category) => <option key={category}>{category}</option>)}
            </select>
            <label className="space-y-1">
              <span className="text-xs text-emerald-900/65">Max price: {formatINR(priceFilter)}</span>
              <input type="range" min={500} max={5000} step={100} value={priceFilter} onChange={(e) => setPriceFilter(Number(e.target.value))} className="w-full accent-[#B78F1E]" />
            </label>
            <button onClick={() => setCustomOnly((s) => !s)} className={`rounded-xl px-3 py-3 text-sm font-medium transition ${customOnly ? "bg-emerald-900 text-white" : "border border-emerald-900/15 bg-white"}`}>
              Customizable Only
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Curated Collections" subtitle="Crafted for emotional gifting moments with premium textures and timeless style." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Resin Art", image: productData[0].image, text: "Eternal florals & portraits" },
              { title: "Keychains", image: productData[2].image, text: "Tiny keepsakes, huge emotions" },
              { title: "Gift Hampers", image: productData[5].image, text: "Luxury curation with custom stories" },
            ].map((cat) => (
              <article key={cat.title} className="group relative overflow-hidden rounded-3xl">
                <img src={cat.image} alt={cat.title} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-serif text-2xl">{cat.title}</h3>
                  <p className="text-sm text-white/85">{cat.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="shop" ref={shopRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Best Sellers" subtitle="Loved by thousands, now tailored to your story." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {!loaded
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWished={state.wishlist.includes(product.id)}
                    onWish={(id) => {
                      dispatch({ type: "TOGGLE_WISHLIST", payload: id });
                      showToast("Wishlist Updated", state.wishlist.includes(id) ? "Removed from wishlist" : "Saved for later 💛");
                    }}
                    onOpen={(p) => {
                      setSelectedProduct(p);
                      setActiveImage(0);
                    }}
                    onAdd={(p) => addProductToCart(p)}
                  />
                ))}
          </div>
        </section>

        <section id="why" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Why Choose Gift Aura" subtitle="Premium trust signals that reduce hesitation and improve conversion." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Handmade in Small Batches", "Every gift is artisan-crafted for exclusivity.", <BadgeCheck className="h-5 w-5" />],
              ["Memory Preservation", "Advanced resin quality keeps stories vivid for years.", <Sparkles className="h-5 w-5" />],
              ["Secure Checkout", "Razorpay/Stripe-ready architecture for safe payments.", <ShieldCheck className="h-5 w-5" />],
            ].map(([title, text, icon]) => (
              <article key={String(title)} className="rounded-3xl border border-[#D4AF37]/20 bg-white/75 p-6 shadow-sm">
                <div className="mb-3 inline-flex rounded-xl bg-[#D4AF37]/15 p-2 text-[#B78F1E]">{icon as ReactNode}</div>
                <h3 className="font-serif text-xl text-emerald-950">{title}</h3>
                <p className="mt-2 text-sm text-emerald-900/70">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Shop by Occasion" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {occasions.map((occasion) => (
              <button key={occasion.name} className="rounded-2xl border border-emerald-900/10 bg-white/70 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-2xl">{occasion.emoji}</p>
                <p className="mt-2 font-serif text-lg">{occasion.name}</p>
                <p className="text-sm text-emerald-900/65">{occasion.subtitle}</p>
              </button>
            ))}
          </div>
        </section>

        <section id="stories" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Customer Love Stories" subtitle="Social proof with emotional trust cues." />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-3xl border border-[#D4AF37]/15 bg-white/80 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <img src={item.avatar} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-emerald-950">{item.name}</p>
                    <p className="text-xs text-emerald-900/60">{item.occasion}</p>
                  </div>
                </div>
                <div className="mb-3 flex text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm text-emerald-900/75">“{item.quote}”</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm md:p-10">
            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
              <div>
                <h3 className="font-serif text-3xl text-emerald-950">Receive memory-rich gifting ideas every week.</h3>
                <p className="mt-3 text-sm text-emerald-900/70">Join our luxury gifting journal for occasion reminders, exclusive launches, and private offers.</p>
              </div>
              <form className="flex gap-2">
                <input type="email" required placeholder="Your email" className="w-full rounded-xl border border-emerald-900/20 bg-white px-4 py-3 text-sm outline-none ring-[#D4AF37] focus:ring" />
                <button className="rounded-xl bg-emerald-950 px-4 py-3 text-white"><ArrowRight className="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-emerald-900/10 bg-emerald-950 px-4 py-12 text-[#F8F2E8] sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <h4 className="font-serif text-2xl">Gift Aura</h4>
            <p className="mt-3 text-sm text-[#F8F2E8]/70">Preserving precious memories in premium handmade resin and personalized gifting.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-[#F8F2E8]/80">
              <li><a href="#shop">All Products</a></li>
              <li><a href="#shop">Custom Orders</a></li>
              <li><a href="#shop">Gift Hampers</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-[#F8F2E8]/80">
              <li>Shipping in 3–5 days</li>
              <li>Secure Checkout</li>
              <li>WhatsApp Concierge</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Trust Badges</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[
                "100% Handmade",
                "Memory Preservation",
                "Secure Payment",
                "Premium Packaging",
              ].map((badge) => (
                <span key={badge} className="rounded-full border border-white/20 px-3 py-1 text-[#F8F2E8]/85">{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105" aria-label="Chat on WhatsApp">
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat with us</span>
      </a>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:p-6" onClick={() => setSelectedProduct(null)}>
          <div className="max-h-[95vh] w-full overflow-auto rounded-t-3xl bg-[#FFFDF8] p-5 sm:mx-auto sm:max-w-5xl sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-emerald-950">{selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} aria-label="Close product modal"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10">
                  <img src={selectedProduct.gallery[activeImage]} alt={selectedProduct.name} className="h-72 w-full object-cover transition duration-300 hover:scale-105" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {selectedProduct.gallery.map((img, i) => (
                    <button key={img} onClick={() => setActiveImage(i)} className={`overflow-hidden rounded-xl border ${i === activeImage ? "border-[#B78F1E]" : "border-emerald-900/10"}`}>
                      <img src={img} alt={`Thumbnail ${i + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-emerald-900/75">{selectedProduct.details}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">Only 7 slots left this week</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">Ships in 3–5 days</span>
                </div>

                <div className="mt-6 space-y-4 rounded-2xl border border-[#D4AF37]/20 bg-white p-4">
                  <label className="block text-sm font-medium">Name / Message</label>
                  <input value={customForm.message || ""} onChange={(e) => setCustomForm((s) => ({ ...s, message: e.target.value }))} placeholder="For example: Always You & Me" className="w-full rounded-xl border border-emerald-900/20 px-3 py-2 text-sm outline-none ring-[#D4AF37] focus:ring" />

                  <label className="block text-sm font-medium">Color Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {["Classic Gold", "Emerald Luxe", "Blush Pearl"].map((color) => (
                      <button key={color} onClick={() => setCustomForm((s) => ({ ...s, color }))} className={`rounded-full border px-3 py-1 text-xs ${customForm.color === color ? "border-[#B78F1E] bg-[#D4AF37]/15" : "border-emerald-900/20"}`}>
                        {color}
                      </button>
                    ))}
                  </div>

                  <label className="block text-sm font-medium">Rush Crafting</label>
                  <select value={customForm.rush || "no"} onChange={(e) => setCustomForm((s) => ({ ...s, rush: e.target.value }))} className="w-full rounded-xl border border-emerald-900/20 px-3 py-2 text-sm">
                    <option value="no">Standard timeline</option>
                    <option value="yes">Yes, prioritize my order (+₹299)</option>
                  </select>

                  <label onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-900/20 bg-emerald-50/40 p-4 text-center text-xs text-emerald-900/70">
                    <Upload className="mb-2 h-4 w-4" />
                    Drag & drop your photo or click to upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e.target.files?.[0])} />
                  </label>
                  {uploadPreview && <img src={uploadPreview} alt="Upload preview" className="h-24 w-24 rounded-lg object-cover" />}

                  <p className="text-xs text-emerald-900/65">Live Preview: <span className="font-medium text-[#B78F1E]">“{customForm.message || "Your message here"}”</span></p>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-emerald-900/60">Dynamic price</p>
                    <p className="text-2xl font-semibold text-[#B78F1E]">{formatINR(dynamicPrice)}</p>
                  </div>
                  <button onClick={() => addProductToCart(selectedProduct, true)} className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B78F1E] px-5 py-3 text-sm font-semibold text-white">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-emerald-900/10 p-4">
            <h3 className="font-serif text-2xl">Your Cart</h3>
            <button onClick={() => setIsCartOpen(false)} aria-label="Close cart"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {state.cart.length === 0 ? (
              <p className="rounded-2xl bg-emerald-50 p-6 text-center text-sm text-emerald-900/65">Your cart is empty. Craft a heartfelt gift ✨</p>
            ) : (
              state.cart.map((item) => (
                <article key={item.cartId} className="rounded-2xl border border-emerald-900/10 p-3">
                  <div className="flex gap-3">
                    <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-emerald-900/60">{formatINR(item.finalPrice)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { cartId: item.cartId, delta: -1 } })} className="rounded p-1 hover:bg-emerald-900/5"><Minus className="h-4 w-4" /></button>
                        <span className="text-sm">{item.quantity}</span>
                        <button onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { cartId: item.cartId, delta: 1 } })} className="rounded p-1 hover:bg-emerald-900/5"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.cartId })}><Trash2 className="h-4 w-4 text-rose-500" /></button>
                      <button onClick={() => dispatch({ type: "TOGGLE_WISHLIST", payload: item.product.id })} className="text-xs text-emerald-900/65">Move to wishlist</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="border-t border-emerald-900/10 p-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatINR(subtotal + shipping)}</span></div>
            </div>
            <button className="mt-4 w-full rounded-xl bg-emerald-950 py-3 text-white">Proceed to Checkout (Razorpay / Stripe)</button>
            <p className="mt-2 text-xs text-emerald-900/60">Payment gateway integration hook point: call backend `/api/create-order` before redirect.</p>
          </div>
        </div>
      </aside>
      {isCartOpen && <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-40 bg-black/35" />}

      {showWishlist && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={() => setShowWishlist(false)}>
          <div className="mx-auto max-h-[90vh] max-w-xl overflow-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-serif text-2xl">Your Wishlist</h3><button onClick={() => setShowWishlist(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              {wishlistProducts.length === 0 ? <p className="text-sm text-emerald-900/65">No saved gifts yet.</p> : wishlistProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl border border-emerald-900/10 p-2">
                  <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1"><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-[#B78F1E]">{formatINR(product.price)}</p></div>
                  <button onClick={() => addProductToCart(product)} className="rounded-lg bg-emerald-950 px-3 py-2 text-xs text-white">Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-4 top-20 z-[60] space-y-2">
        {state.toasts.map((toast) => (
          <div key={toast.id} className="w-72 rounded-xl border border-[#D4AF37]/20 bg-white p-3 shadow-xl">
            <p className="text-sm font-semibold text-emerald-950">{toast.title}</p>
            <p className="text-xs text-emerald-900/65">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
