import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChefHat,
  Clock3,
  Menu as MenuIcon,
  QrCode,
  Search,
  ShoppingBag,
  Smartphone,
  Star,
  X,
} from "lucide-react";
import type { AppState, Food, Restaurant } from "./types";

type LandingProps = {
  navigate: (to: string) => void;
  restaurant?: Restaurant;
  state: AppState;
};

const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=82";
const currency = (value: number) => `INR ${Math.round(value).toLocaleString("en-IN")}`;

function ActionButton({ children, onClick, secondary = false, className = "" }: { children: React.ReactNode; onClick: () => void; secondary?: boolean; className?: string }) {
  return <button onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition active:scale-[.98] ${secondary ? "border border-white/20 bg-white/[.08] text-white hover:border-white/40 hover:bg-white/[.14]" : "bg-flame text-white shadow-[0_14px_35px_rgba(255,90,31,.22)] hover:-translate-y-0.5 hover:bg-[#e64e19]"} ${className}`}>{children}</button>;
}

function FoodTile({ food, navigate }: { food: Food; navigate: (to: string) => void }) {
  return <article className="home-food-card group overflow-hidden rounded-2xl border border-white/10 bg-white/[.055]">
    <div className="relative aspect-[1.12] overflow-hidden">
      <img src={food.imageUrl || fallbackImage} alt={food.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">{food.averageRating.toFixed(1)} <Star size={12} className="inline fill-amber-300 text-amber-300" /></span>
    </div>
    <div className="p-3.5 sm:p-4">
      <h3 className="truncate font-black text-white">{food.name}</h3>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-black text-flame">{currency(food.price)}</span><button onClick={() => navigate(`/menu/${food.restaurantId}?table=12`)} aria-label={`Order ${food.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-flame text-white transition hover:bg-[#e64e19]" title={`Order ${food.name}`}><ShoppingBag size={16} /></button></div>
    </div>
  </article>;
}

export default function Landing({ navigate, restaurant, state }: LandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const activeRestaurant = restaurant || state.restaurants[0];
  const menuUrl = `/menu/${activeRestaurant?.id || "restaurant_demo"}?table=12`;
  const foods = state.foods.filter((food) => food.restaurantId === activeRestaurant?.id && food.available);
  const categories = state.categories.filter((item) => item.restaurantId === activeRestaurant?.id && item.active).sort((a, b) => a.sortOrder - b.sortOrder);
  const popularFoods = useMemo(() => foods.filter((food) => (category === "All" || food.categoryId === category) && food.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.averageRating - a.averageRating).slice(0, 4), [foods, category, search]);
  const liveOrders = state.orders.filter((order) => order.restaurantId === activeRestaurant?.id && !["COMPLETED", "REJECTED"].includes(order.orderStatus)).slice(0, 3);
  const navItems = [["Home", "top"], ["Menu", "dishes"], ["How It Works", "workflow"], ["For Restaurants", "owner-tools"], ["Pricing", "features"], ["Contact", "footer"]] as const;
  const goToMenu = () => navigate(`${menuUrl}${search ? `&search=${encodeURIComponent(search)}` : ""}`);

  return <main id="top" className="landing-page min-h-screen overflow-x-hidden bg-[#080808] text-white">
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080808]/78 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[78px] lg:px-10">
        <button onClick={() => navigate("/")} className="flex min-w-0 items-center gap-2.5 text-base font-black tracking-tight sm:text-lg"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-flame shadow-[0_0_28px_rgba(255,90,31,.38)]"><QrCode size={18} /></span><span>QR Kitchen</span></button>
        <div className="hidden items-center gap-5 text-sm font-bold text-white/65 lg:flex xl:gap-7">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="transition hover:text-white">{label}</a>)}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => document.querySelector<HTMLInputElement>("#home-search input")?.focus()} aria-label="Focus menu search" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/75 transition hover:border-white/40 hover:text-white lg:hidden"><Search size={19} /></button>
          <button onClick={() => navigate("/login")} className="hidden px-2 text-sm font-bold text-white/70 transition hover:text-white lg:block">Login</button>
          <ActionButton onClick={() => navigate("/signup")} className="hidden sm:inline-flex">Get Started <ArrowRight size={16} /></ActionButton>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white lg:hidden">{menuOpen ? <X size={19} /> : <MenuIcon size={19} />}</button>
        </div>
      </div>
      <div className={`overflow-hidden border-t border-white/10 bg-[#101010] transition-[max-height,opacity] duration-300 lg:hidden ${menuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mx-auto grid max-w-[1400px] gap-1 px-4 py-4 sm:px-6">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-white/75 transition hover:bg-white/[.06] hover:text-white">{label}</a>)}<button onClick={() => { setMenuOpen(false); navigate("/login"); }} className="rounded-xl px-3 py-3 text-left text-sm font-bold text-white/75 hover:bg-white/[.06] hover:text-white">Login</button><ActionButton onClick={() => { setMenuOpen(false); navigate("/signup"); }} className="mt-2 w-full">Get Started <ArrowRight size={16} /></ActionButton></div>
      </div>
    </nav>

    <section className="relative isolate overflow-hidden pt-[68px] lg:pt-[78px]">
      <img src={activeRestaurant?.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=82"} alt="Warm restaurant interior" fetchPriority="high" className="absolute inset-0 -z-20 h-full min-h-[900px] w-full object-cover object-[65%_center] sm:min-h-[780px] lg:min-h-[760px] lg:object-center" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,8,8,.92)_0%,rgba(8,8,8,.66)_35%,#080808_100%)] lg:bg-[linear-gradient(90deg,rgba(8,8,8,.96)_0%,rgba(8,8,8,.74)_42%,rgba(8,8,8,.25)_100%)]" />
      <div className="mx-auto grid min-h-[900px] w-full max-w-[1400px] items-center gap-10 px-4 py-14 sm:min-h-[780px] sm:px-6 lg:min-h-[760px] lg:grid-cols-[1.04fr_.96fr] lg:gap-14 lg:px-10 lg:py-20">
        <div className="animate-rise max-w-2xl pt-5 lg:pt-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.08] px-3 py-2 text-[10px] font-black tracking-[.16em] text-white/80 backdrop-blur sm:text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-flame" /> SMART DINING, BEAUTIFULLY SIMPLE</div>
          <h1 className="max-w-[11ch] text-[clamp(2.5rem,9vw,5.75rem)] font-black leading-[.94] tracking-[-.065em]">Dine smart.<br /><span className="text-flame">Order easy.</span></h1>
          <p className="mt-5 max-w-xl text-[clamp(.98rem,2vw,1.18rem)] leading-7 text-white/68 sm:mt-6">Scan a table, discover dishes you will love, and follow every order from kitchen to table without waiting.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><ActionButton onClick={() => navigate("/signup")} className="w-full sm:w-auto">Create Restaurant <ArrowRight size={17} /></ActionButton><ActionButton secondary onClick={goToMenu} className="w-full sm:w-auto"><QrCode size={17} /> Explore Menu</ActionButton></div>
          <div className="mt-8 max-w-xl rounded-2xl border border-white/15 bg-black/35 p-2 backdrop-blur-xl" id="home-search"><div className="flex min-h-[52px] items-center gap-3 rounded-xl bg-white/[.08] px-3"><Search className="shrink-0 text-white/45" size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && goToMenu()} aria-label="Search menu" placeholder="Search dishes, drinks, desserts..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/42" /><button onClick={goToMenu} aria-label="Search menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-flame text-white transition hover:bg-[#e64e19]"><ArrowRight size={18} /></button></div><div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-1">{["All", ...categories.map((item) => item.name)].map((item) => <button key={item} onClick={() => setCategory(item === "All" ? "All" : categories.find((entry) => entry.name === item)?.id || "All")} className={`min-h-11 shrink-0 rounded-full px-3 text-xs font-bold transition ${((item === "All" && category === "All") || categories.find((entry) => entry.name === item)?.id === category) ? "bg-flame text-white" : "bg-white/[.08] text-white/60 hover:text-white"}`}>{item}</button>)}</div></div>
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-4 sm:gap-5">{[[String(state.orders.length), "orders tracked"], [String(state.restaurants.length), "restaurants"], [foods.length ? `${Math.max(...foods.map((food) => food.averageRating)).toFixed(1)}★` : "--", "menu rating"], [activeRestaurant?.status === "open" ? "Open" : "Closed", "right now"]].map(([value, label]) => <div key={label}><p className="text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/45">{label}</p></div>)}</div>
        </div>
        <div className="relative mx-auto w-full max-w-[540px] lg:mt-12">
          <div className="absolute -inset-10 -z-10 rounded-full bg-flame/20 blur-[90px]" />
          <div className="animate-float overflow-hidden rounded-[28px] border border-white/20 bg-white/[.12] p-2.5 shadow-[0_35px_90px_rgba(0,0,0,.5)] backdrop-blur-xl sm:p-3">
            <img src={foods[0]?.imageUrl || fallbackImage} alt={foods[0]?.name || "Featured dish"} className="aspect-[1.1] w-full rounded-[21px] object-cover" />
            <div className="mt-3 rounded-[20px] bg-[#f7f3ed] p-4 text-ink sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-ink/50">Featured at {activeRestaurant?.name || "QR Kitchen"}</p><h2 className="mt-1 text-xl font-black">{foods[0]?.name || "Explore the menu"}</h2><p className="mt-1 font-black text-flame">{foods[0] ? currency(foods[0].price) : "Ready when you are"}</p></div><span className="shrink-0 font-bold"><Star size={15} className="inline fill-amber-400 text-amber-400" /> {foods[0]?.averageRating.toFixed(1) || "--"}</span></div><div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-black/[.06] p-3"><span className="flex items-center gap-2 text-sm font-black"><Clock3 size={16} className="text-flame" /> {foods[0]?.preparationTime || "10"} min prep</span><button onClick={goToMenu} className="text-sm font-black text-flame">Order now <ArrowRight size={14} className="inline" /></button></div></div>
          </div>
          <div className="mt-3 w-full rounded-2xl border border-white/15 bg-[#111]/90 p-4 shadow-2xl backdrop-blur-xl"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ce4a7] opacity-70" /><span className="relative h-3 w-3 rounded-full bg-[#7ce4a7]" /></span><p className="text-xs font-black uppercase tracking-[.14em]">Live orders</p></div><span className="text-xs text-white/45">{liveOrders.length ? `${liveOrders.length} active now` : "Ready for your first order"}</span></div>{liveOrders.length ? <div className="mt-3 grid gap-2 sm:grid-cols-3">{liveOrders.map((order) => <div key={order.id} className="flex items-center justify-between rounded-xl bg-white/[.06] px-3 py-2 text-xs"><span className="font-bold">#{order.tokenNumber}</span><span className="text-white/55">{order.orderStatus}</span></div>)}</div> : <p className="mt-3 text-sm text-white/55">Orders placed through the live menu will appear here.</p>}</div>
        </div>
      </div>
    </section>

    <section id="features" className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10"><div className="mb-10 max-w-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-flame">Built around the table</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-black leading-[.98] tracking-[-.05em]">A better rhythm for every service.</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[QrCode, "Quick & Easy", "One scan takes guests from table to order."], [ShoppingBag, "Safe & Secure", "A simple, private flow with no card data stored."], [Smartphone, "No App Needed", "A fast browser experience on every phone."], [BarChart3, "Better Experience", "Owners see the room clearly and act in real time."]].map(([Icon, title, text]) => <div key={title as string} className="group rounded-2xl border border-white/10 bg-white/[.045] p-5 transition hover:-translate-y-1 hover:border-flame/45"><div className="mb-8 grid h-11 w-11 place-items-center rounded-xl bg-flame/15 text-flame transition group-hover:bg-flame group-hover:text-white"><Icon size={20} /></div><h3 className="font-black">{title as string}</h3><p className="mt-2 text-sm leading-6 text-white/50">{text as string}</p></div>)}</div></section>

    <section id="dishes" className="border-y border-white/10 bg-white/[.025]"><div className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 lg:px-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-flame">From the menu</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-black leading-[.98] tracking-[-.05em]">Popular right now.</h2></div><button onClick={goToMenu} className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-flame hover:text-white">See full menu <ArrowRight size={16} /></button></div><div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{popularFoods.length ? popularFoods.map((food) => <FoodTile key={food.id} food={food} navigate={navigate} />) : <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">Menu items will appear here when your restaurant menu is ready.</div>}</div></div></section>

    <section id="workflow" className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><div><p className="text-xs font-black uppercase tracking-[.18em] text-flame">How it works</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-black leading-[.98] tracking-[-.05em]">From scan to satisfied in minutes.</h2><p className="mt-5 max-w-lg leading-7 text-white/55">QR Kitchen keeps the guest experience effortless and gives restaurant teams a calm, live view of service.</p><ActionButton onClick={goToMenu} className="mt-7">Try a live menu <ArrowRight size={16} /></ActionButton></div><div className="grid gap-3 sm:grid-cols-2">{["Scan the table QR", "Browse real dishes", "Place the order", "Follow the token"].map((step, index) => <div key={step} className="rounded-2xl border border-white/10 bg-white/[.045] p-5"><span className="text-sm font-black text-flame">0{index + 1}</span><div className="my-7 h-px bg-gradient-to-r from-flame/80 to-transparent" /><p className="font-black">{step}</p><p className="mt-2 text-sm text-white/45">A focused step that keeps the line moving.</p></div>)}</div></section>

    <section id="owner-tools" className="border-y border-white/10 bg-[#111] px-4 py-20 sm:px-6 sm:py-24 lg:px-10"><div className="mx-auto grid w-full max-w-[1400px] gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-flame">For restaurants</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.7rem)] font-black leading-[.98] tracking-[-.05em]">Your whole floor, in one clear view.</h2><p className="mt-5 max-w-lg leading-7 text-white/55">Track real orders, manage the menu, generate table QR codes, and learn what guests love from the existing owner dashboard.</p><ActionButton onClick={() => navigate("/dashboard")} className="mt-7">Open owner dashboard <BarChart3 size={16} /></ActionButton></div><div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-4 shadow-2xl sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">Live overview</p><p className="mt-1 text-xl font-black">{activeRestaurant?.name || "Your restaurant"}</p></div><span className="rounded-full bg-[#7ce4a7]/10 px-3 py-1 text-xs font-bold text-[#a7f3c6]">{activeRestaurant?.status === "open" ? "Open" : "Closed"}</span></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[state.orders.length, "Orders"], [foods.length, "Menu items"], [liveOrders.length, "Active"], [activeRestaurant?.status === "open" ? "Live" : "Paused", "Service"]].map(([value, label]) => <div key={label as string} className="rounded-xl bg-white/[.055] p-3"><p className="text-xl font-black">{value as string}</p><p className="mt-1 text-xs text-white/45">{label as string}</p></div>)}</div><div className="mt-5 grid gap-2">{liveOrders.length ? liveOrders.map((order) => <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.035] px-4 py-3 text-sm"><span className="font-black">Token #{order.tokenNumber}</span><span className="text-white/50">Table {order.tableNumber}</span><span className="font-bold text-flame">{order.orderStatus}</span></div>) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/45">No active orders yet. Your real orders will appear here.</p>}</div></div></div></section>

    <footer id="footer" className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-12 text-sm text-white/45 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10"><div><div className="flex items-center gap-2 text-lg font-black text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-flame"><QrCode size={16} /></span> QR Kitchen</div><p className="mt-3">Smarter ordering. Better dining.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3">{navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="transition hover:text-white">{label}</a>)}<button onClick={goToMenu} className="transition hover:text-white">Customer Menu</button><button onClick={() => navigate("/login")} className="transition hover:text-white">Login</button></div><p>© 2026 QR Kitchen</p></footer>
  </main>;
}
