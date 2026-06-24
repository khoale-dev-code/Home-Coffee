import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Film,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash,
  Upload,
  X,
} from "lucide-react";

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanMoney(value = "") {
  return String(value || "").replace(/[^\d]/g, "");
}

function formatVnd(value) {
  const cleanValue = cleanMoney(value);

  if (!cleanValue) return "";

  return Number(cleanValue).toLocaleString("vi-VN") + "đ";
}

function createEmptySizeRow(name = "", price = "") {
  return {
    id: createLocalId(),
    name,
    price: cleanMoney(price),
    oldPrice: "",
    description: "",
  };
}

function inferMediaType(url = "") {
  const cleanUrl = url.toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v")
  ) {
    return "video";
  }

  return "image";
}

function getFileType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function getFileKindLabel(file) {
  if (file?.type === "image/gif") return "GIF";
  if (file?.type?.startsWith("video/")) return "Video";
  return "Ảnh";
}

function normalizeMediaList(itemForm) {
  const list = Array.isArray(itemForm.images) ? itemForm.images : [];

  const normalized = list
    .map((media, index) => {
      if (typeof media === "string") {
        return {
          id: `url-${index}`,
          url: media,
          type: inferMediaType(media),
          name: `Media ${index + 1}`,
        };
      }

      return {
        id: media.id || media.localId || `url-${index}`,
        url: media.url || "",
        type: media.type || inferMediaType(media.url || ""),
        name: media.name || `Media ${index + 1}`,
      };
    })
    .filter((media) => media.url);

  if (
    itemForm.imageUrl &&
    !normalized.some((media) => media.url === itemForm.imageUrl)
  ) {
    normalized.unshift({
      id: "primary-image-url",
      url: itemForm.imageUrl,
      type: inferMediaType(itemForm.imageUrl),
      name: "Ảnh chính",
    });
  }

  return normalized;
}

function getSelectedFiles(imageFile) {
  if (Array.isArray(imageFile)) return imageFile.filter(Boolean);
  if (imageFile) return [imageFile];
  return [];
}

export default function ItemFormPanel({
  categories,
  itemForm,
  updateItemForm,
  editingItemId,
  imageFile,
  setImageFile,
  imagePreviewUrl,
  itemSubmitting,
  onSubmit,
  onReset,
  onAddSize,
  onUpdateSize,
  onRemoveSize,
  onCreateCategoryQuick,
}) {
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState("image");
  const [localPreviews, setLocalPreviews] = useState([]);

  const [quickCategoryName, setQuickCategoryName] = useState("");
  const [quickCategoryLoading, setQuickCategoryLoading] = useState(false);
  const [quickCategoryError, setQuickCategoryError] = useState("");

  const selectedFiles = useMemo(() => getSelectedFiles(imageFile), [imageFile]);
  const savedMedia = useMemo(() => normalizeMediaList(itemForm), [itemForm]);

  useEffect(() => {
    const previews = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      url: URL.createObjectURL(file),
      type: getFileType(file),
      name: file.name,
      file,
      source: "file",
      fileIndex: index,
    }));

    setLocalPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  const previewItems = [
    ...localPreviews,
    ...savedMedia.map((media) => ({
      ...media,
      source: "url",
    })),
  ];

  const primaryPreview =
    localPreviews[0] ||
    savedMedia[0] ||
    (imagePreviewUrl
      ? {
          id: "legacy-preview",
          url: imagePreviewUrl,
          type: inferMediaType(imagePreviewUrl),
          name: "Preview",
          source: "url",
        }
      : null);

  function setSelectedFiles(nextFiles) {
    if (!nextFiles || nextFiles.length === 0) {
      setImageFile(null);
      return;
    }

    setImageFile(nextFiles.length === 1 ? nextFiles[0] : nextFiles);
  }

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const currentFiles = getSelectedFiles(imageFile);
    setSelectedFiles([...currentFiles, ...files]);

    updateItemForm("imageUrl", "");

    event.target.value = "";
  }

  function removeSelectedFile(index) {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedFiles(nextFiles);
  }

  function addUrlMedia() {
    const url = urlInput.trim();

    if (!url) return;

    const currentMedia = normalizeMediaList(itemForm);

    const newMedia = {
      id: createLocalId(),
      url,
      type: urlType || inferMediaType(url),
      name: url.includes(".gif") ? "GIF media" : "Media URL",
    };

    const nextMedia = [...currentMedia, newMedia];

    updateItemForm("images", nextMedia);
    updateItemForm(
      "imageUrl",
      nextMedia.find((media) => media.type === "image")?.url ||
        nextMedia[0]?.url ||
        ""
    );

    setUrlInput("");
    setUrlType("image");
  }

  function removeSavedMedia(mediaUrl) {
    const nextMedia = normalizeMediaList(itemForm).filter(
      (media) => media.url !== mediaUrl
    );

    updateItemForm("images", nextMedia);
    updateItemForm(
      "imageUrl",
      nextMedia.find((media) => media.type === "image")?.url ||
        nextMedia[0]?.url ||
        ""
    );
  }

  function clearAllMedia() {
    setImageFile(null);
    updateItemForm("imageUrl", "");
    updateItemForm("images", []);
  }

  async function handleCreateQuickCategory() {
    const cleanName = quickCategoryName.trim();

    if (!cleanName) {
      setQuickCategoryError("Nhập tên danh mục trước khi tạo.");
      return;
    }

    if (!onCreateCategoryQuick) {
      setQuickCategoryError(
        "Chưa kết nối hàm tạo danh mục nhanh từ MenuItemsPage."
      );
      return;
    }

    try {
      setQuickCategoryLoading(true);
      setQuickCategoryError("");

      const categoryId = await onCreateCategoryQuick(cleanName);

      if (categoryId) {
        updateItemForm("categoryId", categoryId);
        setQuickCategoryName("");
      }
    } catch (err) {
      console.error(err);
      setQuickCategoryError("Không thể tạo danh mục nhanh.");
    } finally {
      setQuickCategoryLoading(false);
    }
  }

  function handleQuickCategoryEnter(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleCreateQuickCategory();
  }

  function addPresetSizes(presetSizes = []) {
    const currentSizes = Array.isArray(itemForm.sizes) ? itemForm.sizes : [];

    const nextSizes = [
      ...currentSizes,
      ...presetSizes.map((size) => createEmptySizeRow(size.name, size.price)),
    ];

    updateItemForm("sizes", nextSizes);
  }

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="border-b border-[#d9dda9] bg-[#f7f8ec] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#647343]">
              Menu item
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#294f31]">
              {editingItemId ? "Sửa món" : "Thêm món mới"}
            </h2>

            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#647343]">
              Nhập thông tin món, thêm nhanh danh mục, nhập giá VNĐ và quản lý
              size thuận tiện hơn.
            </p>
          </div>

          {editingItemId && (
            <button
              type="button"
              onClick={onReset}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white text-[#294f31] shadow-sm ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
              aria-label="Hủy sửa món"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-3 sm:p-5">
        <FormSection title="Thông tin cơ bản" icon={BadgeCheck}>
          <FormInput
            label="Tên món"
            value={itemForm.name}
            onChange={(value) => updateItemForm("name", value)}
            placeholder="Bạc xỉu đá"
            required
          />

          <div className="rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec] p-3">
            <label className="text-sm font-black text-[#294f31]">
              Danh mục sản phẩm
            </label>

            <select
              value={itemForm.categoryId}
              onChange={(event) =>
                updateItemForm("categoryId", event.target.value)
              }
              className="mt-2 h-12 w-full rounded-[10px] border border-[#d9dda9] bg-white px-4 text-sm font-bold text-[#294f31] outline-none transition focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
              required
            >
              <option value="">Chọn danh mục</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="mt-3 rounded-[12px] bg-white p-3 ring-1 ring-[#d9dda9]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                Chưa có danh mục?
              </p>

              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={quickCategoryName}
                  onChange={(event) => setQuickCategoryName(event.target.value)}
                  onKeyDown={handleQuickCategoryEnter}
                  placeholder="Ví dụ: Trà sữa, Cà phê, Đá xay..."
                  className="h-11 rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                />

                <button
                  type="button"
                  onClick={handleCreateQuickCategory}
                  disabled={quickCategoryLoading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#294f31] px-4 text-sm font-black text-white transition hover:bg-[#1f3d26] disabled:opacity-60"
                >
                  {quickCategoryLoading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <Plus size={16} className="text-white" />
                  )}

                  <span className="text-white">Tạo & chọn</span>
                </button>
              </div>

              {quickCategoryError && (
                <p className="mt-2 text-xs font-bold text-red-600">
                  {quickCategoryError}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <MoneyInput
              label="Giá mặc định"
              value={itemForm.price}
              onChange={(value) => updateItemForm("price", value)}
              placeholder="29.000đ"
              hint="Dùng khi món không có size."
            />

            <MoneyInput
              label="Giá cũ"
              value={itemForm.oldPrice}
              onChange={(value) => updateItemForm("oldPrice", value)}
              placeholder="35.000đ"
              hint="Không bắt buộc, dùng để hiện giá gạch ngang."
            />
          </div>
        </FormSection>

        <SizeEditor
          sizes={itemForm.sizes || []}
          onAddSize={onAddSize}
          onUpdateSize={onUpdateSize}
          onRemoveSize={onRemoveSize}
          onAddPresetSizes={addPresetSizes}
        />

        <FormSection title="Mô tả và media sản phẩm" icon={ImagePlus}>
          <div>
            <label className="text-sm font-black text-[#294f31]">Mô tả</label>

            <textarea
              value={itemForm.description}
              onChange={(event) =>
                updateItemForm("description", event.target.value)
              }
              rows={4}
              placeholder="Mô tả ngắn về món..."
              className="mt-2 w-full resize-none rounded-[10px] border border-[#d9dda9] bg-white px-4 py-3 text-sm font-medium text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
            />
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec]">
            <div className="flex flex-col gap-3 border-b border-[#d9dda9] bg-white p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4">
              <div>
                <p className="text-sm font-black text-[#294f31]">
                  Hình ảnh / video / GIF
                </p>

                <p className="mt-1 max-w-xl text-xs font-semibold leading-5 text-[#647343]">
                  Thêm nhiều ảnh, GIF hoặc video. File từ máy sẽ được upload
                  lên Cloudinary khi bấm lưu món.
                </p>
              </div>

              {previewItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllMedia}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.06em] text-red-600 transition hover:bg-red-100"
                >
                  <Trash size={14} />
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="space-y-4 p-3 sm:p-4">
              <div className="overflow-hidden rounded-[12px] border border-[#d9dda9] bg-white">
                <div className="grid aspect-[16/10] min-h-[190px] place-items-center bg-white sm:aspect-[16/8]">
                  {primaryPreview ? (
                    <MediaPreview media={primaryPreview} large />
                  ) : (
                    <div className="text-center text-[#647343]/60">
                      <ImagePlus size={42} className="mx-auto" />
                      <p className="mt-2 text-xs font-bold">Chưa có media</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <div className="rounded-[12px] border border-[#d9dda9] bg-white p-3">
                  <p className="text-sm font-black text-[#294f31]">
                    Link media chính
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
                    Dán link ảnh, GIF hoặc video nếu đã có URL sẵn.
                  </p>

                  <input
                    value={itemForm.imageUrl || ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      setImageFile(null);
                      updateItemForm("imageUrl", value);
                      updateItemForm(
                        "images",
                        value
                          ? [
                              {
                                id: "primary-url",
                                url: value,
                                type: inferMediaType(value),
                                name: "Media chính",
                              },
                            ]
                          : []
                      );
                    }}
                    placeholder="Dán link ảnh / GIF / video..."
                    className="mt-3 h-12 w-full rounded-[10px] border border-[#d9dda9] bg-white px-4 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
                  />
                </div>

                <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#d9dda9] bg-white p-4 text-center transition hover:border-[#294f31] hover:bg-[#f7f8ec]">
                  <Upload className="text-[#647343]" size={32} />

                  <p className="mt-3 text-sm font-black text-[#294f31]">
                    Chọn nhiều file từ máy
                  </p>

                  <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-[#647343]">
                    Hỗ trợ JPG, PNG, WEBP, GIF, MP4, WEBM, MOV. Có thể chọn
                    nhiều file cùng lúc.
                  </p>

                  <span className="mt-3 inline-flex items-center justify-center rounded-[8px] bg-[#294f31] px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white">
                    Chọn file
                  </span>

                  <input
                    type="file"
                    accept="image/*,video/*,.gif"
                    multiple
                    onChange={handlePickFiles}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-[12px] border border-[#d9dda9] bg-white p-3">
                <div className="flex items-center gap-2">
                  <Link2 size={17} className="text-[#647343]" />
                  <p className="text-sm font-black text-[#294f31]">
                    Thêm media bằng URL
                  </p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px]">
                  <input
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="Dán link ảnh, GIF hoặc video..."
                    className="h-11 rounded-[8px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none placeholder:text-[#7a874b]/60 focus:border-[#294f31]"
                  />

                  <select
                    value={urlType}
                    onChange={(event) => setUrlType(event.target.value)}
                    className="h-11 rounded-[8px] border border-[#d9dda9] bg-white px-3 text-sm font-black text-[#294f31] outline-none focus:border-[#294f31]"
                  >
                    <option value="image">Ảnh / GIF</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addUrlMedia}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#294f31] px-4 py-3 text-sm font-black text-white transition hover:bg-[#1f3d26]"
                >
                  <Plus size={16} />
                  Thêm URL
                </button>
              </div>
            </div>

            {previewItems.length > 0 && (
              <div className="border-t border-[#d9dda9] bg-white p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#294f31]">
                    Media đã thêm
                  </p>

                  <p className="text-xs font-bold text-[#647343]">
                    {previewItems.length} mục
                  </p>
                </div>

                <div className="grid gap-3 min-[430px]:grid-cols-2">
                  {previewItems.map((media, index) => (
                    <MediaCard
                      key={`${media.source}-${media.url}-${index}`}
                      media={media}
                      index={index}
                      onRemove={() => {
                        if (media.source === "file") {
                          removeSelectedFile(media.fileIndex);
                        } else {
                          removeSavedMedia(media.url);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="border-t border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-700 sm:px-4">
                Đã chọn {selectedFiles.length} file mới. Khi bấm lưu, các file
                này sẽ được upload lên Cloudinary và lưu vào món.
              </div>
            )}
          </div>

          <FormInput
            label="Tags"
            value={itemForm.tagsText}
            onChange={(value) => updateItemForm("tagsText", value)}
            placeholder="best seller, đá xay, topping"
          />
        </FormSection>

        <FormSection title="Trạng thái hiển thị" icon={Sparkles}>
          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <ToggleCard
              label="Món còn bán"
              description="Khách vẫn nhìn thấy món này trên menu."
              checked={itemForm.isAvailable}
              onChange={(checked) => updateItemForm("isAvailable", checked)}
            />

            <ToggleCard
              label="Món nổi bật"
              description="Hiển thị trong khu vực sản phẩm nổi bật."
              checked={itemForm.isFeatured}
              onChange={(checked) => updateItemForm("isFeatured", checked)}
            />
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-10 rounded-[12px] bg-white/95 pt-2 backdrop-blur sm:static sm:bg-transparent sm:pt-0">
          <button
            type="submit"
            disabled={itemSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#294f31] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_26px_rgba(41,79,49,0.22)] transition hover:bg-[#1f3d26] disabled:opacity-60 sm:py-3 sm:shadow-none"
          >
            {itemSubmitting ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Save size={18} className="text-white" />
            )}

            <span className="text-white">
              {itemSubmitting
                ? selectedFiles.length > 0
                  ? "Đang upload Cloudinary..."
                  : "Đang lưu..."
                : editingItemId
                  ? "Cập nhật món"
                  : "Thêm món vào menu"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

function MediaPreview({ media, large = false }) {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        controls={large}
        muted={!large}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain p-2"
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={media.name || "Media"}
      className="h-full w-full object-contain p-2"
    />
  );
}

function MediaCard({ media, index, onRemove }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="relative grid aspect-square place-items-center bg-[#f7f8ec]">
        <MediaPreview media={media} />

        <span className="absolute left-2 top-2 rounded-[6px] bg-black/70 px-2 py-1 text-[10px] font-black uppercase text-white">
          #{index + 1}
        </span>

        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-[6px] bg-white/95 px-2 py-1 text-[10px] font-black uppercase text-[#294f31] shadow">
          {media.type === "video" ? <Film size={12} /> : <ImagePlus size={12} />}
          {media.type === "video" ? "Video" : "Ảnh/GIF"}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[8px] bg-white text-red-600 shadow transition hover:bg-red-50"
          aria-label="Xóa media"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-black text-[#294f31]">
          {media.name || "Media"}
        </p>

        <p className="mt-1 text-xs font-bold text-[#647343]">
          {media.source === "file"
            ? `${getFileKindLabel(media.file)} · Chờ upload`
            : "URL / đã lưu"}
        </p>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[14px] border border-[#d9dda9] bg-white p-3 sm:p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-[#d9dda9] pb-3">
        {Icon && <Icon size={18} className="text-[#294f31]" />}
        <p className="text-sm font-black text-[#294f31]">{title}</p>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SizeEditor({
  sizes,
  onAddSize,
  onUpdateSize,
  onRemoveSize,
  onAddPresetSizes,
}) {
  const presets = [
    {
      label: "S / M / L",
      sizes: [
        { name: "S", price: "" },
        { name: "M", price: "" },
        { name: "L", price: "" },
      ],
    },
    {
      label: "M / L",
      sizes: [
        { name: "M", price: "" },
        { name: "L", price: "" },
      ],
    },
    {
      label: "500ml / 700ml",
      sizes: [
        { name: "500ml", price: "" },
        { name: "700ml", price: "" },
      ],
    },
  ];

  return (
    <div className="rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec] p-3 sm:p-4">
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
        <div>
          <p className="text-sm font-black text-[#294f31]">
            Size và giá từng size
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
            Không bắt buộc. Nếu món có nhiều size, thêm từng size và nhập giá
            riêng. Giá sẽ tự hiển thị dạng VNĐ.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSize}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#294f31] px-3 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#1f3d26] min-[430px]:w-auto"
        >
          <Plus size={14} className="text-white" />
          <span className="text-white">Thêm size</span>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onAddPresetSizes(preset.sizes)}
            className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {sizes.length === 0 ? (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#d9dda9] bg-white p-4 text-sm font-semibold leading-6 text-[#647343]">
          Chưa thêm size. Món sẽ dùng giá mặc định bên trên. Bạn có thể bấm
          nhanh mẫu size hoặc thêm từng size thủ công.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sizes.map((size, index) => (
            <div
              key={size.id}
              className="rounded-[14px] border border-[#d9dda9] bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#d9dda9] pb-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
                  Size {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => onRemoveSize(size.id)}
                  className="grid h-9 w-9 place-items-center rounded-[10px] bg-red-50 text-red-600 transition hover:bg-red-100"
                  aria-label="Xóa size"
                >
                  <Trash size={14} />
                </button>
              </div>

              <div className="grid gap-3 min-[430px]:grid-cols-2">
                <Field
                  label="Tên size"
                  value={size.name}
                  onChange={(value) => onUpdateSize(size.id, "name", value)}
                  placeholder="M, L, XL, 500ml..."
                />

                <MoneyInput
                  label="Giá size"
                  value={size.price}
                  onChange={(value) => onUpdateSize(size.id, "price", value)}
                  placeholder="29.000đ"
                />

                <MoneyInput
                  label="Giá cũ của size"
                  value={size.oldPrice}
                  onChange={(value) =>
                    onUpdateSize(size.id, "oldPrice", value)
                  }
                  placeholder="35.000đ"
                />

                <Field
                  label="Ghi chú size"
                  value={size.description}
                  onChange={(value) =>
                    onUpdateSize(size.id, "description", value)
                  }
                  placeholder="500ml, 700ml..."
                />
              </div>

              <div className="mt-3 rounded-[10px] bg-[#f7f8ec] px-3 py-2 text-xs font-bold text-[#647343]">
                Giá đang nhập:{" "}
                <span className="font-black text-[#294f31]">
                  {size.price ? formatVnd(size.price) : "Chưa có giá"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-[#d9dda9] bg-white p-3 transition hover:border-[#294f31]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#294f31]"
      />

      <span>
        <span className="block text-sm font-black text-[#294f31]">
          {label}
        </span>

        <span className="mt-1 block text-xs font-semibold leading-5 text-[#647343]">
          {description}
        </span>
      </span>
    </label>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-black text-[#647343]">{label}</label>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
      />
    </div>
  );
}

function MoneyInput({ label, value, onChange, placeholder, hint }) {
  return (
    <div>
      <label className="text-xs font-black text-[#647343]">{label}</label>

      <input
        type="text"
        inputMode="numeric"
        value={formatVnd(value)}
        onChange={(event) => onChange(cleanMoney(event.target.value))}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
      />

      {hint && (
        <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
          {hint}
        </p>
      )}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-black text-[#294f31]">{label}</label>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[10px] border border-[#d9dda9] bg-white px-4 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
      />
    </div>
  );
}