import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CalendarCheck, Coffee, Sparkles } from "lucide-react";

import { useShopMenu } from "../../hooks/useShopMenu";

import CategorySidebar from "../../components/public/menu/CategorySidebar";
import FeaturedProducts from "../../components/public/menu/FeaturedProducts";
import HeroBanner from "../../components/public/menu/HeroBanner";
import MenuHeader from "../../components/public/menu/MenuHeader";
import MenuToolbar from "../../components/public/menu/MenuToolbar";
import ProductGrid from "../../components/public/menu/ProductGrid";
import PromotionModal from "../../components/public/menu/PromotionModal";
import PromotionStrip from "../../components/public/menu/PromotionStrip";
import QuickActions from "../../components/public/menu/QuickActions";
import ToppingSection from "../../components/public/menu/ToppingSection";
import ReservationModal from "../../components/public/menu/ReservationModal";
import ShopFooter from "../../components/public/menu/ShopFooter";
import {
  LoadingScreen,
  StateBox,
} from "../../components/public/menu/MenuStates";

import {
  getCategoryCountMap,
  sortMenuItems,
} from "../../components/public/menu/publicMenuUtils";

function getHashId(hash = "") {
  if (!hash) return "";

  try {
    return decodeURIComponent(hash.replace("#", "").trim());
  } catch {
    return hash.replace("#", "").trim();
  }
}

function scrollToElementById(hashId) {
  const target = document.getElementById(hashId);

  if (!target) return;

  const headerOffset = window.innerWidth < 640 ? 78 : 92;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
}

export default function MenuPage() {
  const { shopSlug } = useParams();
  const location = useLocation();

  const {
    shop,
    categories = [],
    items = [],
    promotions = [],
    loading,
    error,
  } = useShopMenu(shopSlug);

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortMode, setSortMode] = useState("default");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [reservationOpen, setReservationOpen] = useState(false);

  useEffect(() => {
    if (loading || !shop) return;

    const hashId = getHashId(location.hash || window.location.hash);

    if (!hashId) return;

    const timer = window.setTimeout(() => {
      scrollToElementById(hashId);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [location.hash, loading, shop, promotions.length, items.length]);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const sortedItems = useMemo(() => {
    return sortMenuItems(items, sortMode);
  }, [items, sortMode]);

  const categoryCountMap = useMemo(() => {
    return getCategoryCountMap(items);
  }, [items]);

  const featuredItems = useMemo(() => {
    return items
      .filter((item) => item.isFeatured === true)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .slice(0, 10);
  }, [items]);

  const filteredItems = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();

    return sortedItems.filter((item) => {
      const tagsText = Array.isArray(item.tags)
        ? item.tags.join(" ").toLowerCase()
        : "";

      const matchKeyword =
        !keywordLower ||
        item.name?.toLowerCase().includes(keywordLower) ||
        item.description?.toLowerCase().includes(keywordLower) ||
        tagsText.includes(keywordLower);

      const matchCategory =
        activeCategory === "all" || item.categoryId === activeCategory;

      return matchKeyword && matchCategory;
    });
  }, [sortedItems, keyword, activeCategory]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === "all") return "Tất cả sản phẩm";

    return (
      visibleCategories.find((category) => category.id === activeCategory)
        ?.name || "Danh mục"
    );
  }, [activeCategory, visibleCategories]);

  const shouldShowFeatured = activeCategory === "all" && !keyword.trim();

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#f7f8ec] px-4">
        <StateBox title="Có lỗi xảy ra" description={error} />
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#f7f8ec] px-4">
        <StateBox
          title="Không tìm thấy menu"
          description="Menu chưa được public hoặc đường dẫn không đúng."
        />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f7f8ec] text-[#294f31]">
      <MenuHeader
        shop={shop}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenReservation={() => setReservationOpen(true)}
      />

      <HeroBanner shop={shop} totalItems={items.length} />

      <section className="relative z-20 -mt-4 px-2 sm:-mt-5 sm:px-4 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4">
          <QuickActions shop={shop} />
          <ToppingSection shop={shop} />
        </div>
      </section>

      <ReservationCallout shop={shop} onOpen={() => setReservationOpen(true)} />

      {promotions.length > 0 && (
        <PromotionStrip
          promotions={promotions}
          onOpenPromotion={setSelectedPromotion}
        />
      )}

      {shouldShowFeatured && featuredItems.length > 0 && (
        <FeaturedProducts items={featuredItems} shop={shop} />
      )}

      <section
        id="menu"
        className="mx-auto max-w-7xl scroll-mt-24 px-2 pb-8 pt-4 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8"
      >
        <div className="overflow-hidden rounded-[22px] border border-[#dbe0ad] bg-white/88 p-2.5 shadow-[0_20px_60px_rgba(41,79,49,0.10)] backdrop-blur-xl sm:rounded-[30px] sm:p-5 lg:p-6">
          <MenuIntro
            activeCategoryName={activeCategoryName}
            filteredCount={filteredItems.length}
            totalCount={items.length}
          />

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
            <CategorySidebar
              categories={visibleCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              countMap={categoryCountMap}
              totalItems={items.length}
            />

            <div className="min-w-0">
              <MenuToolbar
                keyword={keyword}
                setKeyword={setKeyword}
                sortMode={sortMode}
                setSortMode={setSortMode}
                categories={visibleCategories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />

              <div className="mt-3 sm:mt-5">
                <ProductGrid
                  items={filteredItems}
                  shop={shop}
                  emptyText={
                    keyword.trim()
                      ? `Không có món nào khớp với “${keyword}”.`
                      : "Danh mục này hiện chưa có món."
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopFooter shop={shop} />

      <PromotionModal
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />

      <ReservationModal
        open={reservationOpen}
        shop={shop}
        onClose={() => setReservationOpen(false)}
      />
    </main>
  );
}

function MenuIntro({ activeCategoryName, filteredCount, totalCount }) {
  return (
    <div className="mb-4 border-b border-[#eef0cf] pb-4 sm:mb-5 sm:pb-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#e7eac3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#294f31] sm:text-[11px] sm:tracking-[0.16em]">
            <Sparkles size={13} className="shrink-0 sm:size-[14px]" />
            <span className="truncate">Menu Home Coffee</span>
          </p>

          <h2 className="mt-3 break-words text-[28px] font-black leading-[1.02] tracking-[-0.045em] text-[#294f31] sm:text-4xl lg:text-5xl">
            {activeCategoryName}
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-[#647343]">
            Đang hiển thị{" "}
            <span className="font-black text-[#294f31]">{filteredCount}</span>
            /{totalCount} sản phẩm.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:w-[260px]">
          <MiniStatCard label="Đang xem" value={filteredCount} />
          <MiniStatCard label="Tổng món" value={totalCount} dark />
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({ label, value, dark = false }) {
  return (
    <div
      className={[
        "min-w-0 rounded-[18px] p-3 shadow-sm sm:p-4",
        dark
          ? "bg-[#294f31] text-white"
          : "border border-[#dbe0ad] bg-[#f7f8ec] text-[#294f31]",
      ].join(" ")}
    >
      <p
        className={[
          "text-2xl font-black leading-none sm:text-3xl",
          dark ? "text-white" : "text-[#294f31]",
        ].join(" ")}
      >
        {value}
      </p>

      <p
        className={[
          "mt-1 truncate text-[10px] font-black uppercase tracking-[0.12em]",
          dark ? "text-white/70" : "text-[#647343]",
        ].join(" ")}
      >
        {label}
      </p>
    </div>
  );
}

function ReservationCallout({ shop, onOpen }) {
  return (
    <section className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="overflow-hidden rounded-[22px] border border-[#dbe0ad] bg-[#294f31] shadow-[0_18px_50px_rgba(41,79,49,0.14)] sm:rounded-[28px] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="p-4 sm:p-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#e7eac3] sm:text-[11px] sm:tracking-[0.16em]">
            <CalendarCheck size={14} />
            Đặt bàn nhanh
          </p>

          <h2 className="mt-3 text-xl font-black tracking-[-0.03em] text-white sm:text-3xl">
            Ghé {shop?.name || "Home Coffee"} hôm nay?
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
            Gửi thông tin đặt bàn, quán sẽ kiểm tra và liên hệ lại với bạn.
          </p>
        </div>

        <div className="px-4 pb-4 sm:px-7 sm:pb-7 lg:p-7">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#e7eac3] px-5 text-sm font-black text-[#294f31] shadow-sm transition hover:bg-[#dfe3ae] active:scale-[0.98] lg:w-auto lg:px-6"
          >
            <CalendarCheck size={18} />
            Đặt bàn ngay
          </button>
        </div>
      </div>
    </section>
  );
}
