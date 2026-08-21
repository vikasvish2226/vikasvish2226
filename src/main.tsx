import React, { FormEvent, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import QRCode from "qrcode";
import {
  BarChart3,
  Bell,
  ChefHat,
  Clock,
  Copy,
  CreditCard,
  Download,
  Pencil,
  Eye,
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
  UserPlus,
  Utensils,
  Video,
  X,
} from "lucide-react";
import "./index.css";
import { addCategory, addRatings, createOrder, createOwner, loadState, saveState, upsertFood } from "./data";
import type { AppState, CartLine, Food, Order, OrderStatus, PaymentMethod, Restaurant } from "./types";

const currency = { format: (value: number) => `INR ${Math.round(value).toLocaleString("en-IN")}` };
const statusOrder: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"];

function App() {
  const [state, setStateValue] = useState<AppState>(() => loadState());
  const [path, setPath] = useState(window.location.pathname + window.location.search);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function setState(next: AppState) {
    setStateValue(next);
    saveState(next);
  }

  function navigate(to: string) {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0 });
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  const route = path.split("?")[0];
  const owner = state.owners.find((item) => item.id === state.currentOwnerId);
  const restaurant = state.restaurants.find((item) => item.id === owner?.restaurantId) || state.restaurants[0];

  let screen = <Landing navigate={navigate} restaurant={restaurant} />;
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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-md border border-stone-200 bg-white px-3 py-3 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-flame focus:bg-white ${props.className || ""}`} />;
}

function Landing({ navigate, restaurant }: { navigate: (to: string) => void; restaurant?: Restaurant }) {
  const sampleMenuUrl = `/menu/${restaurant?.id || "restaurant_demo"}?table=12`;
  const navItems = ["Features", "Workflow", "Owner Tools"];
  const featureCards = [
    { icon: QrCode, title: "Table QR Menus", text: "Generate restaurant and table-specific QR codes for fast customer ordering." },
    { icon: ShoppingCart, title: "No-login Ordering", text: "Customers browse, add items, choose payment mode, and receive a token instantly." },
    { icon: ChefHat, title: "Kitchen Tokens", text: "Accepted orders move into a focused kitchen screen with large status actions." },
    { icon: Star, title: "Verified Ratings", text: "Only completed orders can submit food-wise ratings and reviews." },
  ];
  const workflow = ["Scan QR", "Browse Menu", "Place Order", "Kitchen Prep", "Ready Alert", "Rate Food"];

  return (
    <main className="min-h-screen bg-porcelain">
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-ink/75 text-white backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-lg font-black">
            <ChefHat className="text-flame" /> QR Kitchen
          </button>
          <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
            {navItems.map((item) => <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-white/82 transition hover:text-white">{item}</a>)}
          </div>
          <div className="flex items-center gap-2">
            <Button tone="light" className="hidden md:inline-flex" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/signup")}><UserPlus size={17} /> Start</Button>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-[1120px] items-center overflow-hidden pt-16 sm:min-h-[90vh]">
        <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1800&q=85" className="absolute inset-0 h-full w-full scale-105 object-cover object-[62%_center] landing-kenburns sm:object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/50 sm:to-black/15" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 text-white sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl animate-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/14 px-3 py-2 text-sm backdrop-blur">
              <QrCode size={16} /> QR menu, online ordering, and kitchen tokens
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-7xl">Restaurant QR Ordering</h1>
            <p className="mt-5 max-w-xl text-base text-white/88 sm:text-lg">Owners manage menus and orders. Customers scan, order, track their token, and review food without making an account.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button onClick={() => navigate("/signup")}><UserPlus size={18} /> Create Restaurant</Button>
              <Button tone="light" onClick={() => navigate(sampleMenuUrl)}><Eye size={18} /> Try Customer Menu</Button>
              <Button tone="dark" onClick={() => navigate("/dashboard")}><BarChart3 size={18} /> Owner Dashboard</Button>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
              {[["Live", "Orders"], ["Table", "QR"], ["Food", "Ratings"]].map(([big, small]) => <div key={big} className="rounded-md border border-white/15 bg-white/12 p-3 backdrop-blur"><p className="text-2xl font-black">{big}</p><p className="text-xs uppercase text-white/72">{small}</p></div>)}
            </div>
          </div>
          <div className="relative mx-auto block w-full max-w-lg lg:max-w-none">
            <div className="animate-float rounded-md border border-white/18 bg-white/14 p-3 shadow-soft backdrop-blur-xl sm:p-4">
              <img src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=85" className="aspect-[4/3] w-full rounded-md object-cover" />
              <div className="mt-4 rounded-md bg-white p-4 text-ink">
                <div className="flex items-start justify-between">
                  <div><h2 className="text-xl font-black">Paneer Tikka</h2><p className="font-black text-flame">INR 220</p></div>
                  <span className="font-bold"><Star size={16} className="inline fill-amber-400 text-amber-400" /> 4.8</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md bg-porcelain p-3">
                  <span className="font-black">Token #A104</span>
                  <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-black text-green-700">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className="animate-card rounded-md border border-stone-200 bg-white p-5 shadow-soft" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-flame/12 text-flame"><Icon size={22} /></div>
            <h2 className="font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
          </div>
        ))}
      </section>

      <section id="workflow" className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-flame">Customer Flow</p>
              <h2 className="text-3xl font-black">From QR scan to food rating</h2>
            </div>
            <Button tone="light" onClick={() => navigate(sampleMenuUrl)}><ShoppingCart size={18} /> Place Demo Order</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-6">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-md border border-stone-200 bg-porcelain p-4">
                <p className="text-sm font-black text-flame">0{index + 1}</p>
                <p className="mt-2 font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="owner-tools" className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase text-flame">Owner Tools</p>
          <h2 className="mt-2 text-3xl font-black">Dashboard, QR codes, kitchen queue, and ratings in one place</h2>
          <p className="mt-4 leading-7 text-stone-600">The app is structured around restaurant-specific data, so each owner manages only their own categories, food, orders, kitchen statuses, and reviews.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/dashboard")}><BarChart3 size={18} /> View Dashboard</Button>
            <Button tone="light" onClick={() => navigate("/dashboard/qr")}><QrCode size={18} /> Generate QR</Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Today's sales", "Pending orders", "Preparing orders", "Average rating"].map((item, index) => (
            <div key={item} className="rounded-md border border-stone-200 bg-white p-5 shadow-soft">
              <p className="text-sm text-stone-500">{item}</p>
              <p className="mt-2 text-3xl font-black">{["INR 12,450", "8", "3", "4.7"][index]}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Login({ state, setState, navigate, notify }: CommonProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const owner = state.owners.find((item) => item.email === data.email.toLowerCase() && item.password === data.password);
    if (!owner) return notify("Login failed. Try owner@demo.com / password123.");
    setState({ ...state, currentOwnerId: owner.id });
    notify("Welcome back.");
    navigate("/dashboard");
  }
  return <AuthShell title="Owner Login" subtitle="Customers never need an account. Owner access is protected.">
    <form onSubmit={submit} className="space-y-4">
      <Input name="email" type="email" placeholder="Email" defaultValue="owner@demo.com" required />
      <Input name="password" type="password" placeholder="Password" defaultValue="password123" required />
      <Button className="w-full">Login</Button>
      <div className="flex justify-between text-sm"><button type="button" className="font-semibold text-flame">Forgot Password</button><button type="button" onClick={() => navigate("/signup")} className="font-semibold text-flame">Create Restaurant Account</button></div>
    </form>
  </AuthShell>;
}

function Signup({ state, setState, navigate, notify }: CommonProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    if (data.password !== data.confirmPassword) return notify("Passwords do not match.");
    const next = createOwner(state, data);
    setState(next);
    notify("Restaurant profile and QR route created.");
    navigate("/dashboard");
  }
  return <AuthShell title="Register Restaurant Owner" subtitle="Create an owner account and restaurant profile in one step.">
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Input name="ownerName" placeholder="Owner Name" required />
      <Input name="restaurantName" placeholder="Restaurant Name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="mobile" placeholder="Mobile Number" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Input name="confirmPassword" type="password" placeholder="Confirm Password" required />
      <Input name="address" placeholder="Restaurant Address" className="sm:col-span-2" required />
      <Button className="sm:col-span-2">Signup and Open Dashboard</Button>
    </form>
  </AuthShell>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-porcelain px-5 py-10">
    <section className="grid w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-soft md:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden min-h-[560px] md:block"><img src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=85" className="h-full w-full object-cover" /></div>
      <div className="p-6 sm:p-10"><a href="/" className="mb-8 inline-flex items-center gap-2 font-black"><ChefHat className="text-flame" /> QR Kitchen</a><h1 className="text-3xl font-black">{title}</h1><p className="mb-8 mt-2 text-stone-600">{subtitle}</p>{children}</div>
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
    ["overview", Home, "Overview"], ["orders", Bell, "Orders"], ["kitchen", ChefHat, "Kitchen"], ["menu", Utensils, "Menu"],
    ["categories", MenuIcon, "Categories"], ["ratings", Star, "Ratings"], ["qr", QrCode, "QR Code"], ["profile", Store, "Profile"], ["settings", Settings, "Settings"],
  ] as const;
  return <main className="min-h-screen bg-porcelain text-ink lg:grid lg:grid-cols-[280px_1fr]">
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

function Overview({ state, restaurant }: { state: AppState; restaurant: Restaurant }) {
  const orders = state.orders.filter((item) => item.restaurantId === restaurant.id);
  const foods = state.foods.filter((item) => item.restaurantId === restaurant.id);
  const avg = foods.length ? foods.reduce((s, f) => s + f.averageRating, 0) / foods.length : 0;
  const stats = [
    ["Today's orders", orders.length, Bell], ["Pending orders", orders.filter((o) => o.orderStatus === "PLACED").length, Clock],
    ["Preparing orders", orders.filter((o) => o.orderStatus === "PREPARING").length, ChefHat], ["Ready orders", orders.filter((o) => o.orderStatus === "READY").length, PackageCheck],
    ["Completed orders", orders.filter((o) => o.orderStatus === "COMPLETED").length, ShoppingCart], ["Today's sales", currency.format(orders.filter((o) => o.orderStatus !== "REJECTED").reduce((s, o) => s + o.totalAmount, 0)), CreditCard],
    ["Total menu items", foods.length, Utensils], ["Average rating", avg.toFixed(1), Star],
  ] as const;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-md border border-stone-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-stone-500">{label}</p><span className="grid h-10 w-10 place-items-center rounded-md bg-flame/10 text-flame"><Icon size={19} /></span></div><p className="mt-2 text-3xl font-black tracking-tight">{value}</p></div>)}<div className="rounded-md border border-stone-200 bg-white p-5 shadow-soft md:col-span-2 xl:col-span-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Popular food items</h2><p className="text-sm text-stone-500">Based on verified item ratings</p></div><span className="rounded-md bg-basil/10 px-3 py-1 text-sm font-black text-basil">{foods.length} active items</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{foods.sort((a,b)=>b.totalRatings-a.totalRatings).slice(0,3).map(food=><FoodMini key={food.id} food={food} />)}</div></div></div>;
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
  const [search, setSearch] = useState("");
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
  return <main className="min-h-screen bg-porcelain pb-32">
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
      <section className="sticky top-0 z-10 border-b border-stone-200 bg-porcelain/95 px-4 py-4 backdrop-blur">
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
