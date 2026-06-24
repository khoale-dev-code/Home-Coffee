import { useCallback, useEffect, useRef, useState } from "react";

import { getShopBySlug } from "../services/shopService";
import { getCategories } from "../services/categoryService";
import { getItems } from "../services/itemService";
import { getActivePromotions } from "../services/promotionService";
import { getPublishedPosts } from "../services/postService";

const CACHE_VERSION = "v2";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

function getUserAgent() {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || "";
}

function isInAppBrowser() {
  return /FBAN|FBAV|FB_IAB|Messenger|Instagram|Line|Zalo|MicroMessenger|wv/i.test(
    getUserAgent()
  );
}

function shouldShowDebugError() {
  if (import.meta.env.DEV) return true;
  if (isInAppBrowser()) return true;

  if (typeof window === "undefined") return false;

  return new URLSearchParams(window.location.search).has("debug");
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();

  return (
    code.includes("unavailable") ||
    code.includes("deadline-exceeded") ||
    code.includes("internal") ||
    code.includes("aborted") ||
    code.includes("resource-exhausted") ||
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("webchannel") ||
    message.includes("transport") ||
    message.includes("failed to fetch")
  );
}

async function withRetry(task, options = {}) {
  const {
    retries = 2,
    delayMs = 500,
    label = "request",
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === retries) {
        throw error;
      }

      console.warn(`[useShopMenu] Retry ${label}:`, {
        attempt: attempt + 1,
        code: error?.code,
        message: error?.message,
      });

      await sleep(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}

function getErrorInfo(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "unknown",
    message: error?.message || String(error || "Unknown error"),
    stack: error?.stack || "",
    inAppBrowser: isInAppBrowser(),
    userAgent: getUserAgent(),
    url: typeof window !== "undefined" ? window.location.href : "",
  };
}

function buildUserError(error) {
  const info = getErrorInfo(error);

  if (!shouldShowDebugError()) {
    return "Không thể tải menu. Vui lòng thử lại.";
  }

  return [
    "Không thể tải menu.",
    `Mã lỗi: ${info.code}`,
    info.message ? `Chi tiết: ${info.message}` : "",
    info.inAppBrowser ? "Trình duyệt: Messenger/Facebook webview" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function getCacheKey(shopSlug) {
  return `home-coffee-menu:${CACHE_VERSION}:${shopSlug}`;
}

function readMenuCache(shopSlug) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getCacheKey(shopSlug));
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.savedAt || !parsed?.data) return null;

    const expired = Date.now() - Number(parsed.savedAt) > CACHE_TTL_MS;

    if (expired) return null;

    return parsed.data;
  } catch (error) {
    console.warn("[useShopMenu] Không đọc được cache:", error);
    return null;
  }
}

function writeMenuCache(shopSlug, data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getCacheKey(shopSlug),
      JSON.stringify({
        savedAt: Date.now(),
        data,
      })
    );
  } catch (error) {
    console.warn("[useShopMenu] Không lưu được cache:", error);
  }
}

function inferMediaTypeFromUrl(url = "", fallbackType = "image") {
  const cleanUrl = String(url).toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogg")
  ) {
    return "video";
  }

  return fallbackType === "video" ? "video" : "image";
}

function normalizeMediaItem(media, index = 0, fallbackName = "Media") {
  if (!media) return null;

  if (typeof media === "string") {
    const url = media.trim();

    if (!url) return null;

    return {
      id: `media-${index}`,
      url,
      type: inferMediaTypeFromUrl(url),
      name: `${fallbackName} ${index + 1}`,
      mimeType: "",
      size: 0,
      publicId: "",
      width: 0,
      height: 0,
    };
  }

  const url = media.url || "";

  if (!url) return null;

  return {
    id: media.id || media.localId || media.publicId || `media-${index}`,
    url,
    type: media.type || inferMediaTypeFromUrl(url),
    name: media.name || `${fallbackName} ${index + 1}`,
    mimeType: media.mimeType || "",
    size: Number(media.size || 0),
    publicId: media.publicId || "",
    width: Number(media.width || 0),
    height: Number(media.height || 0),
  };
}

function normalizeMediaList(mediaList = [], fallbackName = "Media") {
  if (!Array.isArray(mediaList)) return [];

  return mediaList
    .map((media, index) => normalizeMediaItem(media, index, fallbackName))
    .filter(Boolean);
}

function getPrimaryMediaUrl(mediaList = []) {
  const normalizedMedia = normalizeMediaList(mediaList);

  return (
    normalizedMedia.find((media) => media.type === "image")?.url ||
    normalizedMedia[0]?.url ||
    ""
  );
}

function normalizeItem(item) {
  const mediaFromImages = normalizeMediaList(
    item.images || [],
    item.name || "Sản phẩm"
  );

  const media =
    mediaFromImages.length > 0
      ? mediaFromImages
      : item.imageUrl
        ? [
            {
              id: "item-image-url",
              url: item.imageUrl,
              type: inferMediaTypeFromUrl(item.imageUrl),
              name: item.name || "Sản phẩm",
              mimeType: "",
              size: 0,
              publicId: "",
              width: 0,
              height: 0,
            },
          ]
        : [];

  return {
    ...item,
    images: media,
    media,
    imageUrl: item.imageUrl || getPrimaryMediaUrl(media),
  };
}

function normalizePromotion(promotion) {
  const mediaFromList = normalizeMediaList(
    promotion.media || [],
    promotion.title || "Khuyến mãi"
  );

  const media =
    mediaFromList.length > 0
      ? mediaFromList
      : promotion.imageUrl
        ? [
            {
              id: "promotion-image-url",
              url: promotion.imageUrl,
              type: inferMediaTypeFromUrl(promotion.imageUrl),
              name: promotion.title || "Khuyến mãi",
              mimeType: "",
              size: 0,
              publicId: "",
              width: 0,
              height: 0,
            },
          ]
        : [];

  return {
    ...promotion,
    media,
    imageUrl: promotion.imageUrl || getPrimaryMediaUrl(media),
  };
}

function normalizePost(post) {
  const media = normalizeMediaList(post.media || [], post.title || "Bài viết");

  return {
    ...post,
    media,
    coverUrl: post.coverUrl || getPrimaryMediaUrl(media),
  };
}

function normalizeMenuData({
  shopData,
  categoryData = [],
  itemData = [],
  promotionData = [],
  postData = [],
}) {
  return {
    shop: shopData,

    categories: categoryData.filter((category) => category.isActive !== false),

    items: itemData
      .filter((item) => item.isAvailable !== false)
      .map((item) => normalizeItem(item)),

    promotions: promotionData
      .filter((promotion) => promotion.isActive !== false)
      .map((promotion) => normalizePromotion(promotion)),

    posts: postData
      .filter((post) => post.isPublished !== false && post.isActive !== false)
      .map((post) => normalizePost(post)),
  };
}

function getSettledValue(result, fallbackValue, label) {
  if (result.status === "fulfilled") return result.value;

  console.error(`[useShopMenu] Không thể tải ${label}:`, result.reason);

  return fallbackValue;
}

export function useShopMenu(shopSlug) {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const applyMenuData = useCallback((menuData) => {
    setShop(menuData.shop || null);
    setCategories(Array.isArray(menuData.categories) ? menuData.categories : []);
    setItems(Array.isArray(menuData.items) ? menuData.items : []);
    setPromotions(
      Array.isArray(menuData.promotions) ? menuData.promotions : []
    );
    setPosts(Array.isArray(menuData.posts) ? menuData.posts : []);
  }, []);

  const resetMenuData = useCallback(() => {
    setShop(null);
    setCategories([]);
    setItems([]);
    setPromotions([]);
    setPosts([]);
  }, []);

  const loadMenu = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!shopSlug) {
      resetMenuData();
      setError("");
      setLoading(false);
      return;
    }

    const cachedMenu = readMenuCache(shopSlug);

    try {
      setError("");

      if (cachedMenu) {
        applyMenuData(cachedMenu);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const shopData = await withRetry(() => getShopBySlug(shopSlug), {
        label: "shop",
        retries: 3,
        delayMs: 650,
      });

      if (requestIdRef.current !== requestId) return;

      if (!shopData) {
        resetMenuData();
        setError("Menu chưa được public hoặc đường dẫn không đúng.");
        return;
      }

      const [categoryResult, itemResult, promotionResult, postResult] =
        await Promise.allSettled([
          withRetry(() => getCategories(shopData.id), {
            label: "categories",
            retries: 2,
            delayMs: 500,
          }),

          withRetry(() => getItems(shopData.id), {
            label: "items",
            retries: 2,
            delayMs: 500,
          }),

          getActivePromotions(shopData.id),

          getPublishedPosts(shopData.id),
        ]);

      if (requestIdRef.current !== requestId) return;

      const categoryData = getSettledValue(
        categoryResult,
        [],
        "danh mục"
      );

      const itemData = getSettledValue(
        itemResult,
        [],
        "sản phẩm"
      );

      const promotionData = getSettledValue(
        promotionResult,
        [],
        "khuyến mãi"
      );

      const postData = getSettledValue(
        postResult,
        [],
        "bài viết"
      );

      const normalizedMenu = normalizeMenuData({
        shopData,
        categoryData,
        itemData,
        promotionData,
        postData,
      });

      applyMenuData(normalizedMenu);
      writeMenuCache(shopSlug, normalizedMenu);

      console.log("[useShopMenu] SHOP CLIENT ĐANG ĐỌC:", shopData.id);
      console.log("[useShopMenu] ITEMS CLIENT NHẬN:", itemData);
      console.log("[useShopMenu] PROMOTIONS CLIENT NHẬN:", promotionData);
      console.log("[useShopMenu] POSTS CLIENT NHẬN:", postData);
      console.log("[useShopMenu] IN APP BROWSER:", isInAppBrowser());
    } catch (err) {
      const errorInfo = getErrorInfo(err);

      console.error("[useShopMenu] Không thể tải menu:", errorInfo, err);

      if (typeof window !== "undefined") {
        window.__HOME_COFFEE_MENU_ERROR__ = errorInfo;
      }

      const cachedMenuAfterError = readMenuCache(shopSlug);

      if (cachedMenuAfterError) {
        applyMenuData(cachedMenuAfterError);
        setError("");
        return;
      }

      resetMenuData();
      setError(buildUserError(err));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [shopSlug, applyMenuData, resetMenuData]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  return {
    shop,
    categories,
    items,
    promotions,
    posts,
    loading,
    error,
    refresh: loadMenu,
  };
}