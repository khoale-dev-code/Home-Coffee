import { Plus, Sparkles } from "lucide-react";

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
        <div className="grid gap-4 bg-[#294f31] p-5 text-white sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#e7eac3]">
              <Sparkles size={14} />
              Add-on menu
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl lg:text-4xl">
              Topping tại {shop?.name || "quán"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
              Danh sách topping tham khảo để khách xem thêm lựa chọn khi dùng đồ uống tại quán.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 text-center ring-1 ring-white/10">
            <p className="text-3xl font-black text-white">{toppings.length}</p>
            <p className="mt-0.5 text-xs font-black uppercase tracking-[0.14em] text-white/60">
              topping
            </p>
          </div>
        </div>

        <div className="grid gap-2 bg-[#f7f8ec] p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
          {toppings.map((topping) => (
            <div
              key={topping.id}
              className="flex items-center justify-between gap-3 rounded-[22px] border border-[#dbe0ad] bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e7eac3] text-[#294f31]">
                  <Plus size={20} />
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-black text-[#294f31]">
                    {topping.name}
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-[#647343]">
                    Topping / Add-on
                  </p>
                </div>
              </div>

              <p className="shrink-0 rounded-full bg-[#294f31] px-3 py-1.5 text-xs font-black text-white">
                {topping.price > 0 ? `+${formatPrice(topping.price)}` : "Free"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}