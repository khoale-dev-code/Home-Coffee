import { Coffee, ListFilter } from "lucide-react";

export default function CategorySidebar({
  categories = [],
  activeCategory,
  setActiveCategory,
  countMap = {},
  totalItems = 0,
}) {
  const items = [
    {
      id: "all",
      name: "Tất cả",
      count: totalItems,
    },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: countMap[category.id] || 0,
    })),
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[24px] border border-[#dbe0ad] bg-white/90 p-3 shadow-[0_16px_50px_rgba(41,79,49,0.08)] backdrop-blur-xl lg:p-4">
        <div className="hidden items-center gap-2 border-b border-[#eef0cf] pb-3 lg:flex">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e7eac3] text-[#294f31]">
            <ListFilter size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-[#294f31]">Danh mục</p>
            <p className="text-xs font-semibold text-[#7a874b]">Lọc món nhanh</p>
          </div>
        </div>

        <div className="home-hide-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-3 lg:grid lg:overflow-visible lg:px-0 lg:pb-0">
          {items.map((item) => {
            const active = activeCategory === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id)}
                className={[
                  "group inline-flex min-w-max items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition lg:min-w-0",
                  active
                    ? "bg-[#294f31] text-white shadow-[0_10px_24px_rgba(41,79,49,0.20)]"
                    : "bg-[#f7f8ec] text-[#294f31] hover:bg-[#e7eac3]",
                ].join(" ")}
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Coffee
                    size={16}
                    className={active ? "text-white" : "text-[#7a874b]"}
                  />
                  <span
                    className={[
                      "line-clamp-1 text-sm font-black",
                      active ? "text-white" : "text-[#294f31]",
                    ].join(" ")}
                  >
                    {item.name}
                  </span>
                </span>

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-black",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white text-[#7a874b] ring-1 ring-[#dbe0ad]",
                  ].join(" ")}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
