import React, { FormEvent, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import QRCode from "qrcode";
import {
  BarChart3,
  Bell,
  Check,
  ChefHat,
  Clock,
  Copy,
  CreditCard,
  Download,
  Pencil,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Menu as MenuIcon,
  Minus,
  PackageCheck,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Smartphone,
  UserPlus,
  Utensils,
  Video,
  X,
} from "lucide-react";
import "./index.css";
import Landing from "./Landing";
import { addCategory, addRatings, createOrder, createOwner, loadState, saveState, upsertFood } from "./data";
import { loadRemoteAppState } from "./services/api";
import { firebaseEnabled, signInWithGoogle } from "./firebase";
import type { AppState, CartLine, Food, Order, OrderStatus, PaymentMethod, Restaurant } from "./types";

const currency = { format: (value: number) => `INR ${Math.round(value).toLocaleString("en-IN")}` };
const statusOrder: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

type GoogleProfile = { uid: string; name: string; email: string; photoURL: string };

function readGoogleProfile(): GoogleProfile | null {
  const raw = sessionStorage.getItem("restaurant-qr-google-profile");
  if (!raw) return null;
  try { return JSON.parse(raw) as GoogleProfile; } catch { return null; }
}

function saveGoogleProfile(profile: GoogleProfile) {
  sessionStorage.setItem("restaurant-qr-google-profile", JSON.stringify(profile));
}

function clearGoogleProfile() {
  sessionStorage.removeItem("restaurant-qr-google-profile");
}

function App() {
  const [state, setStateValue] = useState<AppState>(() => loadState());
  const [path, setPath] = useState(window.location.pathname + window.location.search);
  const [toast, setToast] = useState("");
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const sync = () => setStateValue(loadState());
    window.addEventListener("storage", sync);
    window.addEventListener("restaurant-state-updated", sync);
    const timer = window.setInterval(sync, 2000);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("restaurant-state-updated", sync);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadRemoteAppState().then((remote) => {
      if (!active || !remote) return;
      const hasRemoteData = Boolean(
        remote.restaurants?.length ||
        remote.foods?.length ||
        remote.categories?.length ||
        remote.orders?.length ||
        remote.ratings?.length
      );

      if (!hasRemoteData) return;

      setStateValue((current) => ({
        ...current,
        ...remote,
        owners: current.owners,
        currentOwnerId: current.currentOwnerId,
      }));
    }).catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  function setState(next: AppState) {
    setStateValue(next);
    saveState(next);
  }

  function navigate(to: string) {
    const target = `${basePath}${to.startsWith("/") ? to : `/${to}`}`;
    window.history.pushState({}, "", target);
    setPath(target);
    window.scrollTo({ top: 0 });
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  const route = (path.split("?")[0].replace(basePath, "") || "/");
  const owner = state.owners.find((item) => item.id === state.currentOwnerId);
  const restaurant = state.restaurants.find((item) => item.id === owner?.restaurantId) || state.restaurants[0];

  let screen = <Landing navigate={navigate} restaurant={restaurant} state={state} />;
  if (route === "/login") screen = <Login state={state} setState={setState} navigate={navigate} notify={notify} />;
  if (route === "/signup") screen = <Signup state={state} setState={setState} navigate={navigate} notify={notify} />;
  if (route.startsWith("/dashboard")) {
    screen = owner ? (
      <Dashboard state={state} setState={setState} navigate={navigate} route={route} notify={notify} />
    ) : (
      <Login state={state} setState={setState} navigate={navigate} notify={notify} />
    );
  }
  if (route.startsWith("/menu/")) {
    const id = route.replace("/menu/", "");
    screen = <CustomerMenu state={state} setState={setState} restaurantId={id} navigate={navigate} notify={notify} />;
  }
  if (route.startsWith("/order/")) {
    const id = route.replace("/order/", "");
    screen = <OrderTracking state={state} setState={setState} orderId={id} navigate={navigate} notify={notify} />;
  }

  return (
    <>
      {screen}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft">{toast}</div>}
    </>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "dark" | "light" | "danger" }) {
  const tone = props.tone || "primary";
  const tones = {
    primary: "bg-flame text-white shadow-sm hover:bg-[#d85124] hover:shadow-lift",
    dark: "bg-ink text-white shadow-sm hover:bg-black hover:shadow-lift",
    light: "border border-stone-200 bg-white text-ink shadow-sm hover:border-flame hover:bg-orange-50",
    danger: "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-lift",
  };
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${props.className || ""}`} />;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`min-h-11 w-full rounded-md border border-stone-200 bg-white px-3 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-flame focus:bg-white ${props.className || ""}`} />;
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input {...props} type={visible ? "text" : "password"} className={`pr-11 ${props.className || ""}`} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-white/55 hover:text-white">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-md border border-stone-200 bg-white px-3 py-3 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-flame focus:bg-white ${props.className || ""}`} />;
}

function LegacyLanding({ navigate, restaurant }: { navigate: (to: string) => void; restaurant?: Restaurant }) {
  const sampleMenuUrl = `/menu/${restaurant?.id || "restaurant_demo"}?table=12`;
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [["Features", "features"], ["How It Works", "workflow"], ["Owner Tools", "owner-tools"]] as const;
  const featureCards = [
    { icon: QrCode, title: "QR Menu", text: "Customers scan and instantly browse your digital menu." },
    { icon: ShoppingCart, title: "Online Ordering", text: "Let customers place orders directly from their table." },
    { icon: ChefHat, title: "Live Kitchen Tokens", text: "Keep customers updated with real-time order status." },
    { icon: BarChart3, title: "Owner Dashboard", text: "Manage menus, orders, tables and restaurant settings." },
    { icon: Star, title: "Customer Ratings", text: "Collect feedback and understand what customers love." },
    { icon: Smartphone, title: "No App Required", text: "Customers can order directly from their browser." },
  ];
  const workflow = ["Scan QR", "Explore Menu", "Place Order", "Get Token", "Track Order", "Enjoy Your Food"];

  return (
    <main className="landing-page min-h-screen bg-[#111110] text-white">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-ink/75 text-white backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 text-lg font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-flame shadow-[0_0_28px_rgba(232,93,42,.42)]"><QrCode size={19} /></span> QR Kitchen
          </button>
          <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
            {navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="text-white/65 transition hover:text-white">{label}</a>)}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/login")} className="hidden px-3 text-sm font-bold text-white/75 transition hover:text-white md:block">Login</button>
            <Button className="rounded-xl px-4" onClick={() => navigate("/signup")}>Start</Button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 md:hidden" aria-label="Toggle navigation">{menuOpen ? <X size={19} /> : <MenuIcon size={19} />}</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-white/10 bg-[#151514] px-5 py-4 md:hidden"><div className="mx-auto grid max-w-7xl gap-3 text-sm font-bold text-white/75">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}<button className="text-left" onClick={() => navigate("/login")}>Login</button></div></div>}
      </nav>

      <section className="relative flex min-h-[850px] items-center overflow-hidden pt-20 sm:min-h-[92vh]">
        <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=85" className="absolute inset-0 h-full w-full scale-105 object-cover object-[62%_center] landing-kenburns sm:object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/90 via-[#090909]/64 to-[#111110] sm:bg-gradient-to-r sm:from-[#090909]/95 sm:via-[#090909]/65 sm:to-[#090909]/30" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-flame/20 blur-[130px]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold tracking-[.12em] text-white/85 backdrop-blur sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-flame" /> QR MENU <span className="text-white/30">•</span> ONLINE ORDERING <span className="text-white/30">•</span> LIVE TOKENS
            </div>
            <h1 className="text-5xl font-black leading-[.94] tracking-[-.065em] sm:text-7xl lg:text-8xl">Scan. Order.<br /><span className="text-flame">Enjoy.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">Turn every table into a smarter ordering experience. Customers scan, explore the menu, place orders and track their token without waiting.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={() => navigate("/signup")}><UserPlus size={18} /> Create Restaurant</Button>
              <button onClick={() => navigate(sampleMenuUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 font-semibold backdrop-blur transition hover:border-white hover:bg-white/15"><Eye size={18} /> Explore Menu</button>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm backdrop-blur-xl"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ce4a7] opacity-70" /><span className="relative inline-flex h-3 w-3 rounded-full bg-[#7ce4a7]" /></span><span className="font-bold">LIVE ORDERS</span><span className="text-white/55">24 orders being prepared</span></div>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-x-5 gap-y-5 border-t border-white/15 pt-7 sm:grid-cols-4">
              {[["10K+", "Orders Processed"], ["500+", "Restaurants"], ["4.9★", "Customer Rating"], ["99.9%", "System Uptime"]].map(([big, small]) => <div key={big}><p className="text-2xl font-black tracking-tight">{big}</p><p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/50">{small}</p></div>)}
            </div>
          </div>
          <div className="relative mx-auto block w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-8 rounded-full bg-flame/25 blur-[60px]" />
            <div className="animate-float relative rounded-[28px] border border-white/25 bg-white/15 p-3 shadow-[0_35px_90px_rgba(0,0,0,.46)] backdrop-blur-2xl sm:p-4">
              <img src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=85" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
              <div className="mt-4 rounded-[20px] bg-white p-4 text-ink">
                <div className="flex items-start justify-between">
                  <div><h2 className="text-xl font-black">Paneer Tikka</h2><p className="font-black text-flame">INR 220</p></div>
                  <span className="font-bold"><Star size={16} className="inline fill-amber-400 text-amber-400" /> 4.8</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-porcelain p-3">
                  <span className="font-black">Token #A104</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-black text-green-700">● ORDER READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 sm:py-32">
        <div className="mx-auto mb-12 max-w-2xl text-center"><p className="text-sm font-black uppercase tracking-[.18em] text-flame">Built for better service</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Everything Your Restaurant Needs</h2><p className="mt-4 leading-7 text-white/55">From QR menus to live kitchen tokens, manage the entire ordering journey in one place.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className="group animate-card rounded-2xl border border-white/10 bg-white/[.045] p-6 transition duration-300 hover:-translate-y-1 hover:border-flame/50 hover:bg-white/[.075] hover:shadow-[0_20px_50px_rgba(232,93,42,.12)]" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-flame/15 text-flame transition group-hover:scale-110 group-hover:bg-flame group-hover:text-white"><Icon size={22} /></div>
            <h2 className="font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
          </div>
        ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-white/10 bg-white/[.025] py-24">
        <div className="mx-auto max-w-7xl px-5"><div className="mb-12 text-center"><p className="text-sm font-black uppercase tracking-[.18em] text-flame">Simple by design</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">From table to taste in minutes</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {workflow.map((step, index) => (
              <div key={step} className="relative rounded-2xl border border-white/10 bg-[#181817] p-5">
                <p className="text-sm font-black text-flame">0{index + 1}</p>
                <div className="my-5 h-px w-full bg-gradient-to-r from-flame to-transparent" /><p className="font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-[.75fr_1.25fr]">
        <div className="mx-auto w-full max-w-sm rounded-[36px] border-[9px] border-[#2a2a28] bg-[#080808] p-3 shadow-[0_28px_70px_rgba(0,0,0,.5)]"><div className="overflow-hidden rounded-[25px] bg-[#191918] p-4"><div className="mb-5 flex items-center justify-between text-xs text-white/55"><span>9:41</span><span>●●●</span></div><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85" className="aspect-square w-full rounded-2xl object-cover"/><p className="mt-4 text-lg font-black">Welcome to QR Kitchen</p><p className="mt-1 text-sm text-white/50">Table 12 · Browse the menu</p><div className="mt-4 flex items-center justify-between rounded-xl bg-flame px-4 py-3 text-sm font-bold">Explore menu <span>→</span></div></div></div>
        <div><p className="text-sm font-black uppercase tracking-[.18em] text-flame">Customer experience</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Your Menu.<br />Their Phone.</h2><p className="mt-5 max-w-lg leading-7 text-white/55">A frictionless dining experience that feels natural from the first scan to the final bite.</p><div className="mt-7 grid gap-3 text-sm font-semibold text-white/75">{["No app download", "Fast ordering", "Easy menu browsing", "Live token tracking", "Simple ratings"].map(point => <p key={point} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-flame/15 text-flame"><Check size={14}/></span>{point}</p>)}</div><Button className="mt-8 rounded-xl" onClick={() => navigate(sampleMenuUrl)}><Smartphone size={18} /> Try Customer Menu</Button></div>
      </section>

      <section id="owner-tools" className="border-y border-white/10 bg-[#191918] py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-black uppercase tracking-[.18em] text-flame">Owner tools</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">Control Your Restaurant From One Dashboard</h2><p className="mt-5 leading-7 text-white/55">Know what is happening across every table, order and menu item in real time.</p><Button className="mt-7 rounded-xl" onClick={() => navigate("/dashboard")}><BarChart3 size={18} /> View Dashboard</Button></div>
        <div className="rounded-3xl border border-white/10 bg-[#10100f] p-4 shadow-2xl sm:p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-white/40">Overview</p><p className="mt-1 text-xl font-black">Good evening, Chef</p></div><span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-bold text-green-300">Live</span></div><div className="grid gap-3 sm:grid-cols-4">{[["Today’s Orders", "124"], ["Revenue", "₹18,450"], ["Pending", "18"], ["Completed", "106"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/[.055] p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div><div className="mt-5 overflow-hidden rounded-2xl border border-white/8"><div className="grid grid-cols-4 bg-white/[.04] px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-white/45"><span>Token</span><span>Item</span><span>Table</span><span>Status</span></div>{[["A104", "Paneer Tikka", "T12", "READY"], ["A105", "Butter Naan", "T08", "PREPARING"], ["A106", "Biryani", "T15", "NEW"]].map(row => <div key={row[0]} className="grid grid-cols-4 border-t border-white/8 px-4 py-3 text-xs"><span className="font-bold">{row[0]}</span><span className="text-white/70">{row[1]}</span><span className="text-white/55">{row[2]}</span><span className="font-bold text-flame">{row[3]}</span></div>)}</div></div></div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-12 text-sm text-white/45 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-lg font-black text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-flame"><QrCode size={16}/></span> QR Kitchen</div><p className="mt-3">Smarter ordering. Better dining.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="transition hover:text-white">{label}</a>)}<button onClick={() => navigate(sampleMenuUrl)} className="transition hover:text-white">Customer Menu</button><button onClick={() => navigate("/login")} className="transition hover:text-white">Login</button></div><p>© 2026 QR Kitchen. All rights reserved.</p></footer>
    </main>
  );
}

function Login({ state, setState, navigate, notify }: CommonProps) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const email = data.email.toLowerCase();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: data.password }),
      });

      const user = await response.json();
      if (!response.ok) {
        throw new Error(user?.message || 'Login failed.');
      }

      const owner = state.owners.find((item) => item.email === email) || {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: '',
        password: data.password,
        restaurantId: user.restaurantId || 'restaurant-db',
      };

      setState({ ...state, currentOwnerId: owner.id, owners: [...state.owners.filter((item) => item.email !== email), owner] });
      notify('Welcome back.');
      navigate('/dashboard');
    } catch (error) {
      const owner = state.owners.find((item) => item.email === email && item.password === data.password);
      if (owner) {
        setState({ ...state, currentOwnerId: owner.id });
        notify('Welcome back.');
        navigate('/dashboard');
        return;
      }
      notify(error instanceof Error ? error.message : 'Login failed. Try owner@demo.com / password123.');
    }
  }
  async function googleLogin() {
    if (!firebaseEnabled) return notify("Google sign-in needs Firebase configuration.");
    try {
      const result = await signInWithGoogle();
      const profile: GoogleProfile = { uid: result.user.uid, name: result.user.displayName || "", email: result.user.email || "", photoURL: result.user.photoURL || "" };
      const owner = state.owners.find((item) => item.googleUid === profile.uid || item.email === profile.email.toLowerCase());
      if (owner) {
        setState({ ...state, currentOwnerId: owner.id, owners: state.owners.map((item) => item.id === owner.id ? { ...item, googleUid: profile.uid, photoURL: profile.photoURL, name: item.name || profile.name } : item) });
        return navigate("/dashboard");
      }
      saveGoogleProfile(profile);
      navigate("/signup");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Google sign-in was cancelled.");
    }
  }
  return <AuthShell title="Owner Login" subtitle="Customers never need an account. Owner access is protected.">
    <form onSubmit={submit} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" defaultValue="owner@demo.com" required />
      <PasswordInput name="password" placeholder="Password" defaultValue="password123" required />
      <Button className="w-full">Login</Button>
      <Button type="button" tone="light" className="w-full" onClick={googleLogin}>Continue with Google</Button>
      <div className="flex justify-between text-sm"><button type="button" className="font-semibold text-flame">Forgot Password</button><button type="button" onClick={() => navigate("/signup")} className="font-semibold text-flame">Create Restaurant Account</button></div>
    </form>
  </AuthShell>;
}

function Signup({ state, setState, navigate, notify }: CommonProps) {
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(() => readGoogleProfile());
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    if (!googleProfile && data.password !== data.confirmPassword) return notify("Passwords do not match.");

    try {
      const payload = {
        name: googleProfile ? googleProfile.name : data.ownerName,
        email: (googleProfile ? googleProfile.email : data.email).toLowerCase(),
        password: googleProfile ? '' : data.password,
        role: 'owner',
        googleUid: googleProfile?.uid || null,
        photoURL: googleProfile?.photoURL || '',
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const savedUser = await response.json();
      if (!response.ok) {
        throw new Error(savedUser?.message || 'Unable to save owner profile.');
      }

      const next = createOwner(state, googleProfile ? { ...data, ownerName: googleProfile.name, email: googleProfile.email, password: '', googleUid: googleProfile.uid, photoURL: googleProfile.photoURL } : data);
      const mergedOwners = [...next.owners.filter((item) => item.email !== savedUser.email), {
        ...next.owners[next.owners.length - 1],
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        password: googleProfile ? '' : data.password,
        googleUid: savedUser.googleUid || googleProfile?.uid,
        photoURL: savedUser.photoURL || googleProfile?.photoURL,
      }];

      setState({ ...next, owners: mergedOwners, currentOwnerId: savedUser.id });
      clearGoogleProfile();
      notify('Restaurant profile and MongoDB account created.');
      navigate('/dashboard');
    } catch (error) {
      const next = createOwner(state, googleProfile ? { ...data, ownerName: googleProfile.name, email: googleProfile.email, password: '', googleUid: googleProfile.uid, photoURL: googleProfile.photoURL } : data);
      setState(next);
      clearGoogleProfile();
      notify(error instanceof Error ? error.message : 'Restaurant profile and QR route created.');
      navigate('/dashboard');
    }
  }
  async function googleSignup() {
    if (!firebaseEnabled) return notify("Google sign-in needs Firebase configuration.");
    try {
      const result = await signInWithGoogle();
      const profile: GoogleProfile = { uid: result.user.uid, name: result.user.displayName || "", email: result.user.email || "", photoURL: result.user.photoURL || "" };
      const owner = state.owners.find((item) => item.googleUid === profile.uid || item.email === profile.email.toLowerCase());
      if (owner) {
        setState({ ...state, currentOwnerId: owner.id, owners: state.owners.map((item) => item.id === owner.id ? { ...item, googleUid: profile.uid, photoURL: profile.photoURL, name: item.name || profile.name } : item) });
        return navigate("/dashboard");
      }
      saveGoogleProfile(profile);
      setGoogleProfile(profile);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Google sign-in was cancelled.");
    }
  }
  return <AuthShell title="Register Restaurant Owner" subtitle="Create an owner account and restaurant profile in one step.">
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      {!googleProfile && <Input name="ownerName" placeholder="Owner Name" required />}
      <Input name="restaurantName" placeholder="Restaurant Name" required />
      {!googleProfile && <Input name="email" type="email" placeholder="Email" required />}
      <Input name="mobile" placeholder="Mobile Number" required />
      {!googleProfile && <><PasswordInput name="password" placeholder="Password" required /><PasswordInput name="confirmPassword" placeholder="Confirm Password" required /></>}
      <Input name="address" placeholder="Restaurant Address" className="sm:col-span-2" required />
      <Button className="sm:col-span-2">Signup and Open Dashboard</Button>
      {!googleProfile && <Button type="button" tone="light" className="sm:col-span-2" onClick={googleSignup}>Continue with Google</Button>}
    </form>
  </AuthShell>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="auth-shell flex min-h-screen items-center justify-center bg-[#080808] px-5 py-10">
    <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[.055] shadow-soft backdrop-blur-xl md:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden min-h-[560px] md:block"><img src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=85" className="h-full w-full object-cover" /></div>
      <div className="p-6 text-white sm:p-10"><a href="/" className="mb-8 inline-flex items-center gap-2 font-black"><ChefHat className="text-flame" /> QR Kitchen</a><h1 className="text-3xl font-black">{title}</h1><p className="mb-8 mt-2 text-white/55">{subtitle}</p>{children}</div>
    </section>
  </main>;
}

interface CommonProps {
  state: AppState;
  setState: (state: AppState) => void;
  navigate: (to: string) => void;
  notify: (message: string) => void;
}

function Dashboard({ state, setState, navigate, route, notify }: CommonProps & { route: string }) {
  const owner = state.owners.find((item) => item.id === state.currentOwnerId)!;
  const restaurant = state.restaurants.find((item) => item.id === owner.restaurantId)!;
  const page = route.split("/")[2] || "overview";
  const nav = [
    ["overview", Home, "Overview"], ["analytics", BarChart3, "Analytics"], ["orders", Bell, "Orders"], ["kitchen", ChefHat, "Kitchen"], ["menu", Utensils, "Menu"],
    ["categories", MenuIcon, "Categories"], ["ratings", Star, "Ratings"], ["qr", QrCode, "QR Code"], ["profile", Store, "Profile"], ["settings", Settings, "Settings"],
  ] as const;
  return <main className="dashboard-shell min-h-screen bg-[#080808] text-white lg:grid lg:grid-cols-[280px_1fr]">
    <aside className="sticky top-0 z-20 border-b border-stone-800 bg-ink p-4 text-white lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between lg:block">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xl font-black"><ChefHat className="text-flame" /> {restaurant.name}</button>
        <p className="mt-2 hidden text-xs font-semibold uppercase text-white/45 lg:block">Restaurant Operations</p>
        <Button tone="light" className="lg:hidden" onClick={() => navigate(`/menu/${restaurant.id}?table=12`)}><QrCode size={18} /></Button>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide lg:block lg:space-y-1">
        {nav.map(([key, Icon, label]) => <button key={key} onClick={() => navigate(key === "overview" ? "/dashboard" : `/dashboard/${key}`)} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-semibold transition lg:w-full ${page === key ? "bg-flame text-white shadow-lift" : "text-white/72 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /> {label}</button>)}
      </nav>
      <div className="mt-6 hidden rounded-md border border-white/10 bg-white/5 p-3 lg:block">
        <p className="text-xs font-bold uppercase text-white/45">Status</p>
        <p className="mt-1 font-black text-basil">{restaurant.status === "open" ? "Open for orders" : "Closed"}</p>
      </div>
      <Button tone="light" className="mt-5 hidden w-full lg:flex" onClick={() => setState({ ...state, currentOwnerId: undefined })}><LogOut size={18} /> Logout</Button>
    </aside>
    <section className="min-w-0 p-4 sm:p-5 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-5">
        <div className="min-w-0"><p className="text-sm font-bold uppercase text-flame">Owner Dashboard</p><h1 className="text-3xl font-black capitalize tracking-tight">{page}</h1><p className="mt-1 break-words text-sm text-stone-500">{restaurant.name} · {restaurant.address}</p></div>
        <Button tone="light" className="w-full sm:w-auto" onClick={() => navigate(`/menu/${restaurant.id}?table=12`)}><QrCode size={18} /> Open QR Menu</Button>
      </div>
      {page === "overview" && <Overview state={state} restaurant={restaurant} />}
      {page === "analytics" && <Analytics state={state} restaurant={restaurant} />}
      {page === "orders" && <OrdersPanel state={state} setState={setState} restaurant={restaurant} />}
      {page === "kitchen" && <KitchenPanel state={state} setState={setState} restaurant={restaurant} />}
      {page === "menu" && <MenuManager state={state} setState={setState} restaurant={restaurant} notify={notify} />}
      {page === "categories" && <CategoryManager state={state} setState={setState} restaurant={restaurant} notify={notify} />}
      {page === "ratings" && <RatingsPanel state={state} restaurant={restaurant} />}
      {page === "qr" && <QrPanel restaurant={restaurant} notify={notify} />}
      {page === "profile" && <ProfilePanel state={state} setState={setState} restaurant={restaurant} notify={notify} />}
      {page === "settings" && <SettingsPanel />}
    </section>
  </main>;
}

function restaurantMetrics(state: AppState, restaurantId: string) {
  const orders = state.orders.filter((order) => order.restaurantId === restaurantId);
  const validOrders = orders.filter((order) => order.orderStatus !== "REJECTED");
  const foods = state.foods.filter((food) => food.restaurantId === restaurantId);
  const ratings = state.ratings.filter((rating) => rating.restaurantId === restaurantId);
  const unique = (values: string[]) => new Set(values.filter(Boolean)).size;
  const sales = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
  const inRange = (start: Date) => validOrders.filter((order) => new Date(order.createdAt) >= start);
  const profitOrders = validOrders.filter((order) => typeof order.profit === "number");
  const salesBy = (key: (order: Order) => string) => {
    const result = new Map<string, number>();
    validOrders.forEach((order) => result.set(key(order), (result.get(key(order)) || 0) + order.totalAmount));
    return [...result.entries()].sort((a, b) => b[1] - a[1]);
  };
  const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  validOrders.forEach((order) => order.items.forEach((item) => {
    const current = itemSales.get(item.foodId) || { name: item.name, quantity: 0, revenue: 0 };
    current.quantity += item.quantity;
    current.revenue += item.quantity * item.price;
    itemSales.set(item.foodId, current);
  }));
  const productSales = foods.map((food) => ({ ...food, ...(itemSales.get(food.id) || { quantity: 0, revenue: 0 }) })).sort((a, b) => b.quantity - a.quantity);
  const categorySales = new Map<string, number>();
  validOrders.forEach((order) => order.items.forEach((item) => {
    const food = foods.find((entry) => entry.id === item.foodId);
    const category = state.categories.find((entry) => entry.id === food?.categoryId)?.name || "Uncategorised";
    categorySales.set(category, (categorySales.get(category) || 0) + item.quantity * item.price);
  }));
  const peakHours = new Map<number, number>();
  validOrders.forEach((order) => { const hour = new Date(order.createdAt).getHours(); peakHours.set(hour, (peakHours.get(hour) || 0) + 1); });
  const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
  return {
    orders,
    validOrders,
    sales,
    customers: unique(validOrders.map((order) => order.customerSessionId)),
    averageOrder: validOrders.length ? sales / validOrders.length : 0,
    averageRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length : 0,
    activeTables: unique(validOrders.filter((order) => !["COMPLETED", "REJECTED"].includes(order.orderStatus) && order.tableNumber !== "Takeaway").map((order) => order.tableNumber)),
    daily: inRange(startOfDay),
    monthly: inRange(startOfMonth),
    profit: profitOrders.length ? profitOrders.reduce((sum, order) => sum + (order.profit || 0), 0) : undefined,
    productSales,
    categorySales: [...categorySales.entries()].sort((a, b) => b[1] - a[1]),
    orderTypes: salesBy((order) => order.orderType || (order.tableNumber === "Takeaway" ? "Takeaway" : "Dine-in")),
    paymentMethods: salesBy((order) => order.paymentMethod),
    tablePerformance: salesBy((order) => order.tableNumber),
    peakHours: [...peakHours.entries()].sort((a, b) => b[1] - a[1]).map(([hour, count]) => [`${formatHour(hour)}-${formatHour((hour + 1) % 24)}`, count] as [string, number]),
  };
}

function Overview({ state, restaurant }: { state: AppState; restaurant: Restaurant }) {
  const metrics = restaurantMetrics(state, restaurant.id);
  const orders = metrics.orders;
  const foods = state.foods.filter((item) => item.restaurantId === restaurant.id);
  const avg = metrics.averageRating;
  const stats = [
    ["Total orders", metrics.validOrders.length, Bell], ["Total customers", metrics.customers, UserPlus],
    ["Total sales", currency.format(metrics.sales), CreditCard], ["Average order value", currency.format(metrics.averageOrder), BarChart3],
    ["Active tables", metrics.activeTables, Store], ["Daily sales", currency.format(metrics.daily.reduce((sum, order) => sum + order.totalAmount, 0)), Clock],
    ["Monthly sales", currency.format(metrics.monthly.reduce((sum, order) => sum + order.totalAmount, 0)), BarChart3], ["Average rating", avg ? avg.toFixed(1) : "No ratings", Star],
    ["Pending orders", orders.filter((o) => o.orderStatus === "PLACED").length, Clock],
    ["Preparing orders", orders.filter((o) => o.orderStatus === "PREPARING").length, ChefHat], ["Ready orders", orders.filter((o) => o.orderStatus === "READY").length, PackageCheck],
    ["Completed orders", orders.filter((o) => o.orderStatus === "COMPLETED").length, ShoppingCart],
    ["Total menu items", foods.length, Utensils], ["Average rating", avg.toFixed(1), Star],
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon], index) => <div key={`${label}-${index}`} className="rounded-md border border-stone-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-stone-500">{label}</p><span className="grid h-10 w-10 place-items-center rounded-md bg-flame/10 text-flame"><Icon size={19} /></span></div><p className="mt-2 text-3xl font-black tracking-tight">{value}</p></div>)}<div className="rounded-md border border-stone-200 bg-white p-5 shadow-soft md:col-span-2 xl:col-span-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Top-selling products</h2><p className="text-sm text-stone-500">Based on actual order quantities</p></div><span className="rounded-md bg-basil/10 px-3 py-1 text-sm font-black text-basil">{foods.length} active items</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{metrics.productSales.slice(0,3).map(food=><FoodMini key={food.id} food={food} />)}</div></div><div className="grid gap-4 md:col-span-2 xl:col-span-4 xl:grid-cols-2"><AnalyticsList title="Low-performing products" empty="No menu products yet." rows={metrics.productSales.slice(-5).reverse().map(food => [food.name, `${food.quantity} sold`, currency.format(food.revenue)])}/><AnalyticsList title="Sales by category" empty="No category sales yet." rows={metrics.categorySales.slice(0,5).map(([name, value]) => [name, currency.format(value), ""])} /></div></div>;
}

function Analytics({ state, restaurant }: { state: AppState; restaurant: Restaurant }) {
  const [period, setPeriod] = useState("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const metrics = restaurantMetrics(state, restaurant.id);
  const ranges = [["today", "Daily"], ["yesterday", "Yesterday"], ["7d", "Weekly"], ["30d", "30 Days"], ["month", "Monthly"], ["lastMonth", "Last Month"], ["custom", "Custom"]] as const;
  const data = useMemo(() => {
    const now = new Date();
    const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
    let start = new Date(0);
    let end = new Date(now.getTime() + 1);
    if (period === "today") start = startOfDay(now);
    if (period === "yesterday") { end = startOfDay(now); start = new Date(end); start.setDate(start.getDate() - 1); }
    if (period === "7d") { start = startOfDay(now); start.setDate(start.getDate() - 6); }
    if (period === "30d") { start = startOfDay(now); start.setDate(start.getDate() - 29); }
    if (period === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === "lastMonth") { start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 1); }
    if (period === "custom") { if (customStart) start = new Date(`${customStart}T00:00:00`); if (customEnd) end = new Date(`${customEnd}T23:59:59.999`); }
    const orders = state.orders.filter(order => order.restaurantId === restaurant.id && order.orderStatus !== "REJECTED" && new Date(order.createdAt) >= start && new Date(order.createdAt) <= end);
    const sales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const itemStats = new Map<string, { name: string; quantity: number; revenue: number; rating: number }>();
    orders.forEach(order => order.items.forEach(item => { const food = state.foods.find(f => f.id === item.foodId); const current = itemStats.get(item.foodId) || { name: item.name, quantity: 0, revenue: 0, rating: food?.averageRating || 0 }; current.quantity += item.quantity; current.revenue += item.quantity * item.price; itemStats.set(item.foodId, current); }));
    const daily = new Map<string, { label: string; sales: number; orders: number }>();
    orders.forEach(order => { const date = new Date(order.createdAt); const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); const current = daily.get(key) || { label: key, sales: 0, orders: 0 }; current.sales += order.totalAmount; current.orders += 1; daily.set(key, current); });
    const categoryStats = new Map<string, number>();
    orders.forEach(order => order.items.forEach(item => { const food = state.foods.find(f => f.id === item.foodId); const category = state.categories.find(c => c.id === food?.categoryId)?.name || "Uncategorised"; categoryStats.set(category, (categoryStats.get(category) || 0) + item.price * item.quantity); }));
    return { orders, sales, items: [...itemStats.values()].sort((a, b) => b.quantity - a.quantity), daily: [...daily.values()], categories: [...categoryStats.entries()].sort((a, b) => b[1] - a[1]), ratings: state.ratings.filter(r => r.restaurantId === restaurant.id && new Date(r.createdAt) >= start && new Date(r.createdAt) <= end) };
  }, [state, restaurant.id, period, customStart, customEnd]);
  const avgOrder = data.orders.length ? data.sales / data.orders.length : 0;
  const averageRating = data.ratings.length ? data.ratings.reduce((sum, rating) => sum + rating.rating, 0) / data.ratings.length : 0;
  const metricCards: [string, string, typeof CreditCard][] = [["Total sales", currency.format(data.sales), CreditCard], ["Total orders", String(data.orders.length), Bell], ["Total customers", String(new Set(data.orders.map(order => order.customerSessionId).filter(Boolean)).size), UserPlus], ["Average order value", currency.format(avgOrder), BarChart3], ["Customer rating", averageRating ? `${averageRating.toFixed(1)} ★` : "No ratings", Star]];
  if (metrics.profit !== undefined) metricCards.push(["Total profit", currency.format(metrics.profit), CreditCard]);
  const maxDaily = Math.max(...data.daily.map(day => day.sales), 1);
  const statuses: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "REJECTED"];
  return <div className="analytics-grid space-y-5">
    <div className="flex flex-wrap gap-2">{ranges.map(([key, label]) => <button key={key} onClick={() => setPeriod(key)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${period === key ? "bg-flame text-white shadow-lift" : "border border-white/10 bg-white/[.04] text-white/60 hover:text-white"}`}>{label}</button>)}</div>
    {period === "custom" && <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:grid-cols-2"><label className="text-sm font-semibold text-white/70">Start date<Input type="date" value={customStart} onChange={event => setCustomStart(event.target.value)} className="mt-2 dark-input" /></label><label className="text-sm font-semibold text-white/70">End date<Input type="date" value={customEnd} onChange={event => setCustomEnd(event.target.value)} className="mt-2 dark-input" /></label></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.045] p-5 shadow-soft"><div className="flex justify-between"><p className="text-sm font-semibold text-white/45">{label}</p><Icon className="text-flame" size={19}/></div><p className="mt-3 text-3xl font-black">{value}</p></div>)}</div>
    {data.orders.length ? <><section className="rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-widest text-flame">Sales overview</p><h2 className="mt-1 text-2xl font-black">Revenue by day</h2></div><p className="text-sm text-white/45">Actual order data</p></div><div className="mt-8 flex h-52 items-end gap-2 overflow-x-auto pb-7">{data.daily.map(day => <div key={day.label} className="group relative flex h-full min-w-10 flex-1 items-end"><div title={`${day.label}: ${currency.format(day.sales)} · ${day.orders} orders`} className="w-full rounded-t-lg bg-gradient-to-t from-flame to-[#ff956b] transition group-hover:brightness-125" style={{ height: `${Math.max(7, (day.sales / maxDaily) * 100)}%` }} /><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/40">{day.label}</span></div>)}</div></section>
      <div className="grid gap-5 xl:grid-cols-2"><AnalyticsList title="Top Selling Items" empty="No item sales in this period." rows={data.items.slice(0, 5).map(item => [item.name, `${item.quantity} sold · ${currency.format(item.revenue)}`, `${item.rating.toFixed(1)} ★`])}/><AnalyticsList title="Low-performing Products" empty="No item sales in this period." rows={data.items.slice(-5).reverse().map(item => [item.name, `${item.quantity} sold`, currency.format(item.revenue)])}/><AnalyticsList title="Revenue by Category" empty="No category sales in this period." rows={data.categories.slice(0, 5).map(([name, revenue]) => [name, currency.format(revenue), `${data.sales ? Math.round(revenue / data.sales * 100) : 0}%`])}/></div>
      <div className="grid gap-5 xl:grid-cols-2"><AnalyticsList title="Order Type" empty="No order type data." rows={metrics.orderTypes.map(([name, value]) => [name, currency.format(value), ""])} /><AnalyticsList title="Payment Method" empty="No payment data." rows={metrics.paymentMethods.map(([name, value]) => [name, currency.format(value), ""])} /><AnalyticsList title="Table Performance" empty="No table orders." rows={metrics.tablePerformance.slice(0, 5).map(([name, value]) => [name, currency.format(value), ""])} /><AnalyticsList title="Peak Ordering Hours" empty="No order timing data." rows={metrics.peakHours.slice(0, 5).map(([name, value]) => [name, `${value} orders`, ""])} /></div>
      <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-black">Order status</h2><div className="mt-5 space-y-4">{statuses.map(status => { const count = data.orders.filter(order => order.orderStatus === status).length; const percent = data.orders.length ? Math.round(count / data.orders.length * 100) : 0; return <div key={status}><div className="flex justify-between text-xs font-bold"><span>{status}</span><span className="text-white/45">{count} · {percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-flame" style={{ width: `${percent}%` }}/></div></div>; })}</div></section><section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]"><div className="p-5"><h2 className="font-black">Recent Orders</h2></div><div className="min-w-[540px]"><div className="grid grid-cols-5 border-y border-white/10 bg-white/[.03] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40"><span>Token</span><span>Items</span><span>Table</span><span>Amount</span><span>Status</span></div>{data.orders.slice(0, 5).map(order => <div key={order.id} className="grid grid-cols-5 border-b border-white/5 px-5 py-3 text-xs"><span className="font-bold">{order.tokenNumber}</span><span className="truncate text-white/65">{order.items.map(item => item.name).join(", ")}</span><span className="text-white/55">{order.tableNumber}</span><span>{currency.format(order.totalAmount)}</span><span className="font-bold text-flame">{order.orderStatus}</span></div>)}</div></section></div>
      <AnalyticsList title="Customer Feedback" empty="No completed-order reviews for this period." rows={data.ratings.slice(0, 5).map(rating => [state.foods.find(food => food.id === rating.foodId)?.name || "Menu item", `${rating.rating} ★`, rating.review || "No written review"])}/></> : <Empty text="No sales data available for this period. Orders placed through your QR menu will appear here automatically." />}
  </div>;
}

function AnalyticsList({ title, rows, empty }: { title: string; rows: string[][]; empty: string }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-black">{title}</h2>{rows.length ? <div className="mt-4 space-y-3">{rows.map((row, index) => <div key={`${row[0]}-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-white/8 pt-3 text-sm"><span className="font-semibold">{row[0]}</span><span className="text-white/50">{row[1]}</span><span className="font-bold text-flame">{row[2]}</span></div>)}</div> : <p className="mt-4 text-sm text-white/45">{empty}</p>}</section>;
}

function FoodMini({ food }: { food: Food }) {
  return <div className="flex items-center gap-3 rounded-md border border-stone-100 p-3"><img src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"} className="h-14 w-14 rounded-md object-cover" /><div><p className="font-bold">{food.name}</p><p className="text-sm text-stone-500"><Star size={14} className="inline fill-amber-400 text-amber-400" /> {food.averageRating} · {food.totalRatings} ratings</p></div></div>;
}

function OrderCard({ order, update, kitchen = false }: { order: Order; update: (status: OrderStatus) => void; kitchen?: boolean }) {
  return <article className="rounded-md border border-stone-200 bg-white p-5 shadow-soft">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-flame">TOKEN #{order.tokenNumber}</p><h3 className="text-xl font-black">Table {order.tableNumber}</h3></div><span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-black">{order.orderStatus}</span></div>
    <div className="my-4 space-y-2">{order.items.map((item) => <div key={item.foodId} className="flex justify-between text-sm"><span>{item.name} x {item.quantity}</span><span>{currency.format(item.price * item.quantity)}</span></div>)}</div>
    {!kitchen && <p className="mb-4 font-black">Total: {currency.format(order.totalAmount)}</p>}
    <div className="flex flex-wrap gap-2">
      {order.orderStatus === "PLACED" && !kitchen && <><Button onClick={() => update("ACCEPTED")}>Accept</Button><Button tone="danger" onClick={() => update("REJECTED")}>Reject</Button></>}
      {(order.orderStatus === "ACCEPTED" || order.orderStatus === "PLACED") && kitchen && <Button onClick={() => update("PREPARING")}><ChefHat size={18} /> Start Preparing</Button>}
      {order.orderStatus === "PREPARING" && <Button onClick={() => update("READY")}><PackageCheck size={18} /> Mark Ready</Button>}
      {order.orderStatus === "READY" && !kitchen && <Button tone="dark" onClick={() => update("COMPLETED")}>Complete</Button>}
    </div>
  </article>;
}

function OrdersPanel({ state, setState, restaurant }: { state: AppState; setState: (state: AppState) => void; restaurant: Restaurant }) {
  const [tab, setTab] = useState<OrderStatus>("PLACED");
  const tabs: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "REJECTED"];
  const orders = state.orders.filter((item) => item.restaurantId === restaurant.id && item.orderStatus === tab);
  const update = (id: string, status: OrderStatus) => setState({ ...state, orders: state.orders.map((order) => order.id === id ? { ...order, orderStatus: status } : order) });
  return <><div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">{tabs.map(item => <button key={item} onClick={() => setTab(item)} className={`min-h-10 shrink-0 rounded-md px-3 text-sm font-bold ${tab === item ? "bg-ink text-white" : "bg-white"}`}>{item}</button>)}</div><div className="grid gap-4 lg:grid-cols-2">{orders.length ? orders.map(order => <OrderCard key={order.id} order={order} update={(status) => update(order.id, status)} />) : <Empty text="No orders in this status." />}</div></>;
}

function KitchenPanel({ state, setState, restaurant }: { state: AppState; setState: (state: AppState) => void; restaurant: Restaurant }) {
  const orders = state.orders.filter((item) => item.restaurantId === restaurant.id && ["ACCEPTED", "PREPARING"].includes(item.orderStatus));
  const update = (id: string, status: OrderStatus) => setState({ ...state, orders: state.orders.map((order) => order.id === id ? { ...order, orderStatus: status } : order) });
  return <div className="grid gap-4 xl:grid-cols-3">{orders.length ? orders.map(order => <OrderCard key={order.id} order={order} kitchen update={(status) => update(order.id, status)} />) : <Empty text="Kitchen queue is clear." />}</div>;
}

function MenuManager({ state, setState, restaurant, notify }: { state: AppState; setState: (state: AppState) => void; restaurant: Restaurant; notify: (message: string) => void }) {
  const categories = state.categories.filter((item) => item.restaurantId === restaurant.id);
  const foods = state.foods.filter((item) => item.restaurantId === restaurant.id);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    setState(upsertFood(state, { id: editingFood?.id, restaurantId: restaurant.id, name: data.name, categoryId: data.categoryId, price: Number(data.price), description: data.description, imageUrl: data.imageUrl, videoUrl: data.videoUrl, preparationTime: Number(data.preparationTime), available: data.available === "on" }));
    setEditingFood(null);
    event.currentTarget.reset();
    notify(editingFood ? "Food item updated." : "Food item saved.");
  }
  const remove = (id: string) => setState({ ...state, foods: state.foods.filter((item) => item.id !== id) });
  return <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
    <form key={editingFood?.id || "new-food"} onSubmit={submit} className="rounded-md border border-stone-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{editingFood ? "Edit Food" : "Add Food"}</h2>
        {editingFood && <Button type="button" tone="light" onClick={() => setEditingFood(null)}><X size={16} /> Cancel</Button>}
      </div>
      <div className="space-y-3">
        <Input name="name" placeholder="Food Name" defaultValue={editingFood?.name} required />
        <select name="categoryId" defaultValue={editingFood?.categoryId || categories[0]?.id} className="min-h-11 w-full rounded-md border border-stone-200 px-3">
          {categories.map(cat => <option value={cat.id} key={cat.id}>{cat.name}</option>)}
        </select>
        <Input name="price" type="number" placeholder="Price" defaultValue={editingFood?.price} required />
        <Textarea name="description" placeholder="Description" defaultValue={editingFood?.description} />
        <Input name="imageUrl" placeholder="Food Image URL" defaultValue={editingFood?.imageUrl} />
        <Input name="videoUrl" placeholder="Short Video URL" defaultValue={editingFood?.videoUrl} />
        <Input name="preparationTime" type="number" placeholder="Preparation Time" defaultValue={editingFood?.preparationTime || 15} />
        <label className="flex items-center gap-2 text-sm font-bold"><input name="available" type="checkbox" defaultChecked={editingFood?.available ?? true} /> Available</label>
        <Button className="w-full">{editingFood ? <Pencil size={18} /> : <Plus size={18} />} {editingFood ? "Update Food" : "Save Food"}</Button>
      </div>
    </form>
    <div className="grid gap-4 md:grid-cols-2">
      {foods.map(food => <article key={food.id} className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <img src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85"} className="mb-3 aspect-[4/3] w-full rounded-md object-cover" />
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="font-black">{food.name}</h3><p className="text-stone-500">{currency.format(food.price)} · {food.preparationTime} min</p></div>
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${food.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{food.available ? "Available" : "Hidden"}</span>
        </div>
        <p className="mt-2 text-sm text-stone-600">{food.description}</p>
        <div className="mt-4 flex flex-nowrap justify-end gap-2">
          <Button tone="light" className="h-10 w-10 px-0" title="Edit food" aria-label="Edit food" onClick={() => setEditingFood(food)}><Pencil size={16} /></Button>
          <Button tone="light" className="h-10 w-10 px-0" title="Duplicate food" aria-label="Duplicate food" onClick={() => setState(upsertFood(state, { ...food, id: undefined, name: `${food.name} Copy` }))}><Copy size={16} /></Button>
          <Button tone="danger" className="h-10 w-10 px-0" title="Delete food" aria-label="Delete food" onClick={() => remove(food.id)}><X size={16} /></Button>
        </div>
      </article>)}
    </div>
  </div>;
}

function CategoryManager({ state, setState, restaurant, notify }: { state: AppState; setState: (state: AppState) => void; restaurant: Restaurant; notify: (message: string) => void }) {
  const categories = state.categories.filter((item) => item.restaurantId === restaurant.id).sort((a, b) => a.sortOrder - b.sortOrder);
  return <div className="rounded-md border border-stone-200 bg-white p-5 shadow-soft"><form onSubmit={(event) => { event.preventDefault(); const name = new FormData(event.currentTarget).get("name") as string; setState(addCategory(state, restaurant.id, name)); event.currentTarget.reset(); notify("Category added."); }} className="mb-5 flex flex-col gap-2 sm:flex-row"><Input name="name" placeholder="New category" required /><Button className="w-full sm:w-auto"><Plus size={18} /> Add</Button></form><div className="grid gap-3">{categories.map((cat, index) => <div key={cat.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-stone-100 p-3"><Input value={cat.name} onChange={(e) => setState({ ...state, categories: state.categories.map(item => item.id === cat.id ? { ...item, name: e.target.value } : item) })} className="max-w-xs" /><div className="flex flex-wrap gap-2"><Button tone="light" onClick={() => setState({ ...state, categories: state.categories.map(item => item.id === cat.id ? { ...item, active: !item.active } : item) })}>{cat.active ? "Hide" : "Show"}</Button><Button tone="light" disabled={index === 0} onClick={() => setState({ ...state, categories: state.categories.map(item => item.id === cat.id ? { ...item, sortOrder: item.sortOrder - 1 } : item) })}>Up</Button><Button tone="danger" onClick={() => setState({ ...state, categories: state.categories.filter(item => item.id !== cat.id) })}>Delete</Button></div></div>)}</div></div>;
}

function RatingsPanel({ state, restaurant }: { state: AppState; restaurant: Restaurant }) {
  const ratings = state.ratings.filter((item) => item.restaurantId === restaurant.id);
  const foods = state.foods.filter((item) => item.restaurantId === restaurant.id).sort((a, b) => b.averageRating - a.averageRating);
  const overall = foods.length ? (foods.reduce((s, food) => s + food.averageRating, 0) / foods.length).toFixed(1) : "0.0";
  return <div className="grid gap-5 lg:grid-cols-[320px_1fr]"><div className="rounded-md border border-stone-200 bg-white p-6 text-center shadow-soft"><Star className="mx-auto fill-amber-400 text-amber-400" size={42} /><p className="mt-3 text-5xl font-black">{overall}</p><p className="text-stone-500">Total Reviews: {ratings.length}</p></div><div className="rounded-md border border-stone-200 bg-white p-5 shadow-soft"><h2 className="mb-4 font-black">Food-wise ratings</h2>{foods.map(food => <FoodMini key={food.id} food={food} />)}<h2 className="mb-3 mt-6 font-black">Recent reviews</h2>{ratings.length ? ratings.slice(0, 6).map(rating => <p key={rating.id} className="border-t border-stone-100 py-3"><Star size={14} className="inline fill-amber-400 text-amber-400" /> {rating.rating} · {rating.review || "No written review"}</p>) : <p className="text-stone-500">Completed customers can submit verified ratings.</p>}</div></div>;
}

function QrPanel({ restaurant, notify }: { restaurant: Restaurant; notify: (message: string) => void }) {
  const [table, setTable] = useState("12");
  const [qr, setQr] = useState("");
  const url = `${window.location.origin}/menu/${restaurant.id}${table ? `?table=${table}` : ""}`;
  useEffect(() => { QRCode.toDataURL(url, { width: 280, margin: 2 }).then(setQr); }, [url]);
  return <div className="rounded-md border border-stone-200 bg-white p-6 shadow-soft"><h2 className="text-xl font-black">Your Restaurant QR</h2><p className="mt-1 break-all text-stone-600">{url}</p><div className="my-6 flex flex-wrap items-center gap-6">{qr && <img src={qr} className="h-72 w-72 rounded-md border border-stone-200 p-3" />}<div className="space-y-3"><Input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Table number, optional" /><Button onClick={() => { navigator.clipboard.writeText(url); notify("QR menu URL copied."); }}><Copy size={18} /> Copy URL</Button><a href={qr} download={`${restaurant.id}-qr.png`}><Button type="button" tone="light"><Download size={18} /> Download QR</Button></a><Button tone="light" onClick={() => window.print()}><Printer size={18} /> Print QR</Button></div></div></div>;
}

function ProfilePanel({ state, setState, restaurant, notify }: { state: AppState; setState: (state: AppState) => void; restaurant: Restaurant; notify: (message: string) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    setState({ ...state, restaurants: state.restaurants.map((item) => item.id === restaurant.id ? { ...item, ...data, status: data.status as Restaurant["status"] } : item) });
    notify("Restaurant profile updated.");
  }
  return <form onSubmit={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-5 shadow-soft md:grid-cols-2"><Input name="name" defaultValue={restaurant.name} placeholder="Restaurant Name" /><Input name="logo" defaultValue={restaurant.logo} placeholder="Logo URL" /><Input name="coverImage" defaultValue={restaurant.coverImage} placeholder="Cover Image URL" /><Input name="address" defaultValue={restaurant.address} placeholder="Address" /><Input name="phone" defaultValue={restaurant.phone} placeholder="Phone" /><Input name="email" defaultValue={restaurant.email} placeholder="Email" /><Input name="openingTime" type="time" defaultValue={restaurant.openingTime} /><Input name="closingTime" type="time" defaultValue={restaurant.closingTime} /><Textarea name="description" defaultValue={restaurant.description} className="md:col-span-2" /><select name="status" defaultValue={restaurant.status} className="min-h-11 rounded-md border border-stone-200 px-3"><option value="open">Open</option><option value="closed">Closed</option></select><Button>Save Profile</Button></form>;
}

function SettingsPanel() {
  return <div className="grid gap-4 md:grid-cols-2"><Info title="Payment-ready design" text="Orders include payment method and payment status, with no sensitive card data stored." /><Info title="Future modules" text="Branches, staff, coupons, billing, POS, inventory, and notifications can attach to restaurantId." /><Info title="Storage paths" text="Use restaurants/{restaurantId}, foods/{restaurantId}/{foodId}, and qr/{restaurantId} in Firebase Storage." /><Info title="Demo credentials" text="owner@demo.com / password123" /></div>;
}

function Info({ title, text }: { title: string; text: string }) {
  return <div className="rounded-md border border-stone-200 bg-white p-5 shadow-soft"><h3 className="font-black">{title}</h3><p className="mt-2 text-stone-600">{text}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">{text}</div>;
}

function isYouTubeUrl(url: string) {
  try {
    return /(^|\.)youtube\.com|(^|\.)youtu\.be/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function CustomerMenu({ state, setState, restaurantId, navigate, notify }: CommonProps & { restaurantId: string }) {
  const params = new URLSearchParams(window.location.search);
  const restaurant = state.restaurants.find((item) => item.id === restaurantId);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState(params.get("search") || "");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  if (!restaurant) return <main className="p-8"><Empty text="Restaurant not found." /></main>;
  const activeRestaurant = restaurant;
  const categories = state.categories.filter((item) => item.restaurantId === activeRestaurant.id && item.active);
  const foods = state.foods.filter((food) => food.restaurantId === activeRestaurant.id && food.available && (category === "All" || food.categoryId === category) && food.name.toLowerCase().includes(search.toLowerCase()));
  const subtotal = cart.reduce((sum, line) => sum + (state.foods.find((food) => food.id === line.foodId)?.price || 0) * line.quantity, 0);
  const table = params.get("table") || "";
  const cartCount = cart.reduce((s, line) => s + line.quantity, 0);
  const add = (foodId: string, quantity = 1) => setCart((lines) => lines.some((line) => line.foodId === foodId) ? lines.map((line) => line.foodId === foodId ? { ...line, quantity: Math.max(0, line.quantity + quantity) } : line).filter((line) => line.quantity > 0) : [...lines, { foodId, quantity }]);
  const openVideo = (url: string) => {
    if (isYouTubeUrl(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setVideo(url);
  };
  function placeOrder() {
    if (!cart.length) return notify("Add food before placing an order.");
    const created = createOrder(state, activeRestaurant.id, table, cart, paymentMethod);
    setState(created.state);
    setCart([]);
    notify(`Order #${created.order.tokenNumber} placed.`);
    navigate(`/order/${created.order.id}`);
  }
  return <main className="customer-shell min-h-screen bg-[#080808] pb-32 text-white">
    <header className="relative overflow-hidden">
      <img src={restaurant.coverImage} className="h-72 w-full object-cover sm:h-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute bottom-5 left-4 right-4 text-white sm:bottom-7">
        <div className="mx-auto flex max-w-5xl items-end gap-4">
          {restaurant.logo && <img src={restaurant.logo} className="h-20 w-20 rounded-md border-2 border-white/80 object-cover shadow-lift" />}
          <div className="min-w-0">
            <div className="mb-2 inline-flex rounded-md bg-white/15 px-3 py-1 text-xs font-black uppercase backdrop-blur">{restaurant.status === "open" ? "Open now" : "Closed"}</div>
            <h1 className="text-4xl font-black tracking-tight">{restaurant.name}</h1>
            <p className="mt-1 text-sm text-white/85">{restaurant.address} · Table {table || "Takeaway"}</p>
          </div>
        </div>
      </div>
    </header>
    {restaurant.status === "closed" ? <div className="mx-4 mt-5 rounded-md bg-red-100 p-4 font-bold text-red-700">Restaurant is currently closed.</div> : <>
      <section className="sticky top-0 z-10 border-b border-white/10 bg-[#080808]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes, drinks, and desserts" className="pl-10" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setCategory("All")} className={`min-h-10 shrink-0 rounded-md px-4 text-sm font-black transition ${category === "All" ? "bg-ink text-white shadow-lift" : "bg-white text-stone-700 shadow-sm hover:text-flame"}`}>All</button>
            {categories.map(cat => <button key={cat.id} onClick={() => setCategory(cat.id)} className={`min-h-10 shrink-0 rounded-md px-4 text-sm font-black transition ${category === cat.id ? "bg-ink text-white shadow-lift" : "bg-white text-stone-700 shadow-sm hover:text-flame"}`}>{cat.name}</button>)}
          </div>
        </div>
      </section>
      <section className="grid gap-5 px-4 pt-5 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl">
        {foods.map(food => <article key={food.id} className="group overflow-hidden rounded-md border border-stone-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
          <div className="relative">
            <img src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85"} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2 py-1 text-xs font-black text-ink shadow-sm">{food.preparationTime} min</span>
          </div>
          <div className="p-4">
            <div className="flex justify-between gap-3">
              <div><h2 className="text-xl font-black tracking-tight">{food.name}</h2><p className="font-black text-flame">{currency.format(food.price)}</p></div>
              <p className="shrink-0 text-sm font-bold"><Star size={15} className="inline fill-amber-400 text-amber-400" /> {food.averageRating} ({food.totalRatings})</p>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{food.description}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {food.videoUrl ? <Button tone="light" className="flex-1 sm:flex-none" onClick={() => openVideo(food.videoUrl)}><Video size={16} /> Watch Video</Button> : <span className="text-sm text-stone-400">No video</span>}
              <div className="flex items-center gap-2 rounded-md bg-stone-50 p-1">
                <Button tone="light" className="h-9 min-h-9 w-9 px-0" onClick={() => add(food.id, -1)}><Minus size={16} /></Button>
                <span className="w-7 text-center font-black">{cart.find(line => line.foodId === food.id)?.quantity || 0}</span>
                <Button className="h-9 min-h-9 w-9 px-0" onClick={() => add(food.id)}><Plus size={16} /></Button>
              </div>
            </div>
          </div>
        </article>)}
      </section>
    </>}
    {cart.length > 0 && <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 p-4 shadow-lift backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div><p className="font-black"><ShoppingCart className="inline" size={18} /> Cart · {cartCount} items</p><p className="text-sm text-stone-500">Table {table || "Takeaway"} · Subtotal {currency.format(subtotal)}</p></div>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="min-h-11 rounded-md border border-stone-200 bg-white px-3 shadow-sm">
          <option>Cash</option>
          <option>Online Payment</option>
        </select>
        <Button className="w-full sm:w-auto" onClick={placeOrder}><CreditCard size={18} /> Place Order</Button>
      </div>
    </div>}
    {video && <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-md bg-white p-3">
        <div className="mb-2 flex justify-end"><Button tone="light" onClick={() => setVideo(null)}><X size={18} /></Button></div>
        <video src={video} controls autoPlay className="w-full rounded-md" />
      </div>
    </div>}
  </main>;
}

function OrderTracking({ state, setState, orderId, navigate, notify }: CommonProps & { orderId: string }) {
  const order = state.orders.find((item) => item.id === orderId);
  const [stars, setStars] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  if (!order) return <main className="p-8"><Empty text="Order not found." /></main>;
  const activeOrder = order;
  const restaurant = state.restaurants.find((item) => item.id === activeOrder.restaurantId);
  const currentIndex = statusOrder.indexOf(activeOrder.orderStatus);
  function submitRating() {
    setState(addRatings(state, activeOrder.id, stars, review));
    notify("Thanks. Your verified food rating was submitted.");
  }
  return <main className="min-h-screen bg-porcelain px-4 py-8"><section className="mx-auto max-w-2xl rounded-md border border-stone-200 bg-white p-6 shadow-soft"><button onClick={() => navigate(`/menu/${order.restaurantId}`)} className="mb-5 font-bold text-flame">{restaurant?.name}</button><div className="rounded-md bg-ink p-6 text-center text-white"><p className="text-sm font-bold uppercase">Order Token</p><h1 className="text-6xl font-black">#{order.tokenNumber}</h1><p>Table: {order.tableNumber}</p></div>{order.orderStatus === "READY" && <div className="mt-4 rounded-md bg-green-100 p-4 font-black text-green-700"><Bell className="inline" /> Your order #{order.tokenNumber} is ready.</div>}<div className="mt-6 space-y-3">{statusOrder.map((status, index) => <div key={status} className={`flex items-center gap-3 rounded-md p-3 ${index <= currentIndex ? "bg-green-50 text-green-700" : "bg-stone-50 text-stone-400"}`}><Clock size={18} /><span className="font-black">{status}</span></div>)}{order.orderStatus === "REJECTED" && <div className="rounded-md bg-red-100 p-3 font-black text-red-700">Order rejected</div>}</div><div className="mt-6 border-t border-stone-100 pt-5"><h2 className="font-black">Items</h2>{order.items.map(item => <p key={item.foodId} className="mt-2 flex justify-between"><span>{item.name} x {item.quantity}</span><span>{currency.format(item.price * item.quantity)}</span></p>)}<p className="mt-3 flex justify-between font-black"><span>Total</span><span>{currency.format(order.totalAmount)}</span></p></div>{order.orderStatus === "COMPLETED" && !order.ratingSubmitted && <div className="mt-6 border-t border-stone-100 pt-5"><h2 className="mb-3 text-xl font-black">How was your food?</h2>{order.items.map(item => <div key={item.foodId} className="mb-3 flex items-center justify-between gap-3"><span className="font-bold">{item.name}</span><div>{[1,2,3,4,5].map(value => <button key={value} onClick={() => setStars({ ...stars, [item.foodId]: value })}><Star className={`${(stars[item.foodId] || 5) >= value ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} size={22} /></button>)}</div></div>)}<Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write a review" /><Button className="mt-3 w-full" onClick={submitRating}>Submit Review</Button></div>}</section></main>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
