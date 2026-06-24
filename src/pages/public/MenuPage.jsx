import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CalendarCheck, Sparkles } from "lucide-react";

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
      const target = document.getElementById(hashId);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 180);

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

      <div className="relative z-20 -mt-5">
        <QuickActions shop={shop} />
        <ToppingSection shop={shop} />
       </div>

      <ReservationCallout shop={shop} onOpen={() => setReservationOpen(true)} />

      <PromotionStrip
        promotions={promotions}
        onOpenPromotion={setSelectedPromotion}
      />

      {shouldShowFeatured && (
        <FeaturedProducts items={featuredItems} shop={shop} />
      )}

      <section
        id="menu"
        className="mx-auto max-w-7xl scroll-mt-24 px-3 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8"
      >
        <div className="overflow-hidden rounded-[30px] border border-[#dbe0ad] bg-white/78 p-3 shadow-[0_24px_80px_rgba(41,79,49,0.10)] backdrop-blur-xl sm:p-5 lg:p-6">
          <div className="mb-5 grid gap-4 border-b border-[#eef0cf] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#e7eac3] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#294f31]">
                <Sparkles size={14} />
                Menu Home Coffee
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#294f31] sm:text-4xl lg:text-5xl">
                {activeCategoryName}
              </h2>

              <p className="mt-2 text-sm font-semibold leading-6 text-[#647343]">
                Đang hiển thị{" "}
                <span className="font-black text-[#294f31]">
                  {filteredItems.length}
                </span>
                /{items.length} sản phẩm.
              </p>
            </div>

            <div className="rounded-3xl bg-[#294f31] p-4 text-white shadow-sm">
              <p className="text-3xl font-black text-white">{items.length}</p>
              <p className="mt-0.5 text-xs font-black uppercase tracking-[0.14em] text-white/70">
                sản phẩm
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
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

              <div className="mt-4 sm:mt-5">
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

function ReservationCallout({ shop, onOpen }) {
  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-[28px] border border-[#dbe0ad] bg-[#294f31] shadow-[0_24px_70px_rgba(41,79,49,0.15)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="p-5 sm:p-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#e7eac3]">
            <CalendarCheck size={14} />
            Đặt bàn nhanh
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
            Ghé {shop?.name || "Home Coffee"} hôm nay?
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
            Gửi thông tin đặt bàn, quán sẽ kiểm tra và liên hệ lại với bạn.
          </p>
        </div>

        <div className="p-5 pt-0 sm:p-7 lg:pt-7">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e7eac3] px-6 py-4 text-sm font-black text-[#294f31] shadow-sm transition hover:bg-[#dfe3ae] lg:w-auto"
          >
            <CalendarCheck size={18} />
            Đặt bàn ngay
          </button>
        </div>
      </div>
    </section>
  );
}

