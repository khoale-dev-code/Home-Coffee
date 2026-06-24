import { Sparkles } from "lucide-react";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function normalizeToppings(toppings = []) {
  if (!Array.isArray(toppings)) return [];

  return toppings
    .filter((topping) => topping?.name)
    .map((topping, index) => ({
      id: topping.id || `topping-${index}`,
      name: String(topping.name || "").trim(),
      price: Number(topping.price || 0),
      order: Number(topping.order || index + 1),
    }))
    .sort((a, b) => a.order - b.order);
}

export default function ToppingSection({ shop }) {
  const toppings = normalizeToppings(shop?.toppings || []);

  if (toppings.length === 0) return null;

  return (
    <section
      id="toppings"
      className="mx-auto max-w-7xl scroll-mt-24 px-3 py-5 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-[30px] border border-[#dbe0ad] bg-white shadow-[0_24px_80px_rgba(41,79,49,0.10)]">
        {/* Header */}
        <div className="grid gap-6 bg-[#294f31] p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#e7eac3]">
              <Sparkles size={13} />
              Add-on menu
            </p>

            <div className="mt-3 h-px w-10 bg-white/20" aria-hidden="true" />

            <h2 className="mt-4 text-[28px] font-black leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl">
              Topping tại {shop?.name || "quán"}
            </h2>

            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/65">
              Gọi kèm topping yêu thích ngay khi đặt đồ uống tại quán.
            </p>
          </div>

          {/* Stamp-style count badge */}
          <div className="flex justify-start lg:justify-end">
            <div className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full border-2 border-dashed border-white/25">
              <div className="text-center">
                <p className="text-[28px] font-black leading-none text-white">
                  {toppings.length}
                </p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/55">
                  topping
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket list */}
        <div className="grid gap-3 bg-[#f7f8ec] p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          {toppings.map((topping, index) => (
            <ToppingTicket key={topping.id} topping={topping} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToppingTicket({ topping, index }) {
  const isFree = !(topping.price > 0);

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      className="hop-reveal group relative flex items-center gap-2 rounded-2xl border border-[#dbe0ad] bg-white px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#294f31]/30 hover:shadow-[0_10px_24px_rgba(41,79,49,0.10)]"
    >
      {/* Punch-hole notches — gives each tile the feel of an order-ticket stub */}
      <span
        aria-hidden="true"
        className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#dbe0ad] bg-[#f7f8ec]"
      />
      <span
        aria-hidden="true"
        className="absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#dbe0ad] bg-[#f7f8ec]"
      />

      <p className="min-w-0 truncate text-[13.5px] font-black text-[#294f31]">
        {topping.name}
      </p>

      <span
        aria-hidden="true"
        className="mx-1 h-px flex-1 self-center border-b border-dotted border-[#dbe0ad]"
      />

      <p
        className={
          "shrink-0 text-[13px] font-black " +
          (isFree ? "text-[#819045]" : "text-[#b22830]")
        }
      >
        {isFree ? "Miễn phí" : `+${formatPrice(topping.price)}`}
      </p>
    </div>
  );
}