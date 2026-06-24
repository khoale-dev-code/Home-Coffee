import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Coffee,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "#menu",
    label: "Menu",
    icon: Coffee,
    type: "section",
  },
  {
    href: "#promotions",
    label: "Ưu đãi",
    icon: Tag,
    type: "section",
  },
  {
    href: "#toppings",
    label: "Topping",
    icon: Sparkles,
    type: "section",
  },
  {
    href: "blog",
    label: "Bản tin",
    icon: Newspaper,
    type: "page",
  },
];

function cleanSlug(slug = "") {
  return String(slug || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function getBasePath(shopSlug) {
  const clean = cleanSlug(shopSlug || "home-coffee");
  return `/${clean}`;
}

function scrollToSection(sectionId) {
  const target = document.querySelector(sectionId);

  if (!target) return false;

  const headerOffset = window.innerWidth >= 1024 ? 96 : 76;
  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });

  return true;
}

export default function MenuHeader({
  shop,
  mobileOpen,
  setMobileOpen,
  onOpenReservation,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const logoUrl = shop?.logoUrl || "/logohome.png";
  const phone = shop?.phone || "";
  const googleMapUrl = shop?.googleMapUrl || "";
  const shopSlug = shop?.slug || "home-coffee";
  const basePath = getBasePath(shopSlug);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function getHref(item) {
    if (item.type === "page" && item.href === "blog") {
      return `${basePath}/blog`;
    }

    if (item.type === "section") {
      return `${basePath}${item.href}`;
    }

    return item.href;
  }

  function handleNavClick(event, item) {
    if (item.type !== "section") {
      closeMobileMenu();
      return;
    }

    event.preventDefault();

    closeMobileMenu();

    const sectionId = item.href;
    const isOnShopPage =
      location.pathname === basePath || location.pathname === `${basePath}/`;

    if (isOnShopPage) {
      window.history.replaceState(null, "", `${basePath}${sectionId}`);

      window.setTimeout(() => {
        scrollToSection(sectionId);
      }, 40);

      return;
    }

    navigate(`${basePath}${sectionId}`);

    window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 250);
  }

  function handleLogoClick(event) {
    event.preventDefault();

    closeMobileMenu();

    if (location.pathname === basePath || location.pathname === `${basePath}/`) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      window.history.replaceState(null, "", basePath);
      return;
    }

    navigate(basePath);
  }

  function handleReservationClick() {
    closeMobileMenu();

    if (onOpenReservation) {
      onOpenReservation();
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[90] border-b border-[#dbe0ad]/80 bg-[#f8f9ee]/92 shadow-[0_10px_30px_rgba(41,79,49,0.08)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:h-20 lg:px-8">
        <a
          href={basePath}
          onClick={handleLogoClick}
          className="flex min-w-0 items-center gap-3"
          aria-label="Về trang chủ menu"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#dbe0ad] bg-[#e7eac3] shadow-sm">
            <img
              src={logoUrl}
              alt={shop?.name || "Home Coffee"}
              className="h-full w-full object-contain p-1.5"
            />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-base font-black tracking-tight text-[#294f31] sm:text-lg">
              {shop?.name || "Home Coffee"}
            </span>

            <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[#6f7d45] sm:block">
              Coffee · Drinks · Menu
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={getHref(item)}
                onClick={(event) => handleNavClick(event, item)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-[#294f31] transition hover:bg-[#e7eac3]"
              >
                <Icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {googleMapUrl && (
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#dbe0ad] bg-white px-4 py-2.5 text-sm font-black text-[#294f31] shadow-sm transition hover:bg-[#e7eac3]"
            >
              <MapPin size={16} />
              Chỉ đường
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#294f31] px-4 py-2.5 text-sm font-black !text-white shadow-sm transition hover:bg-[#1f3d26]"
            >
              <Phone size={16} className="text-white" />
              Gọi quán
            </a>
          )}

          {onOpenReservation && (
            <button
              type="button"
              onClick={handleReservationClick}
              className="inline-flex items-center gap-2 rounded-full bg-[#e7eac3] px-4 py-2.5 text-sm font-black text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad] transition hover:bg-[#dfe3ae]"
            >
              <CalendarCheck size={16} />
              Đặt bàn
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#294f31] text-white shadow-sm lg:hidden"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <Menu size={22} className="text-white" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#dbe0ad] bg-[#f8f9ee] px-3 py-3 shadow-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={getHref(item)}
                  onClick={(event) => handleNavClick(event, item)}
                  className="flex items-center justify-between rounded-2xl border border-[#dbe0ad] bg-white px-4 py-3 text-sm font-black text-[#294f31] shadow-sm active:scale-[0.99]"
                >
                  <span>{item.label}</span>
                  <Icon size={17} />
                </a>
              );
            })}

            {googleMapUrl && (
              <a
                href={googleMapUrl}
                target="_blank"
                rel="noreferrer"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-2xl border border-[#dbe0ad] bg-white px-4 py-3 text-sm font-black text-[#294f31] shadow-sm active:scale-[0.99]"
              >
                <span>Chỉ đường</span>
                <MapPin size={17} />
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#294f31] px-4 py-3 text-sm font-black !text-white shadow-sm"
                >
                  <Phone size={17} className="text-white" />
                  <span className="text-white">Gọi</span>
                </a>
              )}

              {onOpenReservation && (
                <button
                  type="button"
                  onClick={handleReservationClick}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e7eac3] px-4 py-3 text-sm font-black text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]"
                >
                  <CalendarCheck size={17} />
                  Đặt bàn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}