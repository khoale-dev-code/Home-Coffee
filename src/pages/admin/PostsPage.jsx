import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  ImagePlus,
  Link2,
  Loader2,
  Megaphone,
  Newspaper,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Sparkles,
  Trash,
  Upload,
  X,
} from "lucide-react";

import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "../../services/postService";
import { uploadMediaFilesToCloudinary } from "../../services/cloudinaryService";
import { DEFAULT_SHOP_ID, getShopById } from "../../services/shopService";

const TEMPLATE_POSTS = [
  {
    label: "Món mới",
    icon: Coffee,
    text: "Món mới tại Home Coffee\n\nHôm nay quán có thêm món mới dành cho khách. Ghé quán để thử và cảm nhận hương vị nhé!",
  },
  {
    label: "Ưu đãi",
    icon: Megaphone,
    text: "Ưu đãi hôm nay\n\nHome Coffee đang có chương trình ưu đãi đặc biệt. Khách ghé quán để xem menu và chọn món yêu thích nhé!",
  },
  {
    label: "Thông báo",
    icon: Newspaper,
    text: "Thông báo từ Home Coffee\n\nQuán xin gửi đến khách hàng một cập nhật mới. Cảm ơn khách đã luôn ủng hộ Home Coffee!",
  },
];

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function inferTypeFromUrl(url = "") {
  const cleanUrl = String(url || "").toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogg")
  ) {
    return "video";
  }

  return "image";
}

function inferTypeFromFile(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function isValidUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getPostContent(post) {
  return post?.content || post?.title || "";
}

function getPostTitle(content = "") {
  const firstLine = String(content || "")
    .split("\n")
    .find((line) => line.trim());

  if (!firstLine) return "Bản tin mới";

  return firstLine.trim().slice(0, 120);
}

function formatPostDate(value) {
  if (!value) return "Vừa đăng";

  try {
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) return "Vừa đăng";

    return date.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Vừa đăng";
  }
}

function normalizePostMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          url: item,
          type: inferTypeFromUrl(item),
          name: `Media ${index + 1}`,
          mimeType: "",
          size: 0,
        };
      }

      return {
        url: item?.url || "",
        type: item?.type || inferTypeFromUrl(item?.url || ""),
        name: item?.name || `Media ${index + 1}`,
        mimeType: item?.mimeType || "",
        size: Number(item?.size || 0),
        publicId: item?.publicId || "",
        width: Number(item?.width || 0),
        height: Number(item?.height || 0),
      };
    })
    .filter((item) => item.url);
}

function revokeDraftUrls(mediaDrafts = []) {
  mediaDrafts.forEach((media) => {
    if (media.source === "file" && media.url) {
      URL.revokeObjectURL(media.url);
    }
  });
}

function buildUrlMedia(mediaDrafts = []) {
  return mediaDrafts
    .filter((media) => media.source !== "file")
    .map((media) => ({
      url: media.url,
      type: media.type || inferTypeFromUrl(media.url || ""),
      name: media.name || "Media",
      mimeType: media.mimeType || "",
      size: Number(media.size || 0),
      publicId: media.publicId || "",
      width: Number(media.width || 0),
      height: Number(media.height || 0),
    }));
}

function makeDraftFromFile(file) {
  return {
    localId: createLocalId(),
    source: "file",
    file,
    url: URL.createObjectURL(file),
    type: inferTypeFromFile(file),
    name: file.name || "Media",
    mimeType: file.type || "",
    size: Number(file.size || 0),
  };
}

function makeDraftFromUrl(url) {
  return {
    localId: createLocalId(),
    source: "url",
    url,
    type: inferTypeFromUrl(url),
    name: "Media URL",
    mimeType: "",
    size: 0,
  };
}

function makeDraftFromSavedMedia(media, index = 0) {
  return {
    localId: createLocalId(),
    source: "saved",
    url: media.url,
    type: media.type || inferTypeFromUrl(media.url || ""),
    name: media.name || `Media ${index + 1}`,
    mimeType: media.mimeType || "",
    size: Number(media.size || 0),
    publicId: media.publicId || "",
    width: Number(media.width || 0),
    height: Number(media.height || 0),
  };
}

export default function PostsPage() {
  const [shop, setShop] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [content, setContent] = useState("");
  const [mediaDrafts, setMediaDrafts] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMediaDrafts, setEditMediaDrafts] = useState([]);
  const [editShowUrlInput, setEditShowUrlInput] = useState(false);
  const [editUrlInput, setEditUrlInput] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editIsPinned, setEditIsPinned] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [viewerMedia, setViewerMedia] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(null);

  const canSubmit = Boolean(content.trim() || mediaDrafts.length > 0);
  const canUpdate = Boolean(editContent.trim() || editMediaDrafts.length > 0);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return Number(a.order || 0) - Number(b.order || 0);
    });
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return sortedPosts.filter((post) => {
      const contentText = getPostContent(post).toLowerCase();
      const media = normalizePostMedia(post.media);
      const published = post.isPublished !== false;

      const matchKeyword = !keyword || contentText.includes(keyword) || String(post.title || "").toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && published) ||
        (statusFilter === "hidden" && !published) ||
        (statusFilter === "pinned" && post.isPinned === true) ||
        (statusFilter === "media" && media.length > 0);

      return matchKeyword && matchStatus;
    });
  }, [sortedPosts, searchText, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((post) => post.isPublished !== false).length,
      hidden: posts.filter((post) => post.isPublished === false).length,
      pinned: posts.filter((post) => post.isPinned === true).length,
      mediaCount: posts.filter((post) => normalizePostMedia(post.media).length > 0).length,
    };
  }, [posts]);

  async function loadData({ silent = false } = {}) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setNotice({ type: "", text: "" });

      const [shopData, postsData] = await Promise.all([
        getShopById(DEFAULT_SHOP_ID).catch(() => null),
        getPosts(DEFAULT_SHOP_ID).catch(() => []),
      ]);

      setShop(shopData);
      setPosts(postsData);
    } catch (error) {
      console.error("Không thể tải bản tin", error);
      setNotice({ type: "error", text: "Không thể tải dữ liệu bản tin." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();

    return () => {
      revokeDraftUrls(mediaDrafts);
      revokeDraftUrls(editMediaDrafts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetComposer() {
    revokeDraftUrls(mediaDrafts);
    setContent("");
    setMediaDrafts([]);
    setShowUrlInput(false);
    setUrlInput("");
    setIsPublished(true);
    setIsPinned(false);
  }

  async function uploadDraftMedia(drafts = []) {
    const fileDrafts = drafts.filter((media) => media.source === "file" && media.file);
    const urlMedia = buildUrlMedia(drafts);

    if (fileDrafts.length === 0) return urlMedia;

    const files = fileDrafts.map((media) => media.file);
    const uploadedMedia = await uploadMediaFilesToCloudinary(
      files,
      `home-coffee/${DEFAULT_SHOP_ID}/posts`
    );

    return [...normalizePostMedia(uploadedMedia), ...urlMedia];
  }

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setMediaDrafts((prev) => [...prev, ...files.map(makeDraftFromFile)]);
    event.target.value = "";
  }

  function handleEditPickFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setEditMediaDrafts((prev) => [...prev, ...files.map(makeDraftFromFile)]);
    event.target.value = "";
  }

  function handleAddUrl() {
    const url = urlInput.trim();

    if (!isValidUrl(url)) {
      setNotice({ type: "error", text: "Link media chưa hợp lệ." });
      return;
    }

    setMediaDrafts((prev) => [...prev, makeDraftFromUrl(url)]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function handleEditAddUrl() {
    const url = editUrlInput.trim();

    if (!isValidUrl(url)) {
      setNotice({ type: "error", text: "Link media chưa hợp lệ." });
      return;
    }

    setEditMediaDrafts((prev) => [...prev, makeDraftFromUrl(url)]);
    setEditUrlInput("");
    setEditShowUrlInput(false);
  }

  function removeMedia(localId) {
    setMediaDrafts((prev) => {
      const removed = prev.find((item) => item.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((item) => item.localId !== localId);
    });
  }

  function removeEditMedia(localId) {
    setEditMediaDrafts((prev) => {
      const removed = prev.find((item) => item.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((item) => item.localId !== localId);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setNotice({ type: "", text: "" });

      const cleanContent = content.trim();
      const finalMedia = await uploadDraftMedia(mediaDrafts);

      await createPost(DEFAULT_SHOP_ID, {
        title: getPostTitle(cleanContent),
        content: cleanContent,
        media: finalMedia,
        isPublished,
        isActive: isPublished,
        isPinned,
        order: posts.length + 1,
      });

      resetComposer();
      setNotice({ type: "success", text: isPublished ? "Đã đăng bản tin." : "Đã lưu bản tin ở trạng thái ẩn." });
      await loadData({ silent: true });
    } catch (error) {
      console.error("Lỗi khi đăng bài", error);
      setNotice({
        type: "error",
        text: error?.message || "Không thể đăng bản tin. Hãy kiểm tra Cloudinary hoặc thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openEditPost(post) {
    revokeDraftUrls(editMediaDrafts);

    setEditingPost(post);
    setEditContent(getPostContent(post));
    setEditMediaDrafts(normalizePostMedia(post.media).map(makeDraftFromSavedMedia));
    setEditIsPublished(post.isPublished !== false);
    setEditIsPinned(post.isPinned === true);
    setEditShowUrlInput(false);
    setEditUrlInput("");
  }

  function closeEditPost() {
    revokeDraftUrls(editMediaDrafts);
    setEditingPost(null);
    setEditContent("");
    setEditMediaDrafts([]);
    setEditShowUrlInput(false);
    setEditUrlInput("");
  }

  async function handleUpdatePost(event) {
    event.preventDefault();

    if (!editingPost || !canUpdate || editSubmitting) return;

    try {
      setEditSubmitting(true);
      setNotice({ type: "", text: "" });

      const cleanContent = editContent.trim();
      const finalMedia = await uploadDraftMedia(editMediaDrafts);

      await updatePost(DEFAULT_SHOP_ID, editingPost.id, {
        title: getPostTitle(cleanContent),
        content: cleanContent,
        media: finalMedia,
        isPublished: editIsPublished,
        isActive: editIsPublished,
        isPinned: editIsPinned,
        order: editingPost.order || 1,
      });

      closeEditPost();
      setNotice({ type: "success", text: "Đã cập nhật bản tin." });
      await loadData({ silent: true });
    } catch (error) {
      console.error("Lỗi khi cập nhật bài", error);
      setNotice({
        type: "error",
        text: error?.message || "Không thể cập nhật bản tin. Hãy kiểm tra Cloudinary hoặc thử lại.",
      });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(post) {
    const ok = window.confirm("Bạn có chắc muốn xóa bản tin này?");
    if (!ok) return;

    try {
      setNotice({ type: "", text: "" });
      await deletePost(DEFAULT_SHOP_ID, post.id);
      setNotice({ type: "success", text: "Đã xóa bản tin." });
      await loadData({ silent: true });
    } catch (error) {
      console.error("Không thể xóa bài", error);
      setNotice({ type: "error", text: "Không thể xóa bản tin." });
    }
  }

  async function handleTogglePublished(post) {
    const nextPublished = post.isPublished === false;

    try {
      await updatePost(DEFAULT_SHOP_ID, post.id, {
        title: post.title || getPostTitle(getPostContent(post)),
        content: getPostContent(post),
        media: normalizePostMedia(post.media),
        isPublished: nextPublished,
        isActive: nextPublished,
        isPinned: post.isPinned === true,
        order: post.order || 1,
      });

      await loadData({ silent: true });
    } catch (error) {
      console.error("Không thể đổi trạng thái bài", error);
      setNotice({ type: "error", text: "Không thể đổi trạng thái bản tin." });
    }
  }

  async function handleTogglePinned(post) {
    try {
      await updatePost(DEFAULT_SHOP_ID, post.id, {
        title: post.title || getPostTitle(getPostContent(post)),
        content: getPostContent(post),
        media: normalizePostMedia(post.media),
        isPublished: post.isPublished !== false,
        isActive: post.isPublished !== false,
        isPinned: !post.isPinned,
        order: post.order || 1,
      });

      await loadData({ silent: true });
    } catch (error) {
      console.error("Không thể ghim bài", error);
      setNotice({ type: "error", text: "Không thể cập nhật ghim bản tin." });
    }
  }

  function openViewer(media, index) {
    setViewerMedia(media);
    setViewerIndex(index);
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4">
        <div className="flex items-center gap-3 rounded-[16px] border border-[#d9dda9] bg-white px-5 py-4 text-sm font-black text-[#294f31] shadow-sm">
          <Loader2 size={20} className="animate-spin" />
          Đang tải bản tin...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <PageHeader
          shop={shop}
          stats={stats}
          refreshing={refreshing}
          onRefresh={() => loadData({ silent: true })}
        />

        {notice.text && (
          <NoticeBox
            type={notice.type}
            text={notice.text}
            onClose={() => setNotice({ type: "", text: "" })}
          />
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
          <main className="min-w-0 space-y-5">
            <Composer
              shop={shop}
              content={content}
              setContent={setContent}
              mediaDrafts={mediaDrafts}
              showUrlInput={showUrlInput}
              setShowUrlInput={setShowUrlInput}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              isPublished={isPublished}
              setIsPublished={setIsPublished}
              isPinned={isPinned}
              setIsPinned={setIsPinned}
              submitting={submitting}
              canSubmit={canSubmit}
              onSubmit={handleSubmit}
              onPickFiles={handlePickFiles}
              onAddUrl={handleAddUrl}
              onRemoveMedia={removeMedia}
              onReset={resetComposer}
            />

            <PostToolbar
              total={filteredPosts.length}
              searchText={searchText}
              setSearchText={setSearchText}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <FeedList
              posts={filteredPosts}
              shop={shop}
              onEdit={openEditPost}
              onDelete={handleDelete}
              onTogglePublished={handleTogglePublished}
              onTogglePinned={handleTogglePinned}
              onOpenMedia={openViewer}
            />
          </main>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <PreviewPanel
              shop={shop}
              content={content}
              mediaDrafts={mediaDrafts}
              isPublished={isPublished}
              isPinned={isPinned}
            />

            <GuidePanel />
          </aside>
        </div>
      </div>

      <EditPostModal
        post={editingPost}
        shop={shop}
        content={editContent}
        setContent={setEditContent}
        mediaDrafts={editMediaDrafts}
        showUrlInput={editShowUrlInput}
        setShowUrlInput={setEditShowUrlInput}
        urlInput={editUrlInput}
        setUrlInput={setEditUrlInput}
        isPublished={editIsPublished}
        setIsPublished={setEditIsPublished}
        isPinned={editIsPinned}
        setIsPinned={setEditIsPinned}
        submitting={editSubmitting}
        canUpdate={canUpdate}
        onSubmit={handleUpdatePost}
        onPickFiles={handleEditPickFiles}
        onAddUrl={handleEditAddUrl}
        onRemoveMedia={removeEditMedia}
        onClose={closeEditPost}
      />

      <MediaViewerModal
        media={viewerMedia}
        activeIndex={viewerIndex}
        onChange={setViewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}

function PageHeader({ shop, stats, refreshing, onRefresh }) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="bg-[#294f31] p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#e7eac3]">
              <Newspaper size={14} />
              Customer updates
            </p>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Bản tin quán
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">
              Đăng món mới, ưu đãi, hình ảnh không gian hoặc thông báo nhanh cho khách hàng. Form được tối ưu để thao tác nhanh như các hệ thống quản trị menu/blog phổ biến.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-4 text-sm font-black text-[#294f31] transition hover:bg-[#e7eac3] disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid gap-2 bg-[#f7f8ec] p-3 sm:grid-cols-5 sm:p-4">
        <MiniStat label="Tổng bài" value={stats.total} />
        <MiniStat label="Đang hiện" value={stats.published} />
        <MiniStat label="Đang ẩn" value={stats.hidden} />
        <MiniStat label="Đã ghim" value={stats.pinned} />
        <MiniStat label="Có media" value={stats.mediaCount} />
      </div>

      <div className="flex items-center gap-3 border-t border-[#d9dda9] px-4 py-3 sm:px-5">
        <ShopAvatar shop={shop} />

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#294f31]">
            {shop?.name || "Home Coffee"}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-[#647343]">
            Bài đăng sẽ hiển thị ở trang Bản tin khách hàng nếu đang bật công khai.
          </p>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[14px] border border-[#d9dda9] bg-white p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#647343]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-[#294f31]">{value}</p>
    </div>
  );
}

function NoticeBox({ type, text, onClose }) {
  const isError = type === "error";

  return (
    <div
      className={[
        "flex items-start justify-between gap-3 rounded-[14px] border px-4 py-3 shadow-sm",
        isError ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-2">
        {isError ? (
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        )}
        <p className="text-sm font-bold leading-6">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-black/5"
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function Composer({
  shop,
  content,
  setContent,
  mediaDrafts,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  isPublished,
  setIsPublished,
  isPinned,
  setIsPinned,
  submitting,
  canSubmit,
  onSubmit,
  onPickFiles,
  onAddUrl,
  onRemoveMedia,
  onReset,
}) {
  const hasDraft = content.trim() || mediaDrafts.length > 0;
  const characterCount = content.length;

  function applyTemplate(templateText) {
    setContent((prev) => {
      if (!prev.trim()) return templateText;
      return `${prev.trim()}\n\n${templateText}`;
    });
  }

  function copyContent() {
    if (!content.trim()) return;
    navigator.clipboard?.writeText(content.trim());
  }

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[18px] border border-[#d9dda9] bg-white shadow-sm"
    >
      <div className="border-b border-[#d9dda9] bg-[#f7f8ec] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ShopAvatar shop={shop} />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#647343]">
                Soạn bản tin mới
              </p>
              <p className="mt-1 truncate text-lg font-black text-[#294f31]">
                {shop?.name || "Home Coffee"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatusPill
              active={isPublished}
              onClick={() => setIsPublished((value) => !value)}
              activeLabel="Công khai"
              inactiveLabel="Ẩn tạm"
              activeIcon={Eye}
              inactiveIcon={EyeOff}
            />

            <StatusPill
              active={isPinned}
              onClick={() => setIsPinned((value) => !value)}
              activeLabel="Đang ghim"
              inactiveLabel="Ghim bài"
              activeIcon={Pin}
              inactiveIcon={Pin}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATE_POSTS.map((template) => {
            const Icon = template.icon;

            return (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template.text)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
              >
                <Icon size={14} />
                {template.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <label className="text-sm font-black text-[#294f31]">
            Nội dung bản tin
          </label>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`${shop?.name || "Quán"} đang có thông báo gì mới?`}
            className="mt-2 min-h-[170px] w-full resize-y rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec] px-4 py-3 text-[15px] font-semibold leading-7 text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
          />

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold leading-5 text-[#647343]">
              Gợi ý: dòng đầu tiên nên là tiêu đề ngắn, các dòng sau là nội dung chi tiết.
            </p>
            <p className="shrink-0 text-xs font-black text-[#647343]">
              {characterCount} ký tự
            </p>
          </div>
        </div>

        <MediaToolbox
          mediaDrafts={mediaDrafts}
          showUrlInput={showUrlInput}
          setShowUrlInput={setShowUrlInput}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onPickFiles={onPickFiles}
          onAddUrl={onAddUrl}
          onRemoveMedia={onRemoveMedia}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#d9dda9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          {hasDraft && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100"
            >
              <X size={15} />
              Xóa nháp
            </button>
          )}

          {content.trim() && (
            <button
              type="button"
              onClick={copyContent}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#f7f8ec] px-3 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
            >
              <Copy size={15} />
              Copy
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-5 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#1f3d26] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin text-white" />
          ) : (
            <Send size={18} className="text-white" />
          )}
          <span className="text-white">
            {submitting ? "Đang đăng..." : isPublished ? "Đăng bản tin" : "Lưu nháp ẩn"}
          </span>
        </button>
      </div>
    </form>
  );
}

function StatusPill({ active, onClick, activeLabel, inactiveLabel, activeIcon: ActiveIcon, inactiveIcon: InactiveIcon }) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-xs font-black transition ring-1",
        active ? "bg-[#294f31] text-white ring-[#294f31]" : "bg-white text-[#294f31] ring-[#d9dda9] hover:bg-[#e7eac3]",
      ].join(" ")}
    >
      <Icon size={15} className={active ? "text-white" : "text-[#294f31]"} />
      <span className={active ? "text-white" : "text-[#294f31]"}>
        {active ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}

function MediaToolbox({
  mediaDrafts,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  onPickFiles,
  onAddUrl,
  onRemoveMedia,
}) {
  return (
    <div className="rounded-[16px] border border-[#d9dda9] bg-[#f7f8ec] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#294f31]">Media bài viết</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
            Thêm ảnh/video/GIF để bài đăng nổi bật hơn. Có thể chọn file hoặc dán URL.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-white px-4 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]">
            <Upload size={15} />
            Chọn file
            <input
              type="file"
              accept="image/*,video/*,.gif"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowUrlInput((prev) => !prev)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-white px-4 text-xs font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
          >
            <Link2 size={15} />
            Dán URL
          </button>
        </div>
      </div>

      {showUrlInput && (
        <UrlInputBox
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onAddUrl={onAddUrl}
          onClose={() => setShowUrlInput(false)}
        />
      )}

      {mediaDrafts.length > 0 ? (
        <MediaPreviewGrid mediaDrafts={mediaDrafts} onRemove={onRemoveMedia} />
      ) : (
        <div className="mt-4 rounded-[14px] border border-dashed border-[#d9dda9] bg-white p-5 text-center">
          <ImagePlus size={30} className="mx-auto text-[#819045]" />
          <p className="mt-2 text-sm font-black text-[#294f31]">Chưa có media</p>
          <p className="mt-1 text-xs font-semibold text-[#647343]">
            Bài viết vẫn có thể đăng chỉ với nội dung chữ.
          </p>
        </div>
      )}
    </div>
  );
}

function UrlInputBox({ urlInput, setUrlInput, onAddUrl, onClose }) {
  return (
    <div className="mt-4 rounded-[14px] border border-[#d9dda9] bg-white p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddUrl();
            }
          }}
          placeholder="Dán link ảnh, GIF hoặc video .mp4..."
          className="h-11 min-w-0 rounded-[10px] border border-[#d9dda9] bg-white px-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:ring-4 focus:ring-[#294f31]/10"
        />

        <button
          type="button"
          onClick={onAddUrl}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#294f31] px-4 text-sm font-black text-white transition hover:bg-[#1f3d26]"
        >
          <Plus size={16} className="text-white" />
          <span className="text-white">Thêm</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#f7f8ec] px-4 text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

function MediaPreviewGrid({ mediaDrafts, onRemove }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {mediaDrafts.map((media, index) => (
        <div
          key={media.localId}
          className="overflow-hidden rounded-[14px] border border-[#d9dda9] bg-white shadow-sm"
        >
          <div className="relative aspect-square bg-[#f7f8ec]">
            {media.type === "video" ? (
              <video
                src={media.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={media.url}
                alt={media.name || "Media"}
                className="h-full w-full object-cover"
              />
            )}

            {media.type === "video" && (
              <div className="absolute inset-0 grid place-items-center bg-black/15">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white">
                  <Play size={18} fill="white" className="text-white" />
                </span>
              </div>
            )}

            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black text-white">
              #{index + 1}
            </span>

            <button
              type="button"
              onClick={() => onRemove(media.localId)}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[10px] bg-white text-red-600 shadow-sm transition hover:bg-red-50"
              aria-label="Xóa media"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-3">
            <p className="truncate text-xs font-black text-[#294f31]">
              {media.name || "Media"}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#647343]">
              {media.source === "file" ? "File chờ upload" : "URL / đã lưu"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostToolbar({ total, searchText, setSearchText, statusFilter, setStatusFilter }) {
  const filters = [
    { value: "all", label: "Tất cả" },
    { value: "published", label: "Đang hiện" },
    { value: "hidden", label: "Đang ẩn" },
    { value: "pinned", label: "Đã ghim" },
    { value: "media", label: "Có media" },
  ];

  return (
    <section className="rounded-[16px] border border-[#d9dda9] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black text-[#294f31]">Danh sách bản tin</p>
          <p className="mt-1 text-xs font-semibold text-[#647343]">
            Đang hiển thị {total} bài theo bộ lọc hiện tại.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[560px]">
          <label className="relative block">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#819045]" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm nội dung bản tin..."
              className="h-11 w-full rounded-[12px] border border-[#d9dda9] bg-[#f7f8ec] pl-10 pr-3 text-sm font-bold text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-[12px] border border-[#d9dda9] bg-[#f7f8ec] px-3 text-sm font-black text-[#294f31] outline-none transition focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function FeedList({ posts, shop, onEdit, onDelete, onTogglePublished, onTogglePinned, onOpenMedia }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#d9dda9] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#d9dda9]">
          <FileText size={28} />
        </div>
        <p className="mt-4 text-lg font-black text-[#294f31]">
          Chưa có bản tin phù hợp
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#647343]">
          Hãy tạo bài đăng đầu tiên hoặc đổi bộ lọc tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          shop={shop}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublished={onTogglePublished}
          onTogglePinned={onTogglePinned}
          onOpenMedia={onOpenMedia}
        />
      ))}
    </div>
  );
}

function PostCard({ post, shop, onEdit, onDelete, onTogglePublished, onTogglePinned, onOpenMedia }) {
  const content = getPostContent(post);
  const media = normalizePostMedia(post.media);
  const isPublished = post.isPublished !== false;

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ShopAvatar shop={shop} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-[#294f31]">
                {shop?.name || "Home Coffee"}
              </p>

              {post.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e7eac3] px-2 py-0.5 text-[10px] font-black uppercase text-[#294f31]">
                  <Pin size={11} />
                  Ghim
                </span>
              )}

              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
                  isPublished ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500",
                ].join(" ")}
              >
                {isPublished ? "Đang hiện" : "Đang ẩn"}
              </span>
            </div>

            <p className="mt-1 text-xs font-semibold text-[#647343]">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 sm:flex sm:shrink-0 sm:items-center">
          <IconButton label={post.isPinned ? "Bỏ ghim" : "Ghim bài"} onClick={() => onTogglePinned(post)} icon={Pin} />
          <IconButton label={isPublished ? "Ẩn bài" : "Hiện bài"} onClick={() => onTogglePublished(post)} icon={isPublished ? Eye : EyeOff} />
          <IconButton label="Sửa bài" onClick={() => onEdit(post)} icon={Edit3} />
          <IconButton label="Xóa bài" onClick={() => onDelete(post)} icon={Trash} danger />
        </div>
      </div>

      {content && (
        <div className="px-4 pb-4 sm:px-5">
          <ExpandableText text={content} />
        </div>
      )}

      {media.length > 0 && (
        <PostMediaGrid media={media} onOpen={(index) => onOpenMedia(media, index)} />
      )}
    </article>
  );
}

function IconButton({ label, onClick, icon: Icon, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "grid h-9 place-items-center rounded-[10px] transition sm:w-9",
        danger ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#d9dda9] hover:bg-[#e7eac3]",
      ].join(" ")}
      title={label}
      aria-label={label}
    >
      <Icon size={16} />
    </button>
  );
}

function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const shouldClamp = text.length > 220 || text.split("\n").length > 5;

  if (!shouldClamp) {
    return <p className="whitespace-pre-wrap text-[15px] font-semibold leading-7 text-[#294f31]">{text}</p>;
  }

  return (
    <div>
      <p
        className={[
          "whitespace-pre-wrap text-[15px] font-semibold leading-7 text-[#294f31]",
          expanded ? "" : "line-clamp-5",
        ].join(" ")}
      >
        {text}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-2 text-sm font-black text-[#819045] transition hover:text-[#294f31]"
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </div>
  );
}

function PostMediaGrid({ media, onOpen }) {
  const visibleMedia = media.slice(0, 4);
  const extraCount = media.length - visibleMedia.length;

  return (
    <div
      className={[
        "grid gap-[2px] border-t border-[#d9dda9] bg-[#d9dda9]",
        visibleMedia.length === 1 ? "grid-cols-1" : "grid-cols-2",
      ].join(" ")}
    >
      {visibleMedia.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className={[
            "group relative overflow-hidden bg-[#f7f8ec] text-left",
            visibleMedia.length === 1 ? "aspect-video" : "aspect-square",
          ].join(" ")}
        >
          {item.type === "video" ? (
            <>
              <video
                src={item.url}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                preload="metadata"
                muted
                playsInline
              />
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white">
                  <Play size={22} fill="white" className="text-white" />
                </span>
              </div>
            </>
          ) : (
            <img
              src={item.url}
              alt={item.name || "Media"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          )}

          {extraCount > 0 && index === visibleMedia.length - 1 && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-black text-white">
              +{extraCount}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function PreviewPanel({ shop, content, mediaDrafts, isPublished, isPinned }) {
  const hasDraft = content.trim() || mediaDrafts.length > 0;
  const firstMedia = mediaDrafts[0];

  return (
    <section className="rounded-[18px] border border-[#d9dda9] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#294f31]">Preview trước khi đăng</p>
          <p className="mt-1 text-xs font-semibold text-[#647343]">
            Xem nhanh cách khách sẽ thấy bài viết.
          </p>
        </div>
        <BarChart3 size={20} className="text-[#819045]" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-[#d9dda9] bg-[#f7f8ec]">
        <div className="flex items-center gap-3 border-b border-[#d9dda9] bg-white p-3">
          <ShopAvatar shop={shop} small />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#294f31]">
              {shop?.name || "Home Coffee"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="rounded-full bg-[#f7f8ec] px-2 py-0.5 text-[10px] font-black text-[#647343] ring-1 ring-[#d9dda9]">
                {isPublished ? "Công khai" : "Ẩn tạm"}
              </span>
              {isPinned && (
                <span className="rounded-full bg-[#e7eac3] px-2 py-0.5 text-[10px] font-black text-[#294f31]">
                  Ghim
                </span>
              )}
            </div>
          </div>
        </div>

        {firstMedia && (
          <div className="aspect-video bg-white">
            {firstMedia.type === "video" ? (
              <video src={firstMedia.url} className="h-full w-full object-cover" muted playsInline />
            ) : (
              <img src={firstMedia.url} alt="Preview" className="h-full w-full object-cover" />
            )}
          </div>
        )}

        <div className="p-3">
          {hasDraft ? (
            <p className="line-clamp-6 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#294f31]">
              {content.trim() || `${mediaDrafts.length} media đang chờ đăng`}
            </p>
          ) : (
            <p className="text-sm font-semibold leading-6 text-[#647343]">
              Nhập nội dung hoặc thêm media để xem preview.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function GuidePanel() {
  return (
    <section className="rounded-[18px] border border-[#d9dda9] bg-[#f7f8ec] p-4">
      <p className="flex items-center gap-2 text-sm font-black text-[#294f31]">
        <Sparkles size={17} />
        Quy trình gợi ý
      </p>

      <div className="mt-3 space-y-2 text-sm font-semibold leading-6 text-[#647343]">
        <p className="rounded-[12px] bg-white p-3 ring-1 ring-[#d9dda9]">
          1. Viết tiêu đề ngắn ở dòng đầu tiên.
        </p>
        <p className="rounded-[12px] bg-white p-3 ring-1 ring-[#d9dda9]">
          2. Thêm ảnh thật của món / không gian để tăng độ tin cậy.
        </p>
        <p className="rounded-[12px] bg-white p-3 ring-1 ring-[#d9dda9]">
          3. Dùng “Ẩn tạm” nếu muốn lưu nháp, bật “Công khai” khi muốn khách xem.
        </p>
      </div>
    </section>
  );
}

function EditPostModal({
  post,
  shop,
  content,
  setContent,
  mediaDrafts,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  isPublished,
  setIsPublished,
  isPinned,
  setIsPinned,
  submitting,
  canUpdate,
  onSubmit,
  onPickFiles,
  onAddUrl,
  onRemoveMedia,
  onClose,
}) {
  useEffect(() => {
    if (!post) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng chỉnh sửa"
      />

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d9dda9] bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <ShopAvatar shop={shop} small />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#819045]">
                Chỉnh sửa bản tin
              </p>
              <p className="truncate text-sm font-black text-[#294f31]">
                {shop?.name || "Home Coffee"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mb-4 grid grid-cols-2 gap-2 sm:flex">
            <StatusPill
              active={isPublished}
              onClick={() => setIsPublished((value) => !value)}
              activeLabel="Công khai"
              inactiveLabel="Ẩn tạm"
              activeIcon={Eye}
              inactiveIcon={EyeOff}
            />
            <StatusPill
              active={isPinned}
              onClick={() => setIsPinned((value) => !value)}
              activeLabel="Đang ghim"
              inactiveLabel="Ghim bài"
              activeIcon={Pin}
              inactiveIcon={Pin}
            />
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung bản tin..."
            className="min-h-[180px] w-full resize-y rounded-[14px] border border-[#d9dda9] bg-[#f7f8ec] px-4 py-3 text-[15px] font-semibold leading-7 text-[#294f31] outline-none transition placeholder:text-[#7a874b]/60 focus:border-[#294f31] focus:bg-white focus:ring-4 focus:ring-[#294f31]/10"
          />

          <div className="mt-4">
            <MediaToolbox
              mediaDrafts={mediaDrafts}
              showUrlInput={showUrlInput}
              setShowUrlInput={setShowUrlInput}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              onPickFiles={onPickFiles}
              onAddUrl={onAddUrl}
              onRemoveMedia={onRemoveMedia}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-[#d9dda9] bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#f7f8ec] px-4 text-sm font-black text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3]"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={submitting || !canUpdate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-5 text-sm font-black text-white transition hover:bg-[#1f3d26] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin text-white" />
            ) : (
              <Save size={17} className="text-white" />
            )}
            <span className="text-white">
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

function MediaViewerModal({ media, activeIndex, onChange, onClose }) {
  const isOpen = activeIndex !== null && activeIndex !== undefined;
  const activeMedia = isOpen ? media[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowLeft") {
        onChange(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        onChange(activeIndex === media.length - 1 ? 0 : activeIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isOpen, media.length, onChange, onClose]);

  if (!isOpen || !activeMedia) return null;

  function goPrev() {
    if (media.length <= 1) return;

    onChange(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
  }

  function goNext() {
    if (media.length <= 1) return;

    onChange(activeIndex === media.length - 1 ? 0 : activeIndex + 1);
  }

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden bg-black/90 backdrop-blur-sm">
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <div className="flex h-[58px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/45 px-3 text-white sm:h-[64px] sm:px-5">
          <div className="min-w-0">
            <p className="text-sm font-black text-white">
              Media {activeIndex + 1}/{media.length}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold text-white/60">
              {activeMedia.name || "Xem ảnh / video"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-[#294f31] transition hover:bg-[#e7eac3]"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-5">
          {activeMedia.type === "video" ? (
            <video
              src={activeMedia.url}
              controls
              playsInline
              className="max-h-full max-w-full rounded-[14px] bg-black object-contain shadow-2xl"
            />
          ) : (
            <img
              src={activeMedia.url}
              alt={activeMedia.name || "Media"}
              className="max-h-full max-w-full rounded-[14px] object-contain shadow-2xl"
            />
          )}

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#294f31] shadow-lg transition hover:bg-white sm:left-5"
                aria-label="Media trước"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#294f31] shadow-lg transition hover:bg-white sm:right-5"
                aria-label="Media sau"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
function ShopAvatar({ shop, small = false }) {
  return (
    <div
      className={[
        "grid shrink-0 place-items-center overflow-hidden rounded-[14px] border border-[#d9dda9] bg-[#e7eac3] text-[#294f31] shadow-sm",
        small ? "h-10 w-10" : "h-12 w-12",
      ].join(" ")}
    >
      {shop?.logoUrl ? (
        <img
          src={shop.logoUrl}
          alt={shop?.name || "Logo"}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <Coffee size={small ? 20 : 24} />
      )}
    </div>
  );
}
