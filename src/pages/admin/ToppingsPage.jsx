import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  DEFAULT_SHOP_ID,
  getShopById,
  saveShopSettings,
} from "../../services/shopService";

import { useAuth } from "../../hooks/useAuth";

const sampleToppingsText = [
  "Trân châu trắng:8000",
  "Kem cheese:10000",
  "Shot espresso:12000",
  "Thạch cà phê:7000",
  "Sương sáo:7000",
  "Đào miếng:10000",
].join("\n");

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function createLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function cleanPrice(value = "") {
  return String(value || "").replace(/[^\d]/g, "");
}

function parseToppingsText(text = "") {
  return String(text || "")
    .split(/\r?\n/)
    .map((line, index) => {
      const rawLine = line.trim();

      if (!rawLine) return null;

      const [rawName, ...priceParts] = rawLine.split(":");
      const name = String(rawName || "").trim();
      const price = cleanPrice(priceParts.join(":"));

      if (!name) return null;

      return {
        localId: createLocalId(),
        id: `topping-${index + 1}-${slugify(name)}`,
        name,
        price,
      };
    })
    .filter(Boolean);
}

function mapStoredToppingsToRows(toppings = []) {
  if (!Array.isArray(toppings)) return [];

  return toppings
    .filter((topping) => topping?.name)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((topping) => ({
      localId: topping.id || createLocalId(),
      id: topping.id || "",
      name: String(topping.name || "").trim(),
      price: String(Number(topping.price || 0) || ""),
    }));
}

function normalizeToppingRows(rows = []) {
  return rows
    .map((row, index) => {
      const name = String(row?.name || "").trim();
      const price = Number(cleanPrice(row?.price) || 0);

      if (!name) return null;

      return {
        id: row.id || `topping-${index + 1}-${slugify(name)}`,
        name,
        price,
        order: index + 1,
      };
    })
    .filter(Boolean);
}

function hasDuplicateName(toppings = []) {
  const names = toppings.map((item) => slugify(item.name)).filter(Boolean);
  return new Set(names).size !== names.length;
}

export default function ToppingsPage() {
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [toppingRows, setToppingRows] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const toppings = useMemo(() => {
    return normalizeToppingRows(toppingRows);
  }, [toppingRows]);

  const totalPrice = useMemo(() => {
    return toppings.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [toppings]);

  async function loadShop() {
    try {
      setLoading(true);
      setError("");

      const data = await getShopById(DEFAULT_SHOP_ID);

      setShop(data);
      setToppingRows(mapStoredToppingsToRows(data?.toppings || []));
      setBulkText("");
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách topping.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, []);

  function clearNotice() {
    setMessage("");
    setError("");
  }

  function handleAddTopping() {
    clearNotice();

    const name = newName.trim();
    const price = cleanPrice(newPrice);

    if (!name) {
      setError("Vui lòng nhập tên topping.");
      return;
    }

    const nextRows = [
      ...toppingRows,
      {
        localId: createLocalId(),
        id: "",
        name,
        price,
      },
    ];

    const nextToppings = normalizeToppingRows(nextRows);

    if (hasDuplicateName(nextToppings)) {
      setError("Topping này đã tồn tại trong danh sách.");
      return;
    }

    setToppingRows(nextRows);
    setNewName("");
    setNewPrice("");
  }

  function handleAddByEnter(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleAddTopping();
  }

  function updateRow(localId, field, value) {
    setToppingRows((prev) =>
      prev.map((row) =>
        row.localId === localId
          ? {
              ...row,
              [field]: field === "price" ? cleanPrice(value) : value,
            }
          : row
      )
    );
  }

  function removeRow(localId) {
    setToppingRows((prev) => prev.filter((row) => row.localId !== localId));
  }

  function moveRow(localId, direction) {
    setToppingRows((prev) => {
      const currentIndex = prev.findIndex((row) => row.localId === localId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const cloned = [...prev];
      const current = cloned[currentIndex];

      cloned[currentIndex] = cloned[nextIndex];
      cloned[nextIndex] = current;

      return cloned;
    });
  }

  function addSample() {
    clearNotice();
    setToppingRows(parseToppingsText(sampleToppingsText));
    setBulkText(sampleToppingsText);
  }

  function applyBulkText() {
    clearNotice();

    const parsedRows = parseToppingsText(bulkText);

    if (parsedRows.length === 0) {
      setError("Vui lòng nhập ít nhất một topping trong phần nhập nhanh.");
      return;
    }

    const parsedToppings = normalizeToppingRows(parsedRows);

    if (hasDuplicateName(parsedToppings)) {
      setError("Danh sách nhập nhanh đang có topping bị trùng tên.");
      return;
    }

    setToppingRows(parsedRows);
    setBulkOpen(false);
    setMessage("Đã áp dụng danh sách nhập nhanh. Bấm Lưu để lưu vào hệ thống.");
  }

  function clearAll() {
    const ok = window.confirm("Bạn muốn xóa toàn bộ danh sách topping?");

    if (!ok) return;

    setToppingRows([]);
    setBulkText("");
    clearNotice();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const hasInvalidRow = toppingRows.some((row) => {
        const hasName = String(row.name || "").trim();
        const hasPrice = cleanPrice(row.price);

        return !hasName && hasPrice;
      });

      if (hasInvalidRow) {
        setError("Có topping thiếu tên. Vui lòng kiểm tra lại danh sách.");
        return;
      }

      if (hasDuplicateName(toppings)) {
        setError("Danh sách đang có topping bị trùng tên.");
        return;
      }

      await saveShopSettings(DEFAULT_SHOP_ID, {
        ...(shop || {}),
        toppings,
        ownerUid: shop?.ownerUid || user?.uid,
      });

      setMessage("Đã lưu danh sách topping.");
      await loadShop();
    } catch (err) {
      console.error(err);
      setError(
        "Không thể lưu topping. Hãy kiểm tra quyền admin hoặc Firestore rules."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4">
        <div className="flex items-center gap-3 text-sm font-black text-[#294f31]">
          <Loader2 size={20} className="animate-spin" />
          Đang tải topping...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-[18px] border border-[#d9dda9] bg-white shadow-sm">
        <div className="bg-[#294f31] p-5 text-white sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#e7eac3]">
            <Sparkles size={14} />
            Add-on menu
          </p>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Danh sách topping
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                Quản lý topping chung của quán để khách xem tên và giá. Giao
                diện này tối ưu cho cả điện thoại, tablet và desktop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={addSample}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white/10 px-4 text-xs font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <Plus size={15} />
                Dữ liệu mẫu
              </button>

              <button
                type="button"
                onClick={loadShop}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-4 text-xs font-black text-[#294f31] transition hover:bg-[#e7eac3]"
              >
                <RefreshCw size={15} />
                Tải lại
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-5"
        >
          <section className="space-y-4">
            <div className="rounded-[16px] border border-[#d9dda9] bg-[#f7f8ec] p-4">
              <div>
                <h2 className="text-lg font-black text-[#294f31]">
                  Thêm topping nhanh
                </h2>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#647343]">
                  Nhập tên topping và giá, sau đó bấm thêm. Giá có thể để trống
                  nếu topping miễn phí.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_auto]">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                    Tên topping
                  </span>

                  <input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    onKeyDown={handleAddByEnter}
                    placeholder="Ví dụ: Kem cheese"
                    className="mt-2 h-12 w-full rounded-[12px] border border-[#d9dda9] bg-white px-4 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                    Giá
                  </span>

                  <input
                    value={newPrice}
                    onChange={(event) => setNewPrice(cleanPrice(event.target.value))}
                    onKeyDown={handleAddByEnter}
                    inputMode="numeric"
                    placeholder="10000"
                    className="mt-2 h-12 w-full rounded-[12px] border border-[#d9dda9] bg-white px-4 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddTopping}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-5 text-sm font-black text-white transition hover:bg-[#1f3d26] md:self-end"
                >
                  <Plus size={18} />
                  Thêm topping
                </button>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#d9dda9] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#294f31]">
                    Topping đang hiển thị
                  </h2>

                  <p className="mt-1 text-sm font-semibold leading-6 text-[#647343]">
                    Có {toppings.length} topping trong danh sách. Bạn có thể sửa
                    trực tiếp tên hoặc giá.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={toppingRows.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Xóa tất cả
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {toppingRows.length === 0 && (
                  <div className="rounded-[14px] border border-dashed border-[#d9dda9] bg-[#f7f8ec] p-8 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#294f31] ring-1 ring-[#d9dda9]">
                      <Sparkles size={22} />
                    </div>

                    <p className="mt-3 text-sm font-black text-[#294f31]">
                      Chưa có topping nào.
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#647343]">
                      Hãy thêm topping bằng form phía trên hoặc dùng dữ liệu mẫu.
                    </p>
                  </div>
                )}

                {toppingRows.map((row, index) => (
                  <div
                    key={row.localId}
                    className="rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec] p-3"
                  >
                    <div className="grid gap-3 md:grid-cols-[44px_minmax(0,1fr)_150px_132px] md:items-end">
                      <div className="hidden h-12 w-11 place-items-center rounded-[12px] bg-white text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] md:grid">
                        {index + 1}
                      </div>

                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                          Tên topping
                        </span>

                        <input
                          value={row.name}
                          onChange={(event) =>
                            updateRow(row.localId, "name", event.target.value)
                          }
                          placeholder="Tên topping"
                          className="mt-2 h-11 w-full rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                          Giá
                        </span>

                        <input
                          value={row.price}
                          onChange={(event) =>
                            updateRow(row.localId, "price", event.target.value)
                          }
                          inputMode="numeric"
                          placeholder="0"
                          className="mt-2 h-11 w-full rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                        />
                      </label>

                      <div className="grid grid-cols-[1fr_1fr_44px] gap-2 md:grid-cols-[38px_38px_44px]">
                        <button
                          type="button"
                          onClick={() => moveRow(row.localId, -1)}
                          disabled={index === 0}
                          className="h-11 rounded-[10px] bg-white text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3] disabled:opacity-40"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => moveRow(row.localId, 1)}
                          disabled={index === toppingRows.length - 1}
                          className="h-11 rounded-[10px] bg-white text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3] disabled:opacity-40"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() => removeRow(row.localId)}
                          className="grid h-11 place-items-center rounded-[10px] bg-red-50 text-red-600 transition hover:bg-red-100"
                          aria-label="Xóa topping"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#d9dda9] md:hidden">
                      <span className="text-xs font-black text-[#647343]">
                        #{index + 1}
                      </span>

                      <span className="rounded-full bg-[#294f31] px-3 py-1 text-xs font-black text-white">
                        {Number(cleanPrice(row.price) || 0) > 0
                          ? `+${formatPrice(row.price)}`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#d9dda9] bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setBulkOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <h2 className="text-lg font-black text-[#294f31]">
                    Nhập nhanh nhiều topping
                  </h2>

                  <p className="mt-1 text-sm font-semibold leading-6 text-[#647343]">
                    Dành cho trường hợp bạn muốn copy/paste danh sách nhiều dòng.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#f7f8ec] px-3 py-1 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9]">
                  {bulkOpen ? "Ẩn" : "Mở"}
                </span>
              </button>

              {bulkOpen && (
                <div className="mt-4">
                  <textarea
                    value={bulkText}
                    onChange={(event) => setBulkText(event.target.value)}
                    rows={7}
                    placeholder={
                      "Trân châu trắng:8000\nKem cheese:10000\nShot espresso:12000"
                    }
                    className="min-h-[170px] w-full resize-none rounded-[12px] border border-[#d9dda9] bg-[#f7f8ec] px-4 py-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/70 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                  />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setBulkText(sampleToppingsText)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white px-4 text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
                    >
                      <Plus size={16} />
                      Điền mẫu
                    </button>

                    <button
                      type="button"
                      onClick={applyBulkText}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#294f31] px-4 text-sm font-black text-white transition hover:bg-[#1f3d26]"
                    >
                      Áp dụng danh sách này
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {message && (
              <div className="flex items-start gap-3 rounded-[14px] border border-green-100 bg-green-50 p-4 text-sm font-bold text-green-700">
                <CheckCircle2 size={20} className="shrink-0" />
                <p className="leading-6">{message}</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-[14px] border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                <AlertCircle size={20} className="shrink-0" />
                <p className="leading-6">{error}</p>
              </div>
            )}

            <section className="rounded-[16px] border border-[#d9dda9] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#294f31]">
                    Tổng quan
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#647343]">
                    Preview trước khi lưu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadShop}
                  className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
                  title="Tải lại"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-[#f7f8ec] p-3 ring-1 ring-[#d9dda9]">
                  <p className="text-2xl font-black text-[#294f31]">
                    {toppings.length}
                  </p>

                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                    Topping
                  </p>
                </div>

                <div className="rounded-[14px] bg-[#f7f8ec] p-3 ring-1 ring-[#d9dda9]">
                  <p className="text-2xl font-black text-[#294f31]">
                    {formatPrice(totalPrice)}
                  </p>

                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                    Tổng giá
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {toppings.length === 0 && (
                  <div className="rounded-[12px] border border-dashed border-[#d9dda9] bg-[#f7f8ec] p-5 text-center text-sm font-semibold text-[#647343]">
                    Chưa có topping nào.
                  </div>
                )}

                {toppings.slice(0, 8).map((topping) => (
                  <div
                    key={topping.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-[#d9dda9] bg-[#f7f8ec] px-3 py-3"
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

                {toppings.length > 8 && (
                  <div className="rounded-[12px] bg-[#f7f8ec] p-3 text-center text-xs font-black text-[#647343] ring-1 ring-[#d9dda9]">
                    +{toppings.length - 8} topping khác
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-5 py-4 text-sm font-black text-white transition hover:bg-[#1f3d26] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {saving ? "Đang lưu..." : "Lưu danh sách topping"}
              </button>
            </section>
          </aside>
        </form>
      </section>
    </div>
  );
}