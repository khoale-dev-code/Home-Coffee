import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  ImagePlus,
  Link2,
  Loader2,
  Save,
  Store,
  Trash2,
  Upload,
} from "lucide-react";

import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import {
  DEFAULT_SHOP_ID,
  getShopById,
  saveShopSettings,
} from "../../services/shopService";

import { useAuth } from "../../hooks/useAuth";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=100089933292350";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  facebookUrl: FACEBOOK_URL,
  logoUrl: "",
  coverUrl: "",
  isPublished: false,
  theme: "light",

  // Các kênh này hiện quán không dùng, giữ rỗng để không hiển thị ngoài trang khách.
  address: "",
  phone: "",
  zaloUrl: "",
  googleMapUrl: "",
};

function createSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeFacebookUrl(value = "") {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return FACEBOOK_URL;

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

async function uploadShopImage(shopId, file, type = "image") {
  return uploadImageToCloudinary(
    file,
    `home-coffee/${shopId || "default-shop"}/settings/${type}`
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const publicUrl = form.slug ? `/${form.slug}` : "";
  const facebookUrl = normalizeFacebookUrl(form.facebookUrl);

  useEffect(() => {
    loadShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadShop() {
    try {
      setLoading(true);
      setError("");

      const data = await getShopById(DEFAULT_SHOP_ID);

      setShop(data);

      if (data) {
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          facebookUrl: data.facebookUrl || FACEBOOK_URL,
          logoUrl: data.logoUrl || "",
          coverUrl: data.coverUrl || "",
          isPublished: data.isPublished ?? false,
          theme: data.theme || "light",

          // Quán hiện chỉ dùng Facebook.
          address: "",
          phone: "",
          zaloUrl: "",
          googleMapUrl: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin quán.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNameChange(value) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug ? prev.slug : createSlug(value),
    }));
  }

  function handleSlugChange(value) {
    updateField("slug", createSlug(value));
  }

  async function handleUploadLogo(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingLogo(true);
      setMessage("");
      setError("");

      const url = await uploadShopImage(DEFAULT_SHOP_ID, file, "logo");

      updateField("logoUrl", url);
      setMessage("Đã upload logo. Bấm Lưu cài đặt để áp dụng.");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Không thể upload logo.");
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  }

  async function handleUploadCover(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingCover(true);
      setMessage("");
      setError("");

      const url = await uploadShopImage(DEFAULT_SHOP_ID, file, "cover");

      updateField("coverUrl", url);
      setMessage("Đã upload ảnh bìa. Bấm Lưu cài đặt để áp dụng.");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Không thể upload ảnh bìa.");
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanSlug = createSlug(form.slug);

    if (!cleanName) {
      setError("Vui lòng nhập tên quán.");
      return;
    }

    if (!cleanSlug) {
      setError("Vui lòng nhập slug đường dẫn.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await saveShopSettings(DEFAULT_SHOP_ID, {
        name: cleanName,
        slug: cleanSlug,
        description: form.description.trim(),
        facebookUrl,
        logoUrl: form.logoUrl.trim(),
        coverUrl: form.coverUrl.trim(),
        isPublished: Boolean(form.isPublished),
        theme: form.theme || "light",

        // Không dùng các thông tin này ở cửa hàng hiện tại.
        address: "",
        phone: "",
        zaloUrl: "",
        googleMapUrl: "",

        createdAt: shop?.createdAt,
        ownerUid: shop?.ownerUid || user?.uid,
      });

      setMessage("Đã lưu cài đặt quán.");
      await loadShop();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Không thể lưu cài đặt. Hãy kiểm tra quyền admin hoặc Firestore rules."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4">
        <div className="flex items-center gap-3 rounded-[16px] border border-[#d9dda9] bg-white px-5 py-4 text-sm font-black text-[#294f31] shadow-sm">
          <Loader2 size={20} className="animate-spin" />
          Đang tải cài đặt quán...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 sm:space-y-5">
      <SettingsHeader
        form={form}
        publicUrl={publicUrl}
        saving={saving}
        onSubmit={handleSubmit}
      />

      {(message || error) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {message && (
            <Notice type="success" icon={CheckCircle2}>
              {message}
            </Notice>
          )}

          {error && (
            <Notice type="error" icon={AlertCircle}>
              {error}
            </Notice>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"
      >
        <main className="space-y-4">
          <FormSection
            title="Thông tin thương hiệu"
            description="Những thông tin chính hiển thị ở trang khách."
            icon={Store}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Tên quán"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Home Coffee"
                required
              />

              <FormInput
                label="Slug đường dẫn"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="home-coffee"
                prefix="/"
                required
              />
            </div>

            <FormTextarea
              label="Mô tả ngắn"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Ví dụ: Home Coffee - không gian cà phê ấm cúng, menu đồ uống đa dạng."
              rows={5}
            />
          </FormSection>

          <FormSection
            title="Facebook cửa hàng"
            description="Quán hiện chỉ dùng Facebook làm kênh liên hệ và cập nhật thông tin."
            icon={Link2}
          >
            <FormInput
              label="Facebook URL"
              value={form.facebookUrl}
              onChange={(value) => updateField("facebookUrl", value)}
              placeholder={FACEBOOK_URL}
            />

            <div className="rounded-[16px] border border-[#d9dda9] bg-[#f7f8ec] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#294f31]">
                    Link Facebook đang dùng
                  </p>

                  <p className="mt-1 break-all text-xs font-semibold leading-5 text-[#647343]">
                    {facebookUrl}
                  </p>
                </div>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#1877F2] px-4 text-sm font-black text-white transition hover:brightness-95"
                >
                  <ExternalLink size={16} className="text-white" />
                  <span className="text-white">Mở Facebook</span>
                </a>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Hình ảnh thương hiệu"
            description="Logo và ảnh bìa giúp trang khách trông chuyên nghiệp hơn."
            icon={ImagePlus}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ImageField
                title="Logo"
                description="Nên dùng ảnh vuông, nền trong hoặc nền sáng."
                imageUrl={form.logoUrl}
                uploading={uploadingLogo}
                onUpload={handleUploadLogo}
                onClear={() => updateField("logoUrl", "")}
                inputId="shop-logo-upload"
                variant="logo"
              />

              <ImageField
                title="Ảnh bìa"
                description="Nên dùng ảnh ngang, rõ không gian hoặc sản phẩm chủ đạo."
                imageUrl={form.coverUrl}
                uploading={uploadingCover}
                onUpload={handleUploadCover}
                onClear={() => updateField("coverUrl", "")}
                inputId="shop-cover-upload"
                variant="cover"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Logo URL"
                value={form.logoUrl}
                onChange={(value) => updateField("logoUrl", value)}
                placeholder="/logohome.png hoặc link ảnh"
              />

              <FormInput
                label="Ảnh bìa URL"
                value={form.coverUrl}
                onChange={(value) => updateField("coverUrl", value)}
                placeholder="https://..."
              />
            </div>
          </FormSection>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <PublishCard
            form={form}
            publicUrl={publicUrl}
            saving={saving}
            onChangePublished={(checked) => updateField("isPublished", checked)}
          />

          <PreviewCard form={form} publicUrl={publicUrl} facebookUrl={facebookUrl} />
        </aside>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d9dda9] bg-white/94 p-3 shadow-[0_-10px_30px_rgba(41,79,49,0.08)] backdrop-blur-xl lg:hidden">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#294f31] px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#1f3d26] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Save size={18} className="text-white" />
            )}

            <span className="text-white">
              {saving ? "Đang lưu..." : "Lưu cài đặt"}
            </span>
          </button>
        </div>
      </form>

      <div className="h-16 lg:hidden" />
    </div>
  );
}

 function SettingsHeader({ form, publicUrl, saving, onSubmit }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="relative bg-[#294f31] px-4 py-5 text-white sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#e7eac3]" />
          <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white" />
        </div>

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#e7eac3]">
              <Store size={14} className="text-[#e7eac3]" />
              <span className="text-[#e7eac3]">Shop settings</span>
            </p>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Cài đặt quán
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
              Quản lý tên quán, đường dẫn, Facebook, logo, ảnh bìa và trạng thái
              hiển thị menu. Phần topping đã được tách khỏi trang này.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#d9dda9] bg-white px-4 text-sm font-black !text-[#294f31] shadow-sm transition hover:bg-[#f7f8ec] active:scale-[0.98] sm:w-auto"
              >
                <ExternalLink size={17} className="text-[#294f31]" />
                <span className="text-[#294f31]">Xem trang khách</span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="hidden min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#e7eac3] px-5 text-sm font-black !text-[#294f31] shadow-sm ring-1 ring-[#d9dda9] transition hover:bg-[#dfe3ae] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto lg:inline-flex"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin text-[#294f31]" />
              ) : (
                <Save size={17} className="text-[#294f31]" />
              )}

              <span className="text-[#294f31]">
                {saving ? "Đang lưu..." : "Lưu cài đặt"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 bg-[#f7f8ec] p-3 sm:grid-cols-3 sm:p-4">
        <MiniInfo label="Tên quán" value={form.name || "Chưa nhập"} />
        <MiniInfo label="Đường dẫn" value={publicUrl || "Chưa có slug"} />
        <MiniInfo
          label="Trạng thái"
          value={form.isPublished ? "Đang public" : "Đang ẩn"}
        />
      </div>
    </section>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-[#d9dda9] bg-white p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.13em] text-[#647343]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-[#294f31]">
        {value}
      </p>
    </div>
  );
}

function FormSection({ title, description, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="border-b border-[#d9dda9] bg-[#f7f8ec] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e7eac3] text-[#294f31]">
            <Icon size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-black text-[#294f31] sm:text-lg">
              {title}
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-[#647343] sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#294f31]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <div className="mt-2 flex overflow-hidden rounded-[12px] border border-[#d9dda9] bg-white transition focus-within:border-[#294f31] focus-within:ring-4 focus-within:ring-[#294f31]/10">
        {prefix && (
          <span className="grid shrink-0 place-items-center border-r border-[#d9dda9] bg-[#f7f8ec] px-3 text-sm font-black text-[#647343]">
            {prefix}
          </span>
        )}

        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 min-w-0 flex-1 bg-white px-4 text-sm font-bold text-[#294f31] outline-none placeholder:text-[#7a874b]/60"
        />
      </div>
    </label>
  );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#294f31]">{label}</span>

      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-none rounded-[12px] border border-[#d9dda9] bg-white px-4 py-3 text-sm font-bold leading-6 text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
      />
    </label>
  );
}

function ImageField({
  title,
  description,
  imageUrl,
  uploading,
  onUpload,
  onClear,
  inputId,
  variant = "cover",
}) {
  const previewClass =
    variant === "logo"
      ? "aspect-square max-h-[220px]"
      : "aspect-[16/10]";

  return (
    <div className="rounded-[16px] border border-[#d9dda9] bg-[#f7f8ec] p-3 sm:p-4">
      <div
        className={`${previewClass} overflow-hidden rounded-[14px] bg-white ring-1 ring-[#d9dda9]`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#294f31]/35">
            <ImagePlus size={42} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm font-black text-[#294f31]">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
          {description}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-3 text-xs font-black text-white transition hover:bg-[#1f3d26]"
        >
          {uploading ? (
            <Loader2 size={15} className="animate-spin text-white" />
          ) : (
            <Upload size={15} className="text-white" />
          )}

          <span className="text-white">
            {uploading ? "Đang tải..." : "Upload"}
          </span>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!imageUrl || uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-3 text-xs font-black text-red-600 ring-1 ring-[#d9dda9] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={15} />
          Xóa
        </button>
      </div>
    </div>
  );
}

function PublishCard({ form, publicUrl, saving, onChangePublished }) {
  return (
    <section className="rounded-[18px] border border-[#d9dda9] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#e7eac3] text-[#294f31]">
          {form.isPublished ? <Eye size={21} /> : <EyeOff size={21} />}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-[#294f31]">
            Trạng thái hiển thị
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
            Bật public khi muốn khách xem được menu theo đường dẫn của quán.
          </p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-[16px] bg-[#f7f8ec] p-4 ring-1 ring-[#d9dda9]">
        <div>
          <p className="text-sm font-black text-[#294f31]">Public menu</p>

          <p className="mt-1 text-xs font-semibold text-[#647343]">
            {form.isPublished ? "Khách đang xem được" : "Khách chưa xem được"}
          </p>
        </div>

        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(event) => onChangePublished(event.target.checked)}
          className="h-5 w-5 accent-[#294f31]"
        />
      </label>

      <div className="mt-4 rounded-[16px] bg-[#f7f8ec] p-4 ring-1 ring-[#d9dda9]">
        <div className="flex items-start gap-3">
          <Globe2 size={18} className="mt-0.5 shrink-0 text-[#294f31]" />

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
              Link khách hàng
            </p>

            <p className="mt-1 break-all text-sm font-black text-[#294f31]">
              {publicUrl || "Chưa có slug"}
            </p>
          </div>
        </div>

        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-white px-4 py-3 text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
          >
            <ExternalLink size={16} />
            Mở trang khách
          </a>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-4 hidden w-full items-center justify-center gap-2 rounded-[14px] bg-[#294f31] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#1f3d26] disabled:opacity-60 lg:inline-flex"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin text-white" />
        ) : (
          <Save size={18} className="text-white" />
        )}

        <span className="text-white">
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </span>
      </button>
    </section>
  );
}

function PreviewCard({ form, publicUrl, facebookUrl }) {
  return (
    <section className="rounded-[18px] border border-[#d9dda9] bg-[#f7f8ec] p-4 shadow-sm">
      <p className="text-sm font-black text-[#294f31]">Preview nhanh</p>

      <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
        Xem nhanh cách thông tin quán xuất hiện ở trang khách.
      </p>

      <div className="mt-4 overflow-hidden rounded-[18px] bg-white ring-1 ring-[#d9dda9]">
        <div className="relative h-32 bg-[#e7eac3]">
          {form.coverUrl ? (
            <img
              src={form.coverUrl}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-[#294f31]/35">
              <ImagePlus size={36} />
            </div>
          )}

          <div className="absolute -bottom-8 left-4 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-[#f7f8ec] text-[#294f31] shadow-sm">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo preview"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Store size={24} />
            )}
          </div>
        </div>

        <div className="px-4 pb-4 pt-10">
          <p className="line-clamp-1 text-lg font-black text-[#294f31]">
            {form.name || "Tên quán"}
          </p>

          <p className="mt-1 line-clamp-3 text-xs font-semibold leading-5 text-[#647343]">
            {form.description || "Mô tả quán sẽ hiển thị tại đây."}
          </p>

          <div className="mt-3 grid gap-2">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-[#1877F2] px-3 text-xs font-black text-white"
            >
              <ExternalLink size={14} className="text-white" />
              <span className="text-white">Facebook</span>
            </a>

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-[#f7f8ec] px-3 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9]"
              >
                <Globe2 size={14} />
                Trang khách
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Notice({ type, icon: Icon, children }) {
  const isSuccess = type === "success";

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-[16px] border p-4 text-sm font-bold shadow-sm",
        isSuccess
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-red-100 bg-red-50 text-red-700",
      ].join(" ")}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="leading-6">{children}</p>
    </div>
  );
}
