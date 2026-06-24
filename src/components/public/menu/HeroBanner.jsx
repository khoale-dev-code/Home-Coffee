import { ArrowRight, Coffee, MapPin, Phone, Sparkles } from "lucide-react";

export default function HeroBanner({ shop, totalItems }) {
  const logoUrl = shop?.logoUrl || "/logohome.png";
  const coverUrl = shop?.coverUrl || "";
  const phone = shop?.phone || "";
  const googleMapUrl = shop?.googleMapUrl || "";

  return (
    <section className="relative overflow-hidden bg-[#f7f8ec] pt-16 lg:pt-20">
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#e7eac3] blur-3xl" />
      <div className="absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-[#294f31]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="grid overflow-hidden rounded-[28px] border border-[#dbe0ad] bg-white shadow-[0_28px_80px_rgba(41,79,49,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col justify-center p-5 sm:p-8 lg:p-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e7eac3] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#294f31]">
              <Sparkles size={15} />
              Fresh brewed daily
            </div>

            <h1 className="mt-5 max-w-3xl text-[42px] font-black leading-[0.92] tracking-[-0.07em] text-[#294f31] sm:text-6xl lg:text-7xl">
              {shop?.name || "Home Coffee"}
              <span className="mt-2 block text-[#819045]">coffee & comfort</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] font-semibold leading-7 text-[#53683a] sm:text-base sm:leading-8">
              {shop?.description ||
                "Thưởng thức menu đồ uống rõ ràng, xem ưu đãi nhanh và liên hệ với Home Coffee chỉ trong vài thao tác."}
            </p>

            <div className="mt-6 grid gap-2 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
              <a
                href="#menu"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#294f31] px-5 py-3 text-sm font-black !text-white shadow-sm transition hover:bg-[#1f3d26]"
              >
                <span className="text-white">Xem {totalItems || 0} món</span>
                <ArrowRight size={17} className="text-white" />
              </a>

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#e7eac3] px-5 py-3 text-sm font-black text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad] transition hover:bg-[#dfe3ae]"
                >
                  <Phone size={17} />
                  Gọi quán
                </a>
              )}

              {googleMapUrl && (
                <a
                  href={googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#dbe0ad] bg-white px-5 py-3 text-sm font-black text-[#294f31] shadow-sm transition hover:bg-[#f3f5dc]"
                >
                  <MapPin size={17} />
                  Chỉ đường
                </a>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2">
              <Stat label="Sản phẩm" value={totalItems || 0} />
              <Stat label="Không gian" value="Cozy" />
              <Stat label="Menu" value="Online" />
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden bg-[#294f31] sm:min-h-[420px] lg:min-h-full">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={shop?.name || "Home Coffee"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#e7eac3_0,#294f31_42%,#1f3d26_100%)] p-8">
                <div className="grid h-56 w-56 place-items-center rounded-full bg-white/92 p-6 shadow-2xl sm:h-72 sm:w-72">
                  <img
                    src={logoUrl}
                    alt={shop?.name || "Home Coffee"}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#294f31]/55 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/20 bg-white/85 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e7eac3] text-[#294f31]">
                  <Coffee size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#294f31]">
                    Menu online Home Coffee
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#53683a]">
                    Chọn món nhanh, xem giá rõ, liên hệ tiện.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#dbe0ad] bg-[#f7f8ec] p-3 text-center">
      <p className="text-lg font-black text-[#294f31] sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#7a874b]">
        {label}
      </p>
    </div>
  );
}
