import { useState, useContext, createContext } from "react";
import {
  ShoppingCart, X, Star, ChevronDown, Flame, Leaf, MapPin, Shield,
  LogOut, Package, Plus, Minus, CheckCircle, Calendar, ArrowLeft,
  LayoutDashboard, Users, ShoppingBag, Settings, Edit2, Trash2,
  TrendingUp, Eye, EyeOff, Save, Search,
  ToggleLeft, ToggleRight, Lock
} from "lucide-react";
import { supabase } from './supabaseClient' //comment
// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  red: "#C0392B", redDark: "#922B21", redLight: "#E74C3C",
  maple: "#D35400", mapleLight: "#E67E22",
  cream: "#FDF6EC", white: "#FFFFFF", charcoal: "#2C2C2C",
  warmGray: "#6B5B4E", lightGray: "#F5EDE3", border: "#E8D5C0",
  adminBg: "#0F1117", adminSide: "#161B27", adminCard: "#1E2435",
  adminBorder: "#2A3249", adminAccent: "#D35400",
};

const formatCAD = (n) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
const getMinDate = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; };
const getMaxDate = () => { const d = new Date(); d.setDate(d.getDate()+30); return d.toISOString().split("T")[0]; };
const TAX_RATE = 0.13;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INIT_PRODUCTS = [
  { id: 1, name: "Maple Chipotle Hot Sauce", price: 12.99, category: "Sauces", heat: 3, image: "🌶️", description: "A bold fusion of Canadian maple syrup and smoky chipotle peppers. Perfect for wings, tacos, and grilled meats.", badges: ["Best Seller","Gluten-Free"], stock: 24, active: true },
  { id: 2, name: "Ghost Pepper Maple Glaze", price: 16.99, category: "Sauces", heat: 5, image: "👻", description: "Our hottest creation — ghost peppers balanced with pure Ontario maple. Not for the faint of heart.", badges: ["Limited Run"], stock: 8, active: true },
  { id: 3, name: "Smoky Habanero Salsa", price: 10.99, category: "Salsas", heat: 4, image: "🫙", description: "Fire-roasted habaneros with roasted garlic and fresh tomatoes. Thick, chunky, and unforgettable.", badges: ["Vegan"], stock: 18, active: true },
  { id: 4, name: "Canadian Piri-Piri Blend", price: 14.99, category: "Dry Rubs", heat: 3, image: "✨", description: "Our signature dry rub with a Canadian twist. Ideal for chicken and ribs.", badges: ["Gluten-Free","Vegan"], stock: 30, active: true },
  { id: 5, name: "Smoked Maple BBQ Sauce", price: 13.99, category: "Sauces", heat: 2, image: "🍁", description: "Sweet smoked maple meets tangy vinegar in this crowd-pleasing BBQ sauce.", badges: ["Fan Favourite"], stock: 22, active: true },
  { id: 6, name: "Scorpion Chili Oil", price: 18.99, category: "Oils", heat: 5, image: "🦂", description: "Trinidad moruga scorpion peppers steeped in premium avocado oil with garlic and ginger.", badges: ["Limited Run","Small Batch"], stock: 5, active: true },
];

const INIT_ORDERS = [
  { id: "ORD-2847", userId: "u1", customer: "priya@gmail.com", date: "2025-02-14", items: [{ name: "Maple Chipotle Hot Sauce", qty: 2, price: 12.99 }, { name: "Smoked Maple BBQ Sauce", qty: 1, price: 13.99 }], subtotal: 39.97, hst: 5.20, total: 45.17, status: "Delivered", pickup: "2025-02-16", pickupTime: "2:00 PM - 3:00 PM", payment: "etransfer" },
  { id: "ORD-2901", userId: "u1", customer: "priya@gmail.com", date: "2025-03-01", items: [{ name: "Ghost Pepper Maple Glaze", qty: 1, price: 16.99 }], subtotal: 16.99, hst: 2.21, total: 19.20, status: "Ready for Pickup", pickup: "2025-03-05", pickupTime: "11:00 AM - 12:00 PM", payment: "etransfer" },
  { id: "ORD-2934", userId: "u2", customer: "rahul@hotmail.com", date: "2025-03-03", items: [{ name: "Scorpion Chili Oil", qty: 2, price: 18.99 }, { name: "Canadian Piri-Piri Blend", qty: 1, price: 14.99 }], subtotal: 52.97, hst: 6.89, total: 59.86, status: "Pending", pickup: "2025-03-07", pickupTime: "3:00 PM - 4:00 PM", payment: "etransfer" },
  { id: "ORD-2955", userId: "u3", customer: "jennifer@yahoo.ca", date: "2025-03-04", items: [{ name: "Smoky Habanero Salsa", qty: 3, price: 10.99 }], subtotal: 32.97, hst: 4.29, total: 37.26, status: "Processing", pickup: "2025-03-08", pickupTime: "10:00 AM - 11:00 AM", payment: "etransfer" },
];

const INIT_USERS = [
  { id: "u1", name: "Priya Sharma", email: "priya@gmail.com", joined: "2025-01-10", orders: 2, spent: 64.37, status: "active" },
  { id: "u2", name: "Rahul Patel", email: "rahul@hotmail.com", joined: "2025-02-20", orders: 1, spent: 59.86, status: "active" },
  { id: "u3", name: "Jennifer Chen", email: "jennifer@yahoo.ca", joined: "2025-03-01", orders: 1, spent: 37.26, status: "active" },
];

const PICKUP_TIMES = ["10:00 AM - 11:00 AM","11:00 AM - 12:00 PM","1:00 PM - 2:00 PM","2:00 PM - 3:00 PM","3:00 PM - 4:00 PM","4:00 PM - 5:00 PM"];
const ORDER_STATUSES = ["Pending","Processing","Ready for Pickup","Delivered","Cancelled"];
const EMOJIS = ["🌶️","👻","🫙","✨","🍁","🦂","🔥","🫑","🧄","🧅","🫚","🥫"];

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const CartCtx = createContext(null);
const AuthCtx = createContext(null);
const DataCtx = createContext(null);



function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      const [{ data: prods }, { data: ords }, { data: usrs }] = await Promise.all([
        supabase.from('products').select('*').order('created_at'),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at'),
      ]);
      if (prods) setProducts(prods.map(p => ({
        ...p, heat: p.heat_level, image: p.image_emoji, badges: p.badges || []
      })));
      if (ords) setOrders(ords.map(o => ({
        ...o, customer: o.customer_email,
        items: o.order_items || [],
        hst: o.hst_amount, total: o.total_price,
        pickup: o.pickup_date, pickupTime: o.pickup_time_range,
      })));
      if (usrs) setUsers(usrs.map(u => ({
        ...u, name: u.full_name || u.email?.split('@')[0] || 'User',
        joined: u.created_at?.split('T')[0],
      })));
      setLoading(false);
    };
    loadAll();

    // ── Real-time subscriptions ───────────────────────────────
    const productSub = supabase.channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        supabase.from('products').select('*').order('created_at')
          .then(({ data }) => data && setProducts(data.map(p => ({
            ...p, heat: p.heat_level, image: p.image_emoji, badges: p.badges || []
          }))));
      }).subscribe();

    const orderSub = supabase.channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
          .then(({ data }) => data && setOrders(data.map(o => ({
            ...o, customer: o.customer_email,
            items: o.order_items || [],
            hst: o.hst_amount, total: o.total_price,
            pickup: o.pickup_date, pickupTime: o.pickup_time_range,
          }))));
      }).subscribe();

    const profileSub = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        supabase.from('profiles').select('*').order('created_at')
          .then(({ data }) => data && setUsers(data.map(u => ({
            ...u, name: u.full_name || u.email?.split('@')[0] || 'User',
            joined: u.created_at?.split('T')[0],
          }))));
      }).subscribe();

    return () => {
      supabase.removeChannel(productSub);
      supabase.removeChannel(orderSub);
      supabase.removeChannel(profileSub);
    };
  }, []);

  // ── CRUD: Products ────────────────────────────────────────
  const addProduct = async (p) => {
    await supabase.from('products').insert({
      name: p.name, description: p.description, price: p.price,
      category: p.category, heat_level: p.heat, stock: p.stock,
      image_emoji: p.image, badges: p.badges, active: p.active,
    });
    // Real-time subscription will update state automatically
  };

  const updateProduct = async (id, updates) => {
    const dbUpdates = { ...updates };
    if (updates.heat !== undefined) { dbUpdates.heat_level = updates.heat; delete dbUpdates.heat; }
    if (updates.image !== undefined) { dbUpdates.image_emoji = updates.image; delete dbUpdates.image; }
    await supabase.from('products').update(dbUpdates).eq('id', id);
  };

  const deleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
  };

  // ── CRUD: Orders ──────────────────────────────────────────
  const updateOrder = async (id, updates) => {
    const dbUpdates = {};
    if (updates.status) dbUpdates.status = updates.status;
    await supabase.from('orders').update(dbUpdates).eq('id', id);
  };

  // ── CRUD: Users ───────────────────────────────────────────
  const updateUser = async (id, updates) => {
    await supabase.from('profiles').update(updates).eq('id', id);
  };

  return (
    <DataCtx.Provider value={{ products, orders, users, loading, addProduct, updateProduct, deleteProduct, updateOrder, updateUser }}>
      {children}
    </DataCtx.Provider>
  );
}

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const addItem = (product, qty, date, time) => {
    setItems(prev => {
      const ex = prev.find(i => i.id === product.id && i.pickupDate === date && i.pickupTime === time);
      if (ex) return prev.map(i => i.id === product.id && i.pickupDate === date && i.pickupTime === time ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty, pickupDate: date, pickupTime: time, cartId: `${product.id}-${Date.now()}` }];
    });
  };
  const removeItem = (cartId) => setItems(prev => prev.filter(i => i.cartId !== cartId));
  const updateQty = (cartId, qty) => { if (qty < 1) return removeItem(cartId); setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, qty } : i)); };
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hst = subtotal * TAX_RATE;
  const total = subtotal + hst;
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, subtotal, hst, total, count, isOpen, setIsOpen }}>{children}</CartCtx.Provider>;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.email.split('@')[0],
          avatar: session.user.email[0].toUpperCase(),
          role: session.user.email === 'admin@spicemaple.ca' ? 'admin' : 'user',
          id: session.user.id,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.email.split('@')[0],
          avatar: session.user.email[0].toUpperCase(),
          role: session.user.email === 'admin@spicemaple.ca' ? 'admin' : 'user',
          id: session.user.id,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false };
    const role = email === 'admin@spicemaple.ca' ? 'admin' : 'user';
    if (isAdmin && role !== 'admin') return { ok: false };
    return { ok: true, role };
  };

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
  };

  return (
    <AuthCtx.Provider value={{ user, login, signup, logout, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  );
}

const useCart = () => useContext(CartCtx);
const useAuth = () => useContext(AuthCtx);
const useData = () => useContext(DataCtx);

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function HeatLevel({ level }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => <Flame key={i} size={12} style={{ color: i <= level ? T.red : "#DDD", fill: i <= level ? T.red : "none" }} />)}
    </div>
  );
}

function Stars({ rating, interactive, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={interactive ? 20 : 14}
          style={{ cursor: interactive ? "pointer" : "default", color: i <= (hover || rating) ? T.maple : "#DDD", fill: i <= (hover || rating) ? T.maple : "none" }}
          onClick={() => interactive && onRate && onRate(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)} />
      ))}
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ setPage }) {
  const { count, setIsOpen, total } = useCart();
  const { user, logout } = useAuth();
  return (
    <nav style={{ background: T.charcoal, borderBottom: `3px solid ${T.maple}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🌶️</span>
          <div>
            <div style={{ color: T.white, fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 18 }}>Spice & Maple</div>
            <div style={{ color: T.mapleLight, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Artisan Kitchen Co.</div>
          </div>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPage("shop")} style={{ background: "none", border: "none", color: T.lightGray, cursor: "pointer", padding: "8px 12px", fontSize: 14, fontWeight: 500 }}>Shop</button>
          {user?.role === "admin" && (
            <button onClick={() => setPage("admin")} style={{ background: "rgba(211,84,0,0.2)", border: `1px solid ${T.maple}`, color: T.mapleLight, cursor: "pointer", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
              Admin Panel
            </button>
          )}
          {user ? (
            <>
              {user.role !== "admin" && (
                <button onClick={() => setPage("profile")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${T.maple},${T.red})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>{user.avatar}</div>
                </button>
              )}
              <button onClick={logout} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 8 }}><LogOut size={16} /></button>
            </>
          ) : (
            <button onClick={() => setPage("auth")} style={{ background: "none", border: `1px solid ${T.maple}`, color: T.mapleLight, cursor: "pointer", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Sign In</button>
          )}
          {user?.role !== "admin" && (
            <button onClick={() => setIsOpen(true)} style={{ position: "relative", background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", cursor: "pointer", padding: "8px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
              <ShoppingCart size={16} />
              {count > 0 && <span style={{ background: T.mapleLight, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, position: "absolute", top: -6, right: -6 }}>{count}</span>}
              {count > 0 && formatCAD(total)}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ setPage }) {
  const { items, removeItem, updateQty, subtotal, hst, total, isOpen, setIsOpen } = useCart();
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsOpen(false)} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: Math.min(420, window.innerWidth), background: T.white, display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.charcoal }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><ShoppingCart size={20} color={T.mapleLight} /><span style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700 }}>Your Cart</span></div>
          <button onClick={() => setIsOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="white" /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {items.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 20px", color: T.warmGray }}><div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div><p style={{ fontFamily: "Georgia,serif", fontSize: 18 }}>Cart is empty</p></div>
            : items.map(item => (
              <div key={item.cartId} style={{ background: T.lightGray, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{item.image}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: T.charcoal, fontSize: 14 }}>{item.name}</div>
                    <div style={{ color: T.maple, fontWeight: 700, fontSize: 15 }}>{formatCAD(item.price)}</div>
                    <div style={{ color: T.warmGray, fontSize: 12, marginTop: 4 }}>{item.pickupDate} · {item.pickupTime}</div>
                  </div>
                  <button onClick={() => removeItem(item.cartId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CCC" }}><X size={16} /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden", background: "white" }}>
                    <button onClick={() => updateQty(item.cartId, item.qty - 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px" }}><Minus size={12} /></button>
                    <span style={{ padding: "6px 12px", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.cartId, item.qty + 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px" }}><Plus size={12} /></button>
                  </div>
                  <span style={{ fontWeight: 700, color: T.charcoal }}>{formatCAD(item.price * item.qty)}</span>
                </div>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.border}`, padding: 20 }}>
            <div style={{ background: T.lightGray, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: T.warmGray, fontSize: 14 }}>Subtotal</span><span>{formatCAD(subtotal)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: T.warmGray, fontSize: 14 }}>Ontario HST (13%)</span><span>{formatCAD(hst)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${T.border}` }}><span style={{ color: T.charcoal, fontWeight: 700, fontSize: 16 }}>Total (CAD)</span><span style={{ color: T.maple, fontWeight: 700, fontSize: 18 }}>{formatCAD(total)}</span></div>
            </div>
            <button onClick={() => { setIsOpen(false); setPage("checkout"); }} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const { products } = useData();
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg,${T.charcoal} 0%,#1a0a00 100%)`, padding: "80px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 30% 50%,rgba(211,84,0,0.15) 0%,transparent 60%),radial-gradient(circle at 70% 50%,rgba(192,57,43,0.15) 0%,transparent 60%)` }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(211,84,0,0.2)", border: `1px solid ${T.maple}`, borderRadius: 20, padding: "6px 16px", color: T.mapleLight, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>🍁 Handcrafted in Toronto, Ontario</div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(36px,6vw,64px)", color: T.white, margin: "0 0 20px", lineHeight: 1.15, fontWeight: 700 }}>Where <span style={{ color: T.mapleLight }}>Maple</span> Meets <span style={{ color: "#E74C3C" }}>Fire</span></h1>
          <p style={{ color: "#BBA99A", fontSize: 18, lineHeight: 1.7, marginBottom: 36 }}>Artisan hot sauces, glazes and spice blends crafted with Canadian ingredients. Pre-order for local pickup in Toronto.</p>
          <button onClick={() => setPage("shop")} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Shop Now 🌶️</button>
        </div>
      </div>
      <div style={{ background: T.lightGray, padding: "48px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
          {[{icon:<Leaf size={24} color={T.maple}/>,title:"100% Natural",desc:"No preservatives. Just real Canadian ingredients."},{icon:<MapPin size={24} color={T.maple}/>,title:"Local Pickup",desc:"Pre-order online, pick up at our Toronto kitchen."},{icon:<Flame size={24} color={T.maple}/>,title:"Heat Levels",desc:"From mild to inferno — something for everyone."},{icon:<Shield size={24} color={T.maple}/>,title:"Secure & Canadian",desc:"Data stored in Montreal. No data sold ever."}].map((f,i) => (
            <div key={i} style={{ background: T.white, borderRadius: 12, padding: 24, textAlign: "center" }}>
              <div style={{ marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, color: T.charcoal, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: T.warmGray, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "56px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 32, color: T.charcoal, margin: "0 0 12px" }}>Featured Products</h2>
          <p style={{ color: T.warmGray, fontSize: 16 }}>Small batch, made fresh. Order before they sell out.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
          {products.filter(p => p.active).slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button onClick={() => setPage("shop")} style={{ background: "none", border: `2px solid ${T.maple}`, color: T.maple, padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>View All Products</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem } = useCart();
  return (
    <>
      <div style={{ background: T.white, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, transition: "transform 0.2s,box-shadow 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
        <div style={{ background: `linear-gradient(135deg,${T.lightGray},${T.cream})`, padding: "32px 20px", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 64 }}>{product.image}</div>
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {product.badges?.map(b => <span key={b} style={{ background: b === "Limited Run" ? T.red : b === "Best Seller" ? T.maple : T.charcoal, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase" }}>{b}</span>)}
          </div>
          {product.stock <= 8 && <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(192,57,43,0.9)", color: "white", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>Only {product.stock} left!</div>}
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <h3 style={{ margin: 0, color: T.charcoal, fontFamily: "Georgia,serif", fontSize: 17, lineHeight: 1.3 }}>{product.name}</h3>
            <span style={{ color: T.maple, fontWeight: 700, fontSize: 18, flexShrink: 0, marginLeft: 8 }}>{formatCAD(product.price)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <HeatLevel level={product.heat} />
            <span style={{ fontSize: 12, color: "#999", background: T.lightGray, padding: "2px 8px", borderRadius: 20 }}>{product.category}</span>
          </div>
          <p style={{ color: T.warmGray, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{product.description}</p>
          <button onClick={() => setModalOpen(true)} style={{ width: "100%", padding: 11, background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Calendar size={14} /> Pre-Order for Pickup
          </button>
        </div>
      </div>
      {modalOpen && <PreOrderModal product={product} onClose={() => setModalOpen(false)} onAdd={(p, q, d, t) => { addItem(p, q, d, t); setModalOpen(false); }} />}
    </>
  );
}

// ─── PRE-ORDER MODAL ──────────────────────────────────────────────────────────
function PreOrderModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [added, setAdded] = useState(false);
  const handle = () => {
    if (!date || !time) return;
    onAdd(product, qty, date, time);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1000);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: 16, padding: 32, maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div><div style={{ fontSize: 36, marginBottom: 8 }}>{product.image}</div><h3 style={{ margin: 0, color: T.charcoal, fontFamily: "Georgia,serif", fontSize: 20 }}>{product.name}</h3><p style={{ margin: "4px 0 0", color: T.maple, fontWeight: 700, fontSize: 18 }}>{formatCAD(product.price)}</p></div>
          <button onClick={onClose} style={{ background: T.lightGray, border: "none", cursor: "pointer", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>
        <div style={{ background: T.lightGray, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.warmGray, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Schedule Pickup (Toronto EST)</div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.charcoal, marginBottom: 6 }}>Date</label>
          <input type="date" value={date} min={getMinDate()} max={getMaxDate()} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", marginBottom: 12 }} />
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.charcoal, marginBottom: 6 }}>Time Window</label>
          <select value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}>
            <option value="">Select a time...</option>
            {PICKUP_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.charcoal }}>Quantity</span>
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: T.lightGray, border: "none", cursor: "pointer", padding: "8px 12px" }}><Minus size={14} /></button>
            <span style={{ padding: "8px 16px", fontWeight: 700, fontSize: 16 }}>{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ background: T.lightGray, border: "none", cursor: "pointer", padding: "8px 12px" }}><Plus size={14} /></button>
          </div>
          <span style={{ fontSize: 13, color: "#999" }}>{product.stock} in stock</span>
        </div>
        <button onClick={handle} disabled={!date || !time}
          style={{ width: "100%", padding: 14, background: added ? "#27AE60" : (!date || !time) ? "#CCC" : `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: !date || !time ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {added ? <><CheckCircle size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart — {formatCAD(product.price * qty)}</>}
        </button>
      </div>
    </div>
  );
}

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────
function ShopPage() {
  const { products } = useData();
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...new Set(products.map(p => p.category))];
  const filtered = (filter === "All" ? products : products.filter(p => p.category === filter)).filter(p => p.active);
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 36, color: T.charcoal, margin: "0 0 8px" }}>Our Products</h1>
        <p style={{ color: T.warmGray, fontSize: 16, margin: 0 }}>Pre-order for pickup in Toronto. All prices in CAD + 13% HST at checkout.</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${filter === c ? T.maple : T.border}`, background: filter === c ? T.maple : "white", color: filter === c ? "white" : T.warmGray, cursor: "pointer", fontSize: 14, fontWeight: filter === c ? 700 : 400 }}>{c}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 24 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

// ─── AUTH PAGE — hidden admin trigger ─────────────────────────────────────────
// The tiny dot "·" in the footer separator, when clicked 3 times, reveals the admin login.
// It looks like a regular decorative character — customers won't notice it.
function AuthPage({ setPage }) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState(null);
  const [dotClicks, setDotClicks] = useState(0);

  const handleDotClick = () => {
    const next = dotClicks + 1;
    setDotClicks(next);
    if (next >= 3) { setTab("admin"); setEmail(""); setPassword(""); setMsg(null); setDotClicks(0); }
  };

  const handleSubmit = () => {
    setMsg(null);
    if (tab === "admin") {
      const res = login(email, password, true);
      if (res.ok) setPage("admin");
      else setMsg({ type: "error", text: "Invalid admin credentials." });
    } else if (tab === "login") {
      const res = login(email, password);
      if (res.ok) setPage("profile");
      else setMsg({ type: "error", text: "Invalid credentials. Try any email + password to demo." });
    } else if (tab === "signup") {
      signup(email, password);
      setPage("profile");
    } else {
      setMsg({ type: "success", text: "If that email exists, a reset link has been sent." });
    }
  };

  const isAdmin = tab === "admin";

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: isAdmin ? T.adminBg : T.lightGray, transition: "background 0.4s" }}>
      <div style={{ background: isAdmin ? T.adminCard : T.white, border: isAdmin ? `1px solid ${T.adminBorder}` : "none", borderRadius: 16, padding: 40, maxWidth: 400, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{isAdmin ? "🔐" : "🌶️"}</div>
          <h2 style={{ fontFamily: "Georgia,serif", color: isAdmin ? T.white : T.charcoal, margin: 0, fontSize: 24 }}>
            {tab === "login" ? "Welcome Back" : tab === "signup" ? "Create Account" : tab === "reset" ? "Reset Password" : "Staff Access"}
          </h2>
          {isAdmin && <p style={{ color: "#666", fontSize: 13, marginTop: 8, margin: "8px 0 0" }}>Restricted area · Authorised staff only</p>}
        </div>

        {!isAdmin && (
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 24 }}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => { setTab(t); setMsg(null); }} style={{ flex: 1, padding: 10, border: "none", background: tab === t ? T.charcoal : "white", color: tab === t ? "white" : T.warmGray, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {msg && (
          <div style={{ background: msg.type === "error" ? "#FEE" : "#EFE", border: `1px solid ${msg.type === "error" ? "#FCC" : "#CEC"}`, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: msg.type === "error" ? "#C00" : "#070" }}>{msg.text}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: isAdmin ? "#AAA" : T.charcoal, marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAdmin ? "staff@spicemaple.ca" : "you@example.ca"}
            style={{ width: "100%", padding: "11px 14px", border: `1px solid ${isAdmin ? T.adminBorder : T.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: isAdmin ? T.adminBg : "white", color: isAdmin ? T.white : T.charcoal }} />
        </div>

        {tab !== "reset" && (
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: isAdmin ? "#AAA" : T.charcoal, marginBottom: 6 }}>Password</label>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ width: "100%", padding: "11px 40px 11px 14px", border: `1px solid ${isAdmin ? T.adminBorder : T.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: isAdmin ? T.adminBg : "white", color: isAdmin ? T.white : T.charcoal }} />
            <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", cursor: "pointer", color: "#999" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}

        <button onClick={handleSubmit}
          style={{ width: "100%", padding: 13, background: isAdmin ? `linear-gradient(135deg,#922B21,#C0392B)` : `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
          {tab === "login" ? "Sign In" : tab === "signup" ? "Create Account" : tab === "reset" ? "Send Reset Link" : "Access Panel"}
        </button>

        {tab === "login" && <button onClick={() => setTab("reset")} style={{ background: "none", border: "none", color: T.maple, cursor: "pointer", fontSize: 13, width: "100%", textAlign: "center" }}>Forgot your password?</button>}
        {tab === "reset" && <button onClick={() => setTab("login")} style={{ background: "none", border: "none", color: T.warmGray, cursor: "pointer", fontSize: 13, width: "100%", textAlign: "center" }}>Back to Sign In</button>}
        {isAdmin && <button onClick={() => { setTab("login"); setEmail(""); setPassword(""); setMsg(null); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13, width: "100%", textAlign: "center", marginTop: 8 }}>Back to customer login</button>}

        {/* ── HIDDEN ADMIN TRIGGER ──
            The tiny "·" dot blends into the footer as decoration.
            Clicking it 3 times reveals the admin login silently.
            Regular users will never notice it. */}
        {!isAdmin && (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#CCC", fontSize: 11 }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span>Spice & Maple © 2025</span>
              <span
                onClick={handleDotClick}
                style={{ cursor: "default", color: T.border, fontSize: 8, userSelect: "none", padding: "4px 2px" }}
                title=""
              >·</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>
            <p style={{ color: "#CCC", fontSize: 11, marginTop: 8 }}>
              Data stored securely in Canada ·{" "}
              <button onClick={() => setPage("privacy")} style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 11, textDecoration: "underline" }}>Privacy Policy</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ setPage }) {
  const { user } = useAuth();
  const { orders } = useData();
  const [activeOrder, setActiveOrder] = useState(null);
  const [reviews, setReviews] = useState({});
  const myOrders = orders.filter(o => o.customer === user?.email);
  if (!user) return <div style={{ textAlign: "center", padding: "80px 20px" }}><p style={{ fontFamily: "Georgia,serif", fontSize: 20, color: T.charcoal }}>Please sign in.</p><button onClick={() => setPage("auth")} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16 }}>Sign In</button></div>;
  const statusColor = s => ({ Delivered: "#27AE60", "Ready for Pickup": T.maple, Pending: T.warmGray, Processing: "#3498DB", Cancelled: "#E74C3C" }[s] || "#999");
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: `linear-gradient(135deg,${T.charcoal},#1a0a00)`, borderRadius: 16, padding: 28, marginBottom: 32, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${T.maple},${T.red})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 700 }}>{user.avatar}</div>
        <div>
          <div style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, textTransform: "capitalize" }}>{user.name}</div>
          <div style={{ color: T.mapleLight, fontSize: 14 }}>{user.email}</div>
        </div>
      </div>
      <h2 style={{ fontFamily: "Georgia,serif", fontSize: 24, color: T.charcoal, margin: "0 0 20px" }}>Order History</h2>
      {myOrders.length === 0 && <p style={{ color: T.warmGray }}>No orders yet. <button onClick={() => setPage("shop")} style={{ background: "none", border: "none", color: T.maple, cursor: "pointer", textDecoration: "underline" }}>Start shopping</button></p>}
      {myOrders.map(order => (
        <div key={order.id} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setActiveOrder(activeOrder === order.id ? null : order.id)}>
            <div><div style={{ fontWeight: 700, color: T.charcoal, fontSize: 15 }}>{order.id}</div><div style={{ color: "#999", fontSize: 13 }}>{order.date}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ background: statusColor(order.status) + "22", color: statusColor(order.status), padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{order.status}</span>
              <span style={{ fontWeight: 700, color: T.charcoal }}>{formatCAD(order.total)}</span>
              <ChevronDown size={16} style={{ transform: activeOrder === order.id ? "rotate(180deg)" : "", transition: "transform 0.2s" }} />
            </div>
          </div>
          {activeOrder === order.id && (
            <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.border}` }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.lightGray}` }}>
                  <span style={{ color: T.charcoal, fontSize: 14 }}>{item.name} × {item.qty}</span>
                  {order.status === "Delivered" && (
                    reviews[`${order.id}-${i}`]
                      ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Stars rating={reviews[`${order.id}-${i}`].rating} /><span style={{ color: "#999", fontSize: 12 }}>Reviewed</span></div>
                      : <ReviewForm itemName={item.name} onSubmit={(r, t) => setReviews(p => ({ ...p, [`${order.id}-${i}`]: { rating: r, text: t } }))} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewForm({ itemName, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} style={{ background: "none", border: `1px solid ${T.maple}`, color: T.maple, padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Leave Review</button>;
  return (
    <div style={{ background: T.lightGray, borderRadius: 8, padding: 16, marginTop: 8, width: "100%" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.charcoal, marginBottom: 8 }}>Review {itemName}</div>
      <Stars rating={rating} interactive onRate={setRating} />
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience..." style={{ width: "100%", marginTop: 10, padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, resize: "vertical", minHeight: 70, boxSizing: "border-box" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => { if (rating > 0) { onSubmit(rating, text); setOpen(false); } }} style={{ background: T.maple, border: "none", color: "white", padding: "7px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Submit</button>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.warmGray, padding: "7px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function CheckoutPage({ setPage }) {
  const { items, subtotal, hst, total } = useCart();
  const { user } = useAuth();
  const [method, setMethod] = useState("etransfer");
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "" });
  const [placed, setPlaced] = useState(false);

  

// ADD THIS BLOCK RIGHT HERE
const handlePlaceOrder = async () => {
  const orderId = `ORD-${Date.now()}`;
  await supabase.from('orders').insert({
    id: orderId,
    user_id: user?.id,
    customer_email: form.email,
    subtotal: subtotal,
    hst_amount: hst,
    total_price: total,
    pickup_date: items[0]?.pickupDate,
    pickup_time_range: items[0]?.pickupTime,
    payment_method: method,
    status: 'Pending',
  });
  const orderItems = items.map(item => ({
    order_id: orderId,
    product_id: item.id,
    product_name: item.name,
    quantity: item.qty,
    unit_price: item.price,
  }));
  await supabase.from('order_items').insert(orderItems);
  setPlaced(true);
};

  if (placed) return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontFamily: "Georgia,serif", fontSize: 32, color: T.charcoal, marginBottom: 12 }}>Order Confirmed!</h2>
      <p style={{ color: T.warmGray, fontSize: 16, marginBottom: 24 }}>Check your email for order details.</p>
      {method === "etransfer" && (
        <div style={{ background: T.lightGray, borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "left" }}>
          <h3 style={{ color: T.charcoal, fontFamily: "Georgia,serif", marginBottom: 12 }}>Send Your Interac E-Transfer</h3>
          <p style={{ color: T.warmGray, fontSize: 14, lineHeight: 1.6 }}>Send <strong style={{ color: T.maple }}>{formatCAD(total)}</strong> to: <strong style={{ color: T.charcoal, fontSize: 16 }}>payments@spicemaple.ca</strong></p>
        </div>
      )}
      <button onClick={() => setPage("home")} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Back to Home</button>
    </div>
  );

  if (items.length === 0) return <div style={{ textAlign: "center", padding: "80px 20px" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div><h2 style={{ fontFamily: "Georgia,serif", color: T.charcoal }}>Cart is empty</h2><button onClick={() => setPage("shop")} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16 }}>Browse Products</button></div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <button onClick={() => setPage("shop")} style={{ background: "none", border: "none", cursor: "pointer", color: T.warmGray, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}><ArrowLeft size={16} /> Continue Shopping</button>
      <h1 style={{ fontFamily: "Georgia,serif", fontSize: 30, color: T.charcoal, margin: "0 0 32px" }}>Checkout</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "start" }}>
        <div>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Georgia,serif", color: T.charcoal, margin: "0 0 20px", fontSize: 18 }}>Contact Information</h3>
            {["name", "email", "phone"].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.charcoal, marginBottom: 6, textTransform: "capitalize" }}>{f === "phone" ? "Phone (Optional)" : f}</label>
                <input type={f === "email" ? "email" : "text"} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: "Georgia,serif", color: T.charcoal, margin: "0 0 20px", fontSize: 18 }}>Payment Method</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[{ key: "etransfer", label: "Interac E-Transfer", icon: "🏦", sub: "Most popular in Canada" }, { key: "stripe", label: "Credit / Debit Card", icon: "💳", sub: "Coming Soon" }].map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)} disabled={m.key === "stripe"} style={{ padding: 16, border: `2px solid ${method === m.key ? T.maple : T.border}`, borderRadius: 10, background: method === m.key ? "rgba(211,84,0,0.05)" : "white", cursor: m.key === "stripe" ? "not-allowed" : "pointer", textAlign: "left", opacity: m.key === "stripe" ? 0.5 : 1 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.charcoal }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: T.warmGray, marginTop: 2 }}>{m.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ minWidth: 280 }}>
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, position: "sticky", top: 84 }}>
            <h3 style={{ fontFamily: "Georgia,serif", color: T.charcoal, margin: "0 0 16px", fontSize: 18 }}>Order Summary</h3>
            {items.map(item => (
              <div key={item.cartId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                <div><div style={{ color: T.charcoal, fontWeight: 600 }}>{item.name}</div><div style={{ color: "#999", fontSize: 12 }}>x{item.qty} · {item.pickupDate}</div></div>
                <span style={{ fontWeight: 600 }}>{formatCAD(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 16, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: T.warmGray }}>Subtotal</span><span>{formatCAD(subtotal)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: T.warmGray }}>HST (13%)</span><span>{formatCAD(hst)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, paddingTop: 8, borderTop: `1px solid ${T.border}` }}><span>Total (CAD)</span><span style={{ color: T.maple }}>{formatCAD(total)}</span></div>
            </div>
            <button onClick={handlePlaceOrder} style={{ width: "100%", marginTop: 20, padding: 14, background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Place Order 🍁</button>
            <p style={{ color: "#999", fontSize: 11, textAlign: "center", marginTop: 10 }}>Secured · Data stored in Canada</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function AdminGuard({ setPage, children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.adminBg }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <Lock size={48} color={T.red} style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: "Georgia,serif" }}>Admin Access Required</h2>
          <button onClick={() => setPage("auth")} style={{ marginTop: 16, background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Go to Login</button>
        </div>
      </div>
    );
  }
  return children;
}

function AdminDashboard({ setPage }) {
  const [section, setSection] = useState("overview");
  const { user, logout } = useAuth();
  const { orders } = useData();
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;

  const navItems = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag size={18} />, badge: pendingOrders },
    { key: "products", label: "Products", icon: <Package size={18} /> },
    { key: "users", label: "Users", icon: <Users size={18} /> },
    { key: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <AdminGuard setPage={setPage}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 67px)", background: T.adminBg }}>
        {/* Sidebar */}
        <div style={{ width: 230, background: T.adminSide, borderRight: `1px solid ${T.adminBorder}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "24px 20px", borderBottom: `1px solid ${T.adminBorder}` }}>
            <div style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Admin Panel</div>
            <div style={{ color: T.white, fontSize: 13, fontWeight: 600 }}>{user?.email}</div>
          </div>
          <nav style={{ padding: "12px", flex: 1 }}>
            {navItems.map(item => (
              <button key={item.key} onClick={() => setSection(item.key)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 8, border: "none", background: section === item.key ? "rgba(211,84,0,0.15)" : "transparent", color: section === item.key ? T.mapleLight : "#888", cursor: "pointer", fontSize: 14, fontWeight: section === item.key ? 700 : 500, marginBottom: 4, textAlign: "left" }}>
                <span style={{ color: section === item.key ? T.maple : "#555" }}>{item.icon}</span>
                {item.label}
                {item.badge > 0 && <span style={{ marginLeft: "auto", background: T.red, color: "white", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 12px", borderTop: `1px solid ${T.adminBorder}` }}>
            <button onClick={() => setPage("home")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "none", background: "transparent", color: "#666", cursor: "pointer", fontSize: 13, marginBottom: 6 }}>
              <ArrowLeft size={16} /> View Store
            </button>
            <button onClick={() => { logout(); setPage("home"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "none", background: "rgba(192,57,43,0.1)", color: "#E74C3C", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {section === "overview" && <AdminOverview />}
          {section === "orders" && <AdminOrders />}
          {section === "products" && <AdminProducts />}
          {section === "users" && <AdminUsers />}
          {section === "settings" && <AdminSettings />}
        </div>
      </div>
    </AdminGuard>
  );
}

// ─── ADMIN: OVERVIEW ──────────────────────────────────────────────────────────
function AdminOverview() {
  const { orders, products, users } = useData();
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  const statusColor = s => ({ Delivered: "#27AE60", "Ready for Pickup": T.maple, Pending: "#F39C12", Processing: "#3498DB", Cancelled: "#E74C3C" }[s] || "#999");

  const stats = [
    { label: "Total Revenue", value: formatCAD(totalRevenue), icon: <TrendingUp size={22} />, color: T.maple, sub: "All time (CAD)" },
    { label: "Total Orders", value: orders.length, icon: <ShoppingBag size={22} />, color: "#3498DB", sub: `${pendingOrders} need action` },
    { label: "Active Products", value: products.filter(p => p.active).length, icon: <Package size={22} />, color: "#27AE60", sub: `${products.length} total` },
    { label: "Customers", value: users.length, icon: <Users size={22} />, color: "#9B59B6", sub: "Registered users" },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 6px" }}>Dashboard Overview</h1>
        <p style={{ color: "#666", fontSize: 14 }}>Welcome back! Here's what's happening at Spice & Maple.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, padding: 24 }}>
            <div style={{ background: `${s.color}22`, borderRadius: 10, padding: 10, color: s.color, display: "inline-block", marginBottom: 16 }}>{s.icon}</div>
            <div style={{ color: T.white, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>{s.label}</div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.adminBorder}` }}>
          <h2 style={{ color: T.white, fontFamily: "Georgia,serif", margin: 0, fontSize: 18 }}>Recent Orders</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
                {["Order ID", "Customer", "Date", "Total", "Status", "Pickup Date"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
                  <td style={{ padding: "14px 20px", color: T.mapleLight, fontWeight: 700, fontSize: 14 }}>{o.id}</td>
                  <td style={{ padding: "14px 20px", color: "#CCC", fontSize: 14 }}>{o.customer}</td>
                  <td style={{ padding: "14px 20px", color: "#888", fontSize: 13 }}>{o.date}</td>
                  <td style={{ padding: "14px 20px", color: T.white, fontWeight: 600 }}>{formatCAD(o.total)}</td>
                  <td style={{ padding: "14px 20px" }}><span style={{ background: statusColor(o.status) + "33", color: statusColor(o.status), padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{o.status}</span></td>
                  <td style={{ padding: "14px 20px", color: "#888", fontSize: 13 }}>{o.pickup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: ORDERS ────────────────────────────────────────────────────────────
function AdminOrders() {
  const { orders, updateOrder } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = s => ({ Delivered: "#27AE60", "Ready for Pickup": T.maple, Pending: "#F39C12", Processing: "#3498DB", Cancelled: "#E74C3C" }[s] || "#999");

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 6px" }}>Orders</h1>
        <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Manage and update all customer pre-orders. Click the status badge to change it.</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} color="#555" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders or customers..."
            style={{ width: "100%", padding: "10px 12px 10px 38px", background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "10px 14px", background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14 }}>
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
              {["Order", "Customer", "Items", "Total", "Pickup", "Status", "Edit"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
                <td style={{ padding: "14px 16px", color: T.mapleLight, fontWeight: 700, fontSize: 14 }}>{o.id}</td>
                <td style={{ padding: "14px 16px", color: "#CCC", fontSize: 13 }}>{o.customer}</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: 12 }}>{o.items.map(i => `${i.name}×${i.qty}`).join(", ")}</td>
                <td style={{ padding: "14px 16px", color: T.white, fontWeight: 600 }}>{formatCAD(o.total)}</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: 12 }}>{o.pickup}<br /><span style={{ fontSize: 11, color: "#555" }}>{o.pickupTime}</span></td>
                <td style={{ padding: "14px 16px" }}>
                  {editingId === o.id
                    ? <select defaultValue={o.status} onChange={e => { updateOrder(o.id, { status: e.target.value }); setEditingId(null); }} autoFocus onBlur={() => setEditingId(null)}
                        style={{ padding: "6px 10px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 6, color: T.white, fontSize: 13 }}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    : <span onClick={() => setEditingId(o.id)} style={{ background: statusColor(o.status) + "33", color: statusColor(o.status), padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }} title="Click to edit">{o.status}</span>
                  }
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => setEditingId(o.id)} style={{ background: "rgba(211,84,0,0.15)", border: `1px solid ${T.maple}`, color: T.maple, padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}><Edit2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#555" }}>No orders match your filters.</div>}
      </div>
    </div>
  );
}

// ─── ADMIN: PRODUCTS ──────────────────────────────────────────────────────────
function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "Sauces", heat: 3, image: "🌶️", description: "", badges: "", stock: "", active: true });

  const resetForm = () => setForm({ name: "", price: "", category: "Sauces", heat: 3, image: "🌶️", description: "", badges: "", stock: "", active: true });

  const handleSave = () => {
    const data = { ...form, price: parseFloat(form.price) || 0, heat: parseInt(form.heat) || 3, stock: parseInt(form.stock) || 0, badges: typeof form.badges === "string" ? form.badges.split(",").map(b => b.trim()).filter(Boolean) : form.badges };
    if (editing) { updateProduct(editing, data); setEditing(null); }
    else addProduct(data);
    resetForm(); setShowForm(false);
  };

  const startEdit = (p) => { setEditing(p.id); setForm({ ...p, badges: Array.isArray(p.badges) ? p.badges.join(", ") : p.badges }); setShowForm(true); };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 6px" }}>Products</h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Add, edit, toggle visibility and manage your product catalogue.</p>
        </div>
        <button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, padding: 28, marginBottom: 28 }}>
          <h3 style={{ color: T.white, fontFamily: "Georgia,serif", margin: "0 0 24px", fontSize: 20 }}>{editing ? "Edit Product" : "New Product"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            {[{ key: "name", label: "Product Name", type: "text" }, { key: "price", label: "Price (CAD)", type: "number" }, { key: "stock", label: "Stock Quantity", type: "number" }].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14 }}>
                {["Sauces", "Salsas", "Dry Rubs", "Oils", "Glazes"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>Heat Level (1-5): Level {form.heat}</label>
              <input type="range" min={1} max={5} value={form.heat} onChange={e => setForm(p => ({ ...p, heat: parseInt(e.target.value) }))} style={{ width: "100%" }} />
              <div style={{ marginTop: 4 }}><HeatLevel level={form.heat} /></div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>Emoji Icon</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOJIS.map(e => <button key={e} onClick={() => setForm(p => ({ ...p, image: e }))} style={{ fontSize: 20, padding: "6px 8px", borderRadius: 6, border: `2px solid ${form.image === e ? T.maple : T.adminBorder}`, background: form.image === e ? "rgba(211,84,0,0.15)" : "transparent", cursor: "pointer" }}>{e}</button>)}
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 12px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>Badges (comma-separated)</label>
              <input value={form.badges} onChange={e => setForm(p => ({ ...p, badges: e.target.value }))} placeholder="Best Seller, Vegan, Limited Run" style={{ width: "100%", padding: "10px 12px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#AAA" }}>Visible to customers</label>
              <button onClick={() => setForm(p => ({ ...p, active: !p.active }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {form.active ? <ToggleRight size={32} color={T.maple} /> : <ToggleLeft size={32} color="#555" />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={handleSave} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}><Save size={16} /> {editing ? "Save Changes" : "Add Product"}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} style={{ background: "transparent", border: `1px solid ${T.adminBorder}`, color: "#888", padding: "11px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
              {["Product", "Category", "Price", "Stock", "Heat", "Visible", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${T.adminBorder}`, opacity: p.active ? 1 : 0.45 }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{p.image}</span>
                    <div>
                      <div style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{p.badges?.join(" · ")}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{p.category}</td>
                <td style={{ padding: "14px 16px", color: T.mapleLight, fontWeight: 700 }}>{formatCAD(p.price)}</td>
                <td style={{ padding: "14px 16px" }}><span style={{ color: p.stock <= 8 ? "#E74C3C" : p.stock <= 15 ? "#F39C12" : "#27AE60", fontWeight: 700 }}>{p.stock}</span></td>
                <td style={{ padding: "14px 16px" }}><HeatLevel level={p.heat} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => updateProduct(p.id, { active: !p.active })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {p.active ? <ToggleRight size={28} color={T.maple} /> : <ToggleLeft size={28} color="#555" />}
                  </button>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ background: "rgba(52,152,219,0.15)", border: "1px solid #3498DB", color: "#3498DB", padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}><Edit2 size={13} /></button>
                    <button onClick={() => { if (window.confirm("Delete this product?")) deleteProduct(p.id); }} style={{ background: "rgba(192,57,43,0.15)", border: `1px solid ${T.red}`, color: T.red, padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN: USERS ─────────────────────────────────────────────────────────────
function AdminUsers() {
  const { users, updateUser } = useData();
  const [search, setSearch] = useState("");
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 6px" }}>Users</h1>
        <p style={{ color: "#666", fontSize: 14, margin: 0 }}>View and manage registered customers. Suspend accounts if needed.</p>
      </div>
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 360 }}>
        <Search size={16} color="#555" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{ width: "100%", padding: "10px 12px 10px 38px", background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box" }} />
      </div>
      <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
              {["User", "Email", "Joined", "Orders", "Total Spent", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${T.adminBorder}` }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${T.maple},${T.red})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>{u.name[0]}</div>
                    <span style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", color: "#888", fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: "14px 20px", color: "#888", fontSize: 13 }}>{u.joined}</td>
                <td style={{ padding: "14px 20px", color: T.white, fontWeight: 600 }}>{u.orders}</td>
                <td style={{ padding: "14px 20px", color: T.mapleLight, fontWeight: 700 }}>{formatCAD(u.spent)}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ background: u.status === "active" ? "rgba(39,174,96,0.2)" : "rgba(192,57,43,0.2)", color: u.status === "active" ? "#27AE60" : "#E74C3C", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>{u.status}</span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button onClick={() => updateUser(u.id, { status: u.status === "active" ? "suspended" : "active" })}
                    style={{ background: "rgba(211,84,0,0.1)", border: `1px solid ${T.adminBorder}`, color: "#AAA", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                    {u.status === "active" ? "Suspend" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN: SETTINGS ──────────────────────────────────────────────────────────
function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ storeName: "Spice & Maple Artisan Kitchen Co.", contactEmail: "hello@spicemaple.ca", paymentEmail: "payments@spicemaple.ca", timezone: "America/Toronto", hstRate: "13", pickupAddress: "Toronto, Ontario, Canada", stripeEnabled: false, etransferEnabled: true, maintenanceMode: false });
  const update = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: T.white, fontFamily: "Georgia,serif", fontSize: 28, margin: "0 0 6px" }}>Settings</h1>
        <p style={{ color: "#666", fontSize: 14 }}>Configure your store settings and payment methods.</p>
      </div>
      {saved && <div style={{ background: "rgba(39,174,96,0.15)", border: "1px solid #27AE60", borderRadius: 8, padding: 14, marginBottom: 24, color: "#27AE60", display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={16} /> Settings saved successfully!</div>}
      {[
        { title: "Store Information", fields: [{ key: "storeName", label: "Store Name" }, { key: "contactEmail", label: "Contact Email" }, { key: "pickupAddress", label: "Pickup Address" }, { key: "timezone", label: "Timezone" }] },
        { title: "Payment Configuration", fields: [{ key: "paymentEmail", label: "Interac E-Transfer Email" }, { key: "hstRate", label: "HST Rate (%)" }] },
      ].map(section => (
        <div key={section.title} style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ color: T.white, fontFamily: "Georgia,serif", margin: "0 0 20px", fontSize: 18 }}>{section.title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {section.fields.map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#AAA", marginBottom: 6 }}>{f.label}</label>
                <input value={settings[f.key]} onChange={e => update(f.key, e.target.value)} style={{ width: "100%", padding: "10px 12px", background: T.adminBg, border: `1px solid ${T.adminBorder}`, borderRadius: 8, color: T.white, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: T.adminCard, border: `1px solid ${T.adminBorder}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: T.white, fontFamily: "Georgia,serif", margin: "0 0 20px", fontSize: 18 }}>Feature Toggles</h3>
        {[{ key: "etransferEnabled", label: "Interac E-Transfer", sub: "Primary payment for Canadian customers" }, { key: "stripeEnabled", label: "Stripe Cards", sub: "Enable when Stripe account is ready" }, { key: "maintenanceMode", label: "Maintenance Mode", sub: "Hide store from public — admin still accessible" }].map(s => (
          <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.adminBorder}` }}>
            <div>
              <div style={{ color: T.white, fontSize: 14, fontWeight: 600 }}>{s.label}</div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{s.sub}</div>
            </div>
            <button onClick={() => update(s.key, !settings[s.key])} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {settings[s.key] ? <ToggleRight size={32} color={T.maple} /> : <ToggleLeft size={32} color="#555" />}
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} style={{ background: `linear-gradient(135deg,${T.red},${T.maple})`, border: "none", color: "white", padding: "13px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Save size={16} /> Save All Settings
      </button>
    </div>
  );
}

// ─── LEGAL ────────────────────────────────────────────────────────────────────
function LegalPage({ type, setPage }) {
  const isPrivacy = type === "privacy";
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", color: T.warmGray, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}><ArrowLeft size={16} /> Back</button>
      <h1 style={{ fontFamily: "Georgia,serif", color: T.charcoal, fontSize: 30, marginBottom: 8 }}>{isPrivacy ? "Privacy Policy" : "Terms of Service"}</h1>
      <p style={{ color: "#999", fontSize: 13, marginBottom: 32 }}>Last updated: March 2025 · Governed by Ontario, Canada law</p>
      <div style={{ color: T.warmGray, lineHeight: 1.8, fontSize: 15 }}>
        {isPrivacy ? <>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>1. Data Collection & Canadian Residency</h2>
          <p>All personal data is stored in Canada using Supabase infrastructure in Montreal, Quebec (AWS ca-central-1). We do not transfer your data outside Canada except where required by law.</p>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>2. PIPEDA Compliance</h2>
          <p>We comply with PIPEDA. You may access, correct, or delete your data by contacting privacy@spicemaple.ca.</p>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>3. Payment Information</h2>
          <p>Interac E-Transfer — we only use your name to identify the transfer. Stripe card data is handled directly by Stripe and never stored on our servers.</p>
        </> : <>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>1. Pre-Orders & Pickup</h2>
          <p>All orders are pre-orders for local pickup in Toronto. Failure to pick up within 48 hours of the scheduled window may result in cancellation without refund.</p>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>2. Pricing & Taxes</h2>
          <p>All prices are in Canadian dollars (CAD). Ontario HST at 13% is applied at checkout.</p>
          <h2 style={{ color: T.charcoal, fontFamily: "Georgia,serif" }}>3. Governing Law</h2>
          <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada.</p>
        </>}
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background: T.charcoal, borderTop: `3px solid ${T.maple}`, padding: "48px 20px 24px", marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "Georgia,serif", color: T.white, fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🌶️ Spice & Maple</div>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.7 }}>Artisan hot sauces and spice blends crafted with love in Toronto, Ontario.</p>
          </div>
          <div>
            <div style={{ color: T.mapleLight, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Quick Links</div>
            {[["Shop", "shop"], ["Sign In", "auth"]].map(([l, p]) => <div key={l} onClick={() => setPage(p)} style={{ color: "#888", fontSize: 14, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
          </div>
          <div>
            <div style={{ color: T.mapleLight, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Legal</div>
            {[["Privacy Policy", "privacy"], ["Terms of Service", "terms"]].map(([l, p]) => <div key={l} onClick={() => setPage(p)} style={{ color: "#888", fontSize: 14, marginBottom: 8, cursor: "pointer", textDecoration: "underline" }}>{l}</div>)}
          </div>
          <div>
            <div style={{ color: T.mapleLight, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Contact</div>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 6 }}>📧 hello@spicemaple.ca</div>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 6 }}>📍 Toronto, Ontario, Canada</div>
            <div style={{ color: "#888", fontSize: 14 }}>🕐 Mon-Sat, 10AM-5PM EST</div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "#666", fontSize: 12 }}>© 2025 Spice & Maple Artisan Kitchen Co. Toronto, Ontario, Canada.</span>
          <span style={{ color: "#666", fontSize: 12 }}>Data stored in Canada · Timezone: America/Toronto</span>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "shop": return <ShopPage />;
      case "checkout": return <CheckoutPage setPage={setPage} />;
      case "auth": return <AuthPage setPage={setPage} />;
      case "profile": return <ProfilePage setPage={setPage} />;
      case "admin": return <AdminDashboard setPage={setPage} />;
      case "privacy": return <LegalPage type="privacy" setPage={setPage} />;
      case "terms": return <LegalPage type="terms" setPage={setPage} />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <DataProvider>
      <AuthProvider>
        <CartProvider>
          <div style={{ minHeight: "100vh", background: page === "admin" ? T.adminBg : T.cream, fontFamily: "'Trebuchet MS',sans-serif" }}>
            <Nav setPage={setPage} />
            <CartDrawer setPage={setPage} />
            <main>{renderPage()}</main>
            {page !== "admin" && <Footer setPage={setPage} />}
          </div>
        </CartProvider>
      </AuthProvider>
    </DataProvider>
  );
}