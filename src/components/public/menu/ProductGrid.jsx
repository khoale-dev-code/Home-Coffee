import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Eye,
  ImageIcon,
  Plus,
  Star,
  X,
  Zap,
} from "lucide-react";

import { cn, formatPrice } from "./publicMenuUtils";

function getItemImages(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images
      .map((image, index) => {
        if (typeof image === "string") {
          return { url: image, name: `${item.name || "Sản phẩm"} ${index + 1}` };
        }
        return {
          url: image?.url || "",
          name: image?.name || `${item.name || "Sản phẩm"} ${index + 1}`,
        };
      })
      .filter((image) => image.url);
  }
  if (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0) {
    return item.imageUrls
      .map((url, index) => ({ url, name: `${item.name || "Sản phẩm"} ${index + 1}` }))
      .filter((image) => image.url);
  }
  if (item?.imageUrl) {
    return [{ url: item.imageUrl, name: item.name || "Sản phẩm" }];
  }
  return [];
}

function getItemSizes(item) {
  if (Array.isArray(item?.sizes) && item.sizes.length > 0) {
    return item.sizes.map((size, index) => ({
      id: size.id || `${size.name || "size"}-${index}`,
      name: size.name || size.label || `Size ${index + 1}`,
      price: Number(size.price || item.price || 0),
      oldPrice: Number(size.oldPrice || 0),
      description: size.description || "",
    }));
  }
  return [
    {
      id: "default",
      name: "Mặc định",
      price: Number(item?.price || 0),
      oldPrice: Number(item?.oldPrice || 0),
      description: "",
    },
  ];
}

function getMinPrice(item) {
  const sizes = getItemSizes(item);
  const prices = sizes.map((s) => Number(s.price || 0)).filter(Boolean);
  if (prices.length > 0) return Math.min(...prices);
  return Number(item?.price || 0);
}

function getOldPrice(item, displayPrice) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];
  const oldPrices = sizes
    .map((s) => Number(s.oldPrice || 0))
    .filter((p) => p > Number(displayPrice || 0));
  if (oldPrices.length > 0) return Math.min(...oldPrices);
  return Number(item?.oldPrice || 0);
}

function getShopToppings(shop) {
  if (!Array.isArray(shop?.toppings)) return [];
  return shop.toppings
    .filter((t) => t?.name)
    .map((t, i) => ({
      id: t.id || `topping-${i}`,
      name: String(t.name || "").trim(),
      price: Number(t.price || 0),
      order: Number(t.order || i + 1),
    }))
    .sort((a, b) => a.order - b.order);
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */
export default function ProductGrid({ items = [], shop, emptyText }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#dbe0ad] bg-white px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e7eac3] text-[#294f31]">
          <Coffee size={30} />
        </div>
        <p className="mt-4 text-base font-black text-[#294f31]">
          Không tìm thấy sản phẩm
        </p>
        <p className="mt-1.5 max-w-[220px] text-sm font-medium leading-6 text-[#647343]">
          {emptyText || "Hiện chưa có món nào phù hợp."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 2-col on mobile, 3-col md, 4-col xl */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <ProductCard
            key={item.id}
            item={item}
            shop={shop}
            index={index}
            onOpen={() => setSelectedItem(item)}
          />
        ))}
      </div>

      <ProductDetailModal
        item={selectedItem}
        shop={shop}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

/* ─── Product Card ────────────────────────────────────────────────────────── */
function ProductCard({ item, shop, index, onOpen }) {
  const images = getItemImages(item);
  const firstImage = images[0];

  const isUnavailable = item.isAvailable === false;
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
  const displayPrice = getMinPrice(item);
  const oldPrice = getOldPrice(item, displayPrice);
  const hasSale = oldPrice > displayPrice && displayPrice > 0;

  return (
    <button
      type="button"
      onClick={isUnavailable ? undefined : onOpen}
      disabled={isUnavailable}
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
      className={cn(
        "hop-reveal group flex flex-col overflow-hidden rounded-[16px] border border-[#dbe0ad] bg-white text-left shadow-sm",
        "transition-all duration-200",
        !isUnavailable && [
          "cursor-pointer",
          "hover:-translate-y-1 hover:border-[#294f31]/40 hover:shadow-[0_12px_32px_rgba(41,79,49,0.14)]",
          "active:scale-[0.98]",
        ],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294f31] focus-visible:ring-offset-2",
        isUnavailable && "cursor-not-allowed opacity-50 grayscale"
      )}
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f7f8ec]">
        {firstImage?.url ? (
          <img
            src={firstImage.url}
            alt={firstImage.name || item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#294f31]/30">
            <Coffee size={36} />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {item.isFeatured && !isUnavailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#294f31] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
              <Zap size={8} aria-hidden="true" />
              Hot
            </span>
          )}
          {hasSale && !isUnavailable && (
            <span className="rounded-full bg-[#b22830] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
              Sale
            </span>
          )}
          {isUnavailable && (
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
              Hết
            </span>
          )}
        </div>

        {/* Bottom-right chips */}
        {(images.length > 1 || hasSizes) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {images.length > 1 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                <ImageIcon size={8} aria-hidden="true" />
                {images.length}
              </span>
            )}
            {hasSizes && (
              <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                {item.sizes.length} size
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-[9px] font-black uppercase tracking-[0.1em] text-[#819045]">
          {shop?.name || "Home Coffee"}
        </p>

        <h3 className="mt-1 line-clamp-2 text-[12.5px] font-black leading-[1.35] text-[#294f31] sm:text-sm">
          {item.name}
        </h3>

        <div className="mt-auto pt-2.5">
          {hasSale && (
            <p className="mb-0.5 text-[10px] text-neutral-400 line-through">
              {formatPrice(oldPrice)}
            </p>
          )}
          <p className="text-[13px] font-black text-[#b22830] sm:text-sm">
            {hasSizes ? `Từ ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
          </p>

          {/* CTA pill */}
          <span
            className={cn(
              "mt-2 flex min-h-[34px] w-full items-center justify-center gap-1 rounded-[10px] text-[10px] font-black uppercase tracking-[0.06em] transition-colors duration-200",
              !isUnavailable
                ? "bg-[#f7f8ec] text-[#294f31] group-hover:bg-[#294f31] group-hover:text-white"
                : "bg-neutral-100 text-neutral-400"
            )}
          >
            <Eye size={11} aria-hidden="true" />
            Xem chi tiết
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Detail Modal ────────────────────────────────────────────────────────── */
function ProductDetailModal({ item, shop, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("");

  const scrollRef = useRef(null);
  // Swipe tracking: we record both axes so a vertical scroll gesture that
  // starts on top of the image never gets mistaken for a left/right swipe.
  const touchState = useRef({ x: 0, y: 0, locked: null });

  const images = useMemo(() => (item ? getItemImages(item) : []), [item]);
  const sizes = useMemo(() => (item ? getItemSizes(item) : []), [item]);
  const toppings = useMemo(() => getShopToppings(shop), [shop]);

  const activeImage = images[activeImageIndex] || images[0];
  const selectedSize = sizes.find((s) => s.id === selectedSizeId) || sizes[0];

  const hasRealSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasSelectedSizeSale =
    Number(selectedSize?.oldPrice || 0) > Number(selectedSize?.price || 0);

  const imageCount = images.length;

  const goPrev = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImageIndex((p) => (p === 0 ? imageCount - 1 : p - 1));
  }, [imageCount]);

  const goNext = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImageIndex((p) => (p === imageCount - 1 ? 0 : p + 1));
  }, [imageCount]);

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchState.current = { x: t.clientX, y: t.clientY, locked: null };
  }

  function handleTouchMove(e) {
    const state = touchState.current;
    const t = e.touches[0];
    const dx = t.clientX - state.x;
    const dy = t.clientY - state.y;

    // Decide the gesture's dominant axis only once, as soon as the
    // finger has moved a meaningful distance — this stops a vertical
    // page-scroll attempt over the image from ever triggering a swipe.
    if (state.locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      state.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    // Only hijack the gesture (block the page scroll) once we're sure
    // it's a horizontal swipe over the carousel.
    if (state.locked === "x" && images.length > 1) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    const state = touchState.current;
    if (state.locked === "x") {
      const dx = e.changedTouches[0].clientX - state.x;
      if (Math.abs(dx) > 44) {
        dx < 0 ? goNext() : goPrev();
      }
    }
    touchState.current = { x: 0, y: 0, locked: null };
  }

  // Reset to first image / default size whenever a different product is opened.
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSizeId("");
    const id = requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: 0, behavior: "auto" })
    );
    return () => cancelAnimationFrame(id);
  }, [item?.id]);

  // Lock background scroll while the sheet is open. Plain `overflow:hidden`
  // on <body> does not reliably stop scrolling on iOS Safari, so we also
  // pin the body in place and restore the exact scroll position on close —
  // this is keyed only on whether the modal is open/closed, not on every
  // image change, so it never re-toggles mid-interaction.
  const isOpen = Boolean(item);
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Keyboard navigation — re-subscribes only when the modal opens/closes
  // or the image count changes, never on every keystroke or swipe.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goPrev, goNext]);

  if (!item || typeof document === "undefined") return null;

  const displayPrice = selectedSize?.price || item.price;
  const isUnavailable = item.isAvailable === false;

  return createPortal(
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết: ${item.name}`}
    >
      {/* Click-outside to close (desktop) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 hidden cursor-default sm:block"
        aria-label="Đóng"
        tabIndex={-1}
      />

      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:relative sm:inset-auto sm:mx-auto sm:my-8 sm:max-h-[88dvh] sm:max-w-4xl sm:rounded-[20px]">

        {/* Drag pill — mobile only */}
        <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        {/* ── Sticky header ── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#dbe0ad] bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#819045]">
              {shop?.name || "Home Coffee"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-base font-black text-[#294f31] sm:text-lg">
              {item.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#dbe0ad] transition hover:bg-[#e7eac3] active:scale-95"
            aria-label="Đóng chi tiết"
          >
            <X size={19} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="sm:grid sm:grid-cols-[1fr_1.05fr]">

            {/* Left — image gallery */}
            <div className="bg-[#f7f8ec] sm:border-r sm:border-[#dbe0ad]">
              {/* Main image */}
              <div
                className="relative select-none overflow-hidden touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex items-center justify-center bg-[#f7f8ec]"
                  style={{ height: "min(52vw, 280px)" }}
                >
                  {activeImage?.url ? (
                    <img
                      key={activeImage.url}
                      src={activeImage.url}
                      alt={activeImage.name || item.name}
                      className="h-full w-full object-contain p-4 sm:p-6"
                      draggable={false}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[#294f31]/30">
                      <Coffee size={56} />
                    </div>
                  )}
                </div>

                {/* Prev/Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad] transition hover:bg-white active:scale-95"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad] transition hover:bg-white active:scale-95"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`Ảnh ${idx + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-200",
                          idx === activeImageIndex
                            ? "w-5 bg-[#294f31]"
                            : "w-1.5 bg-[#294f31]/25"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip — only when ≥3 images */}
              {images.length >= 3 && (
                <div
                  className="flex gap-2 overflow-x-auto px-3 pb-3 pt-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {images.map((img, idx) => (
                    <button
                      key={`${img.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Ảnh ${idx + 1}`}
                      className={cn(
                        "h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border-2 bg-white transition-all",
                        idx === activeImageIndex
                          ? "border-[#294f31]"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.name || item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — info */}
            <div className="space-y-4 p-4 pb-5 sm:p-5">

              {/* Status badges */}
              <div className="flex flex-wrap gap-1.5">
                {item.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#294f31] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                    <Star size={9} aria-hidden="true" />
                    Nổi bật
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
                    isUnavailable
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-[#e7eac3] text-[#294f31]"
                  )}
                >
                  {isUnavailable ? "Tạm hết" : "Còn bán"}
                </span>
                {hasRealSizes && (
                  <span className="rounded-full bg-[#f7f8ec] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#647343] ring-1 ring-[#dbe0ad]">
                    {item.sizes.length} lựa chọn
                  </span>
                )}
              </div>

              {/* Name — only on desktop (mobile shows in header) */}
              <div className="hidden sm:block">
                <h2 className="text-2xl font-black leading-snug tracking-tight text-[#294f31]">
                  {item.name}
                </h2>
                {item.description && (
                  <p className="mt-2 text-sm font-medium leading-7 text-[#647343]">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Description — mobile only */}
              {item.description && (
                <p className="text-sm font-medium leading-7 text-[#647343] sm:hidden">
                  {item.description}
                </p>
              )}

              {/* Price box */}
              <div className="rounded-[14px] bg-[#f7f8ec] p-3.5">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#819045]">
                  Giá sản phẩm
                </p>
                {hasSelectedSizeSale && (
                  <p className="mt-1 text-sm text-neutral-400 line-through">
                    {formatPrice(selectedSize.oldPrice)}
                  </p>
                )}
                <p className="mt-0.5 text-3xl font-black text-[#b22830]">
                  {formatPrice(displayPrice)}
                </p>
                {selectedSize?.description && (
                  <p className="mt-1.5 text-xs font-medium leading-5 text-[#647343]">
                    {selectedSize.description}
                  </p>
                )}
              </div>

              {/* Size selector */}
              {hasRealSizes && (
                <div>
                  <p className="mb-2.5 text-sm font-black text-[#294f31]">
                    Chọn size
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((size) => {
                      const isActive = selectedSize?.id === size.id;
                      const sizeSale = Number(size.oldPrice || 0) > Number(size.price || 0);
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={cn(
                            "flex min-h-[62px] flex-col justify-between rounded-[12px] border p-3 text-left transition-all duration-150",
                            isActive
                              ? "border-[#294f31] bg-[#294f31]"
                              : "border-[#dbe0ad] bg-white hover:border-[#819045]"
                          )}
                        >
                          <span
                            className={cn(
                              "text-[13px] font-black",
                              isActive ? "text-white" : "text-[#294f31]"
                            )}
                          >
                            {size.name}
                          </span>
                          <div>
                            {sizeSale && (
                              <p
                                className={cn(
                                  "text-[10px] line-through",
                                  isActive ? "text-white/50" : "text-neutral-400"
                                )}
                              >
                                {formatPrice(size.oldPrice)}
                              </p>
                            )}
                            <p
                              className={cn(
                                "text-[12px] font-black",
                                isActive ? "text-white" : "text-[#b22830]"
                              )}
                            >
                              {formatPrice(size.price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#f7f8ec] px-2.5 py-1 text-[11px] font-bold text-[#647343] ring-1 ring-[#dbe0ad]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Toppings */}
              {toppings.length > 0 && (
                <div>
                  <p className="mb-2.5 flex items-center gap-1.5 text-sm font-black text-[#294f31]">
                    <Plus size={14} aria-hidden="true" />
                    Topping tại quán
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2">
                    {toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between gap-2 rounded-[10px] border border-[#dbe0ad] bg-white px-3 py-2"
                      >
                        <span className="line-clamp-1 text-[12px] font-black text-[#294f31]">
                          {topping.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-[#294f31] px-2 py-0.5 text-[10px] font-black text-white">
                          {topping.price > 0 ? `+${formatPrice(topping.price)}` : "Free"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* bottom spacer on mobile so content clears the footer */}
              <div className="h-1 sm:hidden" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ── Sticky footer ── */}
        <div
          className="shrink-0 border-t border-[#dbe0ad] bg-white px-4 py-3 sm:px-5"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-[#294f31] px-5 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#1f3d26] active:scale-[0.98]"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}