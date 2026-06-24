import { ArrowUp, Coffee, ExternalLink } from "lucide-react";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100089933292350";

export default function ShopFooter({ shop }) {
  const shopName = shop?.name || "Home Coffee";

  const description =
    shop?.description ||
    "Home Coffee - menu online giúp khách xem sản phẩm nhanh hơn, rõ giá hơn và dễ theo dõi các cập nhật mới của quán.";

  const facebookUrl = shop?.facebookUrl || FACEBOOK_URL;

  return (
    <footer
      id="about"
      className="border-t border-[#dbe0ad] bg-[#f8f9ee] px-3 pb-[calc(18px+env(safe-area-inset-bottom))] pt-6 text-[#294f31] sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pb-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
          <BrandCard
            shop={shop}
            shopName={shopName}
            description={description}
          />

          <FacebookCard facebookUrl={facebookUrl} shopName={shopName} />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#dbe0ad] pt-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <p className="text-center text-xs font-bold text-[#647343] sm:text-left">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-2 sm:justify-end"
            aria-label="Footer navigation"
          >
            <FooterLink href="#menu" label="Sản phẩm" />
            <FooterLink href="#promotions" label="Khuyến mãi" />
            <FooterLink href="#toppings" label="Topping" />

            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#294f31] px-3 py-2 text-xs font-black !text-white transition hover:bg-[#1f3d26] hover:!text-white active:scale-95"
              aria-label="Về đầu trang"
            >
              <ArrowUp size={13} aria-hidden="true" />
              Về đầu
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function BrandCard({ shop, shopName, description }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-[#dbe0ad] bg-[#e7eac3] shadow-sm sm:h-[54px] sm:w-[54px]">
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shopName}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <Coffee size={24} className="text-[#294f31]" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-black tracking-tight text-[#294f31] sm:text-[22px]">
            {shopName}
          </h2>

          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#819045]">
            Coffee · Tea · Drinks
          </p>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#647343] sm:mt-4 sm:leading-7">
        {description}
      </p>

      <div className="mt-4 rounded-[14px] border border-[#dbe0ad] bg-white p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#819045]">
          Liên hệ chính thức
        </p>

        <p className="mt-1 text-sm font-semibold leading-6 text-[#647343]">
          Hiện tại quán chỉ sử dụng Facebook để khách theo dõi thông tin, bài
          đăng và liên hệ trực tiếp.
        </p>
      </div>
    </Card>
  );
}

function FacebookCard({ facebookUrl, shopName }) {
  return (
    <Card>
      <SectionTitle title={`Kết nối với ${shopName}`} />

      <p className="mt-3 text-sm font-semibold leading-6 text-[#647343]">
        Theo dõi Facebook của quán để cập nhật menu, hình ảnh và thông tin mới
        nhất.
      </p>

      <a
        href={facebookUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex min-h-14 items-center justify-between gap-3 rounded-[14px] border border-[#dbe0ad] bg-white px-3 py-3 transition hover:border-[#294f31] hover:bg-[#f7f8ec] active:scale-[0.98]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] text-white shadow-sm transition-transform hover:scale-105"
            style={{ background: "#1877F2" }}
          >
            <FacebookLogo className="h-[25px] w-[25px]" />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-[#294f31]">
              Facebook
            </span>

            <span className="mt-0.5 block truncate text-xs font-semibold text-[#647343]">
              Mở trang Facebook của quán
            </span>
          </span>
        </span>

        <ExternalLink
          size={15}
          className="shrink-0 text-[#819045]"
          aria-hidden="true"
        />
      </a>
    </Card>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[16px] border border-[#dbe0ad] bg-white p-4 shadow-sm transition hover:border-[#cfd79b] sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div>
      <p className="text-sm font-black text-[#294f31]">{title}</p>
      <div className="mt-2 h-[3px] w-9 rounded-full bg-[#819045]" />
    </div>
  );
}

function FooterLink({ href, label }) {
  return (
    <a
      href={href}
      className="rounded-[10px] bg-white px-3 py-2 text-xs font-black text-[#647343] ring-1 ring-[#dbe0ad] transition hover:bg-[#e7eac3] hover:text-[#294f31]"
    >
      {label}
    </a>
  );
}

function FacebookLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M20.35 31V19.65h3.8l.58-4.42h-4.38v-2.82c0-1.28.36-2.15 2.2-2.15h2.35V6.3C24.5 6.25 23.1 6.13 21.5 6.13c-3.36 0-5.66 2.05-5.66 5.82v3.28h-3.8v4.42h3.8V31h4.51Z"
      />
    </svg>
  );
}