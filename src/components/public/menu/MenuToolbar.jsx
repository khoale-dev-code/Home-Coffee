import { Search, SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "featured", label: "Món nổi bật" },
];

export default function MenuToolbar({
  keyword,
  setKeyword,
  sortMode,
  setSortMode,
  categories = [],
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className="sticky top-[76px] z-40 rounded-[24px] border border-[#dbe0ad] bg-white/92 p-3 shadow-[0_16px_40px_rgba(41,79,49,0.08)] backdrop-blur-xl lg:top-24">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a874b]"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm cà phê, trà, bánh..."
            className="h-12 w-full rounded-2xl border border-[#dbe0ad] bg-[#f7f8ec] pl-11 pr-11 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/70 focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]"
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <SlidersHorizontal
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a874b]"
          />

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-[#dbe0ad] bg-[#f7f8ec] pl-11 pr-4 text-sm font-black text-[#294f31] outline-none transition focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <select
        value={activeCategory}
        onChange={(event) => setActiveCategory(event.target.value)}
        className="mt-3 h-12 w-full rounded-2xl border border-[#dbe0ad] bg-[#f7f8ec] px-4 text-sm font-black text-[#294f31] outline-none transition focus:border-[#294f31] focus:bg-white lg:hidden"
      >
        <option value="all">Tất cả danh mục</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
