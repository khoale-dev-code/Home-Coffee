import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

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
    <div className="relative z-10 rounded-[18px] border border-[#dbe0ad] bg-white/95 p-2.5 shadow-[0_10px_26px_rgba(41,79,49,0.06)] backdrop-blur-xl sm:rounded-[24px] sm:p-3 lg:sticky lg:top-24 lg:z-30">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a874b] sm:left-4 sm:size-[18px]"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm món..."
            inputMode="search"
            className="h-11 w-full rounded-[14px] border border-[#dbe0ad] bg-[#f7f8ec] pl-10 pr-10 text-[13px] font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/70 focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10 sm:h-12 sm:rounded-2xl sm:pl-11 sm:pr-11 sm:text-sm"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad] transition active:scale-[0.94]"
              aria-label="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category tabs (mobile/tablet) + sort */}
        <div className="flex flex-col gap-2.5 lg:gap-2">
          {/* Category pill bar — replaces the dropdown on small screens.
              One tap switches category instead of open-dropdown → scroll →
              pick → close, which is the main friction point on mobile. */}
          {categories.length > 0 && (
            <div
              role="tablist"
              aria-label="Chọn danh mục"
              className="-mx-2.5 overflow-x-auto px-2.5 sm:-mx-3 sm:px-3 lg:hidden [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex w-max snap-x gap-1.5 pb-0.5">
                <CategoryPill
                  label="Tất cả"
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                />
                {categories.map((category) => (
                  <CategoryPill
                    key={category.id}
                    label={category.name}
                    active={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <SelectBox
            icon={SlidersHorizontal}
            value={sortMode}
            onChange={setSortMode}
            ariaLabel="Sắp xếp sản phẩm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectBox>
        </div>
      </div>

      {(keyword || activeCategory !== "all" || sortMode !== "default") && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {keyword && (
            <FilterChip label={`Tìm: ${keyword}`} onClear={() => setKeyword("")} />
          )}

          {activeCategory !== "all" && (
            <FilterChip
              label={
                categories.find((category) => category.id === activeCategory)
                  ?.name || "Danh mục"
              }
              onClear={() => setActiveCategory("all")}
            />
          )}

          {sortMode !== "default" && (
            <FilterChip
              label={
                SORT_OPTIONS.find((option) => option.value === sortMode)
                  ?.label || "Sắp xếp"
              }
              onClear={() => setSortMode("default")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "shrink-0 snap-start whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-black transition active:scale-[0.96] " +
        (active
          ? "bg-[#294f31] text-white shadow-sm"
          : "border border-[#dbe0ad] bg-[#f7f8ec] text-[#647343]")
      }
    >
      {label}
    </button>
  );
}

function SelectBox({ icon: Icon, value, onChange, children, ariaLabel }) {
  return (
    <div className="relative min-w-0">
      <Icon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7a874b] sm:left-4 sm:size-[17px]"
      />

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="h-11 w-full min-w-0 appearance-none truncate rounded-[14px] border border-[#dbe0ad] bg-[#f7f8ec] pl-9 pr-8 text-[13px] font-black text-[#294f31] outline-none transition focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10 sm:h-12 sm:rounded-2xl sm:pl-11 sm:pr-9 sm:text-sm"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7a874b] sm:right-3.5"
      />
    </div>
  );
}

function FilterChip({ label, onClear }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#294f31] px-2.5 py-1.5 text-[11px] font-black text-white shadow-sm transition active:scale-[0.97]"
    >
      <span className="max-w-[180px] truncate text-white">{label}</span>
      <X size={12} className="shrink-0 text-white" />
    </button>
  );
}