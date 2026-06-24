export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export function parseTags(tagsText = "") {
  return String(tagsText || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseToppings(toppingsText = "") {
  return String(toppingsText || "")
    .split(/\r?\n/)
    .map((line, index) => {
      const rawLine = line.trim();

      if (!rawLine) return null;

      const [rawName, ...priceParts] = rawLine.split(":");
      const name = String(rawName || "").trim();
      const priceText = priceParts.join(":").replace(/[^\d]/g, "");
      const price = Number(priceText || 0);

      if (!name) return null;

      return {
        id: `topping-${index + 1}-${name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "")}`,
        name,
        price,
        order: index + 1,
      };
    })
    .filter(Boolean);
}

export function formatToppingsText(toppings = []) {
  if (!Array.isArray(toppings)) return "";

  return toppings
    .map((topping) => {
      const name = String(topping?.name || "").trim();
      const price = Number(topping?.price || 0);

      if (!name) return "";

      return price > 0 ? `${name}:${price}` : name;
    })
    .filter(Boolean)
    .join("\n");
}

export function createEmptyItemForm() {
  return {
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    imageUrl: "",
    categoryId: "",
    isAvailable: true,
    isFeatured: false,
    tagsText: "",
    toppingsText: "",
    sizes: [],
  };
}

export function createLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptySize() {
  return {
    id: createLocalId(),
    name: "",
    price: "",
    oldPrice: "",
    description: "",
  };
}

export function mapSizeToForm(size = {}, index = 0) {
  return {
    id: size.id || createLocalId(),
    name: size.name || size.label || `Size ${index + 1}`,
    price: size.price ?? "",
    oldPrice: size.oldPrice ?? "",
    description: size.description || "",
  };
}

export function normalizeSizes(sizeRows = []) {
  return sizeRows
    .map((size, index) => {
      const rawName = String(size?.name || "").trim();
      const rawDescription = String(size?.description || "").trim();
      const price = Number(size?.price || 0);
      const oldPrice = Number(size?.oldPrice || 0);

      const hasAnyValue = rawName || rawDescription || price > 0 || oldPrice > 0;

      if (!hasAnyValue) return null;

      return {
        id: size.id || createLocalId(),
        name: rawName || `Size ${index + 1}`,
        price,
        oldPrice,
        description: rawDescription,
        order: index + 1,
      };
    })
    .filter(Boolean)
    .filter((size) => size.price > 0);
}

export function hasInvalidSize(sizeRows = []) {
  return sizeRows.some((size) => {
    const hasAnyValue =
      size.name?.trim() ||
      size.price ||
      size.oldPrice ||
      size.description?.trim();

    if (!hasAnyValue) return false;

    return !size.name?.trim() || Number(size.price || 0) <= 0;
  });
}

export function getMainPrice(itemForm, sizes) {
  if (sizes.length > 0) {
    return Math.min(...sizes.map((size) => Number(size.price || 0)));
  }

  return Number(itemForm.price || 0);
}

export function getMainOldPrice(itemForm, sizes) {
  if (sizes.length > 0) {
    const oldPrices = sizes
      .map((size) => Number(size.oldPrice || 0))
      .filter((price) => price > 0);

    return oldPrices.length > 0 ? Math.min(...oldPrices) : 0;
  }

  return Number(itemForm.oldPrice || 0);
}
