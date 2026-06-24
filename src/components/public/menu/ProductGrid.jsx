import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Eye,
  ImageIcon,
  Plus,
  Star,
  X,
} from "lucide-react";

import { cn, formatPrice } from "./publicMenuUtils";

function getItemImages(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images
      .map((image, index) => {
        if (typeof image === "string") {
          return {
            url: image,
            name: `${item.name || "Sản phẩm"} ${index + 1}`,
          };
        }

        return {
          url: image?.url || "",
          name: image?.name || `${item.name || "Sản phẩm"} ${index + 1}`,
        };
      })
      .filter((image) => image.url);
  }

  if (item?.imageUrl) {
    return [
      {
        url: item.imageUrl,
        name: item.name || "Sản phẩm",
      },
    ];
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
  const prices = sizes.map((size) => Number(size.price || 0)).filter(Boolean);

  if (prices.length > 0) return Math.min(...prices);

  return Number(item?.price || 0);
}

function getOldPrice(item, displayPrice) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];

  const oldPrices = sizes
    .map((size) => Number(size.oldPrice || 0))
    .filter((price) => price > Number(displayPrice || 0));

  if (oldPrices.length > 0) return Math.min(...oldPrices);

  return Number(item?.oldPrice || 0);
}

function getShopToppings(shop) {
  if (!Array.isArray(shop?.toppings)) return [];

  return shop.toppings
    .filter((topping) => topping?.name)
    .map((topping, index) => ({
      id: topping.id || `topping-${index}`,
      name: String(topping.name || "").trim(),
      price: Number(topping.price || 0),
      order: Number(topping.order || index + 1),
    }))
    .sort((a, b) => a.order - b.order);
}

export default function ProductGrid({ items = [], shop, emptyText }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-[18px] border border-[#dbe0ad] bg-white px-5 py-12 text-center shadow-sm sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#dbe0ad]">
          <Coffee size={28} />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#294f31] sm:text-xl">
          Không tìm thấy sản phẩm
        </h3>

        <p className="mt-2 text-sm font-semibold leading-6 text-[#647343]">
          {emptyText || "Hiện chưa có món nào phù hợp."}
        </p>
      </div>
    );
  }

  return (
    <>
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

function ProductCard({ item, shop, index, onOpen }) {
  const images = getItemImages(item);
  const firstImage = images[0];

  const isUnavailable = item.isAvailable === false;
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
  const displayPrice = getMinPrice(item);
  const oldPrice = getOldPrice(item, displayPrice);
  const hasSale = oldPrice > displayPrice;
  const brandName = shop?.name || "Home Coffee";

  return (
    <button
      type="button"
      onClick={isUnavailable ? undefined : onOpen}
      style={{ animationDelay: `${Math.min(index, 10) * 34}ms` }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[16px] border border-[#dbe0ad] bg-white text-left shadow-sm transition-all duration-200",
        !isUnavailable &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-[#294f31] hover:shadow-[0_14px_34px_rgba(41,79,49,0.14)] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294f31] focus-visible:ring-offset-2",
        isUnavailable && "cursor-default opacity-50 grayscale"
      )}
    >
      <div className="relative bg-[#f7f8ec]">
        <div className="aspect-square w-full overflow-hidden">
          {firstImage?.url ? (
            <img
              src={firstImage.url}
              alt={firstImage.name || item.name}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.05] sm:p-4"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#294f31]/45">
              <Coffee size={36} />
            </div>
          )}
        </div>

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#294f31] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
              <Star size={8} />
              Hot
            </span>
          )}

          {hasSale && !isUnavailable && (
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#b22830] shadow-sm ring-1 ring-red-100">
              Sale
            </span>
          )}

          {isUnavailable && (
            <span className="rounded-md bg-neutral-900 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
              Tạm hết
            </span>
          )}
        </div>

        {(images.length > 1 || hasSizes) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {images.length > 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-black text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]">
                <ImageIcon size={9} />
                {images.length}
              </span>
            )}

            {hasSizes && (
              <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-black text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]">
                Size
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
        <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-[#647343] sm:text-[10px]">
          {brandName}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[36px] text-[13px] font-black leading-snug text-[#294f31] sm:min-h-[40px] sm:text-sm">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#647343]">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-2.5">
          {hasSale && (
            <p className="mb-0.5 text-[11px] text-neutral-400 line-through">
              {formatPrice(oldPrice)}
            </p>
          )}

          <p className="text-sm font-black text-[#b22830] sm:text-[15px]">
            {hasSizes ? `Từ ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
          </p>

          <span className="mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#dbe0ad] px-2 text-[10px] font-black uppercase tracking-[0.07em] text-[#294f31] transition-colors duration-200 group-hover:border-[#294f31] group-hover:bg-[#294f31] group-hover:text-white">
            <Eye size={12} />
            Chi tiết
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({ item, shop, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("");

  const scrollRef = useRef(null);
  const touchStartX = useRef(null);

  const images = useMemo(() => (item ? getItemImages(item) : []), [item]);
  const sizes = useMemo(() => (item ? getItemSizes(item) : []), [item]);
  const toppings = useMemo(() => getShopToppings(shop), [shop]);

  const activeImage = images[activeImageIndex] || images[0];
  const selectedSize = sizes.find((size) => size.id === selectedSizeId) || sizes[0];

  const hasRealSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasSelectedSizeSale =
    Number(selectedSize?.oldPrice || 0) > Number(selectedSize?.price || 0);

  function goPrev() {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  function goNext() {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(delta) > 44) {
      delta < 0 ? goNext() : goPrev();
    }

    touchStartX.current = null;
  }

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSizeId("");

    window.setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }, 0);
  }, [item?.id]);

  useEffect(() => {
  if (!item) return;

  function handleKeyDown(event) {
    if (event.key === "Escape") onClose();
    if (event.key === "ArrowLeft") goPrev();
    if (event.key === "ArrowRight") goNext();
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [item, activeImageIndex, images.length]);

  if (!item) return null;

  return (
    <div
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/45 backdrop-blur-[2px] sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết: ${item.name}`}
      >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng"
        tabIndex={-1}
      />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full flex-col bg-white shadow-2xl sm:my-6 sm:min-h-0 sm:max-h-[88vh] sm:max-w-4xl sm:overflow-hidden sm:rounded-[24px]">        <div className="flex shrink-0 justify-center bg-white pb-1.5 pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-[#dbe0ad] bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#647343]">
              {shop?.name || "Home Coffee"}
            </p>

            <p className="mt-0.5 line-clamp-1 text-base font-black text-[#294f31]">
              {item.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#dbe0ad] transition hover:bg-[#e7eac3]"
            aria-label="Đóng chi tiết"
          >
            <X size={20} />
          </button>
        </div>

       <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-visible sm:overflow-y-auto sm:overscroll-contain sm:[-webkit-overflow-scrolling:touch]"
        >
          <div className="grid min-h-full sm:grid-cols-[0.92fr_1.08fr]">
            <div className="bg-[#f7f8ec] p-3 sm:p-5">
              <div
                className="relative overflow-hidden rounded-[18px] bg-white ring-1 ring-[#dbe0ad]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="aspect-[4/3] max-h-[38dvh] sm:aspect-square sm:max-h-none">
                  {activeImage?.url ? (
                    <img
                      src={activeImage.url}
                      alt={activeImage.name || item.name}
                      className="h-full w-full object-contain p-3 sm:p-5"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[#294f31]/40">
                      <Coffee size={58} />
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#294f31] shadow-sm ring-1 ring-[#dbe0ad]"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-white ring-2 transition sm:h-16 sm:w-16",
                        index === activeImageIndex
                          ? "ring-[#294f31]"
                          : "ring-[#dbe0ad]"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.name || item.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 pb-6 sm:p-5">
              <div>
                {item.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#294f31] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                    <Star size={12} />
                    Món nổi bật
                  </span>
                )}

                <h2 className="mt-3 text-2xl font-black tracking-tight text-[#294f31] sm:text-3xl">
                  {item.name}
                </h2>

                {item.description && (
                  <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-[#647343]">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="rounded-[16px] border border-[#dbe0ad] bg-[#f7f8ec] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#647343]">
                  Giá sản phẩm
                </p>

                {hasSelectedSizeSale && (
                  <p className="mt-2 text-sm font-bold text-neutral-400 line-through">
                    {formatPrice(selectedSize.oldPrice)}
                  </p>
                )}

                <p className="mt-1 text-3xl font-black text-[#b22830]">
                  {formatPrice(selectedSize?.price || item.price)}
                </p>

                {selectedSize?.description && (
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#647343]">
                    {selectedSize.description}
                  </p>
                )}
              </div>

              {hasRealSizes && (
                <div>
                  <p className="text-sm font-black text-[#294f31]">
                    Chọn size
                  </p>

                  <div className="mt-2 grid gap-2">
                    {sizes.map((size) => {
                      const isActive = selectedSize?.id === size.id;

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left transition",
                            isActive
                              ? "border-[#294f31] bg-[#294f31] text-white"
                              : "border-[#dbe0ad] bg-white text-[#294f31] hover:bg-[#f7f8ec]"
                          )}
                        >
                          <span className="font-black">{size.name}</span>

                          <span
                            className={cn(
                              "shrink-0 text-sm font-black",
                              isActive ? "text-white" : "text-[#b22830]"
                            )}
                          >
                            {formatPrice(size.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div>
                  <p className="text-sm font-black text-[#294f31]">Tags</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f7f8ec] px-3 py-1.5 text-xs font-black text-[#647343] ring-1 ring-[#dbe0ad]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {toppings.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-[#294f31]">
                    <Plus size={16} />
                    Topping tại quán
                  </p>

                  <div className="mt-2 grid gap-2">
                    {toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between gap-3 rounded-[14px] border border-[#dbe0ad] bg-white px-4 py-3"
                      >
                        <span className="line-clamp-1 text-sm font-black text-[#294f31]">
                          {topping.name}
                        </span>

                        <span className="shrink-0 rounded-full bg-[#294f31] px-3 py-1 text-xs font-black text-white">
                          {topping.price > 0
                            ? `+${formatPrice(topping.price)}`
                            : "Free"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-4 sm:hidden" />
            </div>
          </div>
        </div>

        <div
          className="shrink-0 border-t border-[#dbe0ad] bg-white px-4 py-3 sm:px-5"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#294f31] px-5 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#1f3d26] active:scale-[0.98]"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}