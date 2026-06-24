import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Tags,
  X,
} from "lucide-react";

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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === "all") return "Tất cả danh mục";

    return (
      categories.find((category) => category.id === activeCategory)?.name ||
      "Danh mục"
    );
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!categoryOpen) return;

    function handleClickOutside(event) {
      if (!categoryRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryOpen]);

  function handleSelectCategory(categoryId) {
    setActiveCategory(categoryId);
    setCategoryOpen(false);
  }

  return (
    <div className="relative z-30 rounded-[18px] border border-[#dbe0ad] bg-white/96 p-2.5 shadow-[0_10px_26px_rgba(41,79,49,0.06)] backdrop-blur-xl sm:rounded-[24px] sm:p-3 lg:sticky lg:top-24 lg:z-30">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-3">
        <SearchBox keyword={keyword} setKeyword={setKeyword} />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          <div className="lg:hidden" ref={categoryRef}>
            <CategoryDropdown
              open={categoryOpen}
              setOpen={setCategoryOpen}
              categories={categories}
              activeCategory={activeCategory}
              activeCategoryLabel={activeCategoryLabel}
              onSelect={handleSelectCategory}
            />
          </div>

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
              label={activeCategoryLabel}
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

function SearchBox({ keyword, setKeyword }) {
  return (
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
  );
}

function CategoryDropdown({
  open,
  setOpen,
  categories,
  activeCategory,
  activeCategoryLabel,
  onSelect,
}) {
  const options = [
    {
      id: "all",
      name: "Tất cả danh mục",
    },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-[14px] border px-3 text-left transition sm:h-12 sm:rounded-2xl sm:px-4",
          open
            ? "border-[#294f31] bg-white ring-4 ring-[#294f31]/10"
            : "border-[#dbe0ad] bg-[#f7f8ec]",
        ].join(" ")}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <Tags size={16} className="shrink-0 text-[#7a874b]" />

          <span className="truncate text-[13px] font-black text-[#294f31] sm:text-sm">
            {activeCategoryLabel}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={[
            "shrink-0 text-[#7a874b] transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-[18px] border border-[#dbe0ad] bg-white shadow-[0_20px_60px_rgba(41,79,49,0.18)]">
          <div
            role="listbox"
            aria-label="Chọn danh mục"
            className="max-h-[260px] overflow-y-auto p-2 overscroll-contain [-webkit-overflow-scrolling:touch]"
          >
            {options.map((option) => {
              const active = activeCategory === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(option.id)}
                  className={[
                    "flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[14px] px-3 text-left transition active:scale-[0.99]",
                    active
                      ? "bg-[#294f31] text-white"
                      : "bg-white text-[#294f31] hover:bg-[#f7f8ec]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "line-clamp-1 text-[13px] font-black",
                      active ? "text-white" : "text-[#294f31]",
                    ].join(" ")}
                  >
                    {option.name}
                  </span>

                  {active && <Check size={16} className="shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
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
