import { useEffect, useState } from "react";
import { FolderTree, PlusCircle, X } from "lucide-react";

import PageHeader from "../../components/admin/menu/PageHeader";
import Notice from "../../components/admin/menu/Notice";
import MenuStats from "../../components/admin/menu/MenuStats";
import CategoryPanel from "../../components/admin/menu/CategoryPanel";
import ItemFormPanel from "../../components/admin/menu/ItemFormPanel";
import MenuListPanel from "../../components/admin/menu/MenuListPanel";

import { useMenuItemsAdmin } from "../../hooks/admin/useMenuItemsAdmin";

export default function MenuItemsPage() {
  const menu = useMenuItemsAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (!formOpen) return;

    const savedMessages = ["Đã thêm món mới.", "Đã cập nhật món."];

    if (savedMessages.includes(menu.message)) {
      setFormOpen(false);
    }
  }, [menu.message, formOpen]);

  function handleOpenCreateForm() {
    menu.resetItemForm();
    setFormOpen(true);
  }

  function handleEditItem(item) {
    menu.handleEditItem(item);
    setFormOpen(true);
  }

  function handleCloseForm() {
    if (menu.itemSubmitting) return;

    menu.resetItemForm();
    setFormOpen(false);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1680px] space-y-4 sm:space-y-5">
        <PageHeader
          loading={menu.loading}
          onRefresh={menu.loadData}
          savingOrder={menu.savingOrder}
        />

        <MenuStats stats={menu.stats} />

        <Notice
          message={menu.message}
          error={menu.error}
          savingOrder={menu.savingOrder}
        />

        <TopActionBar
          total={menu.stats.total}
          categoryOpen={categoryOpen}
          formOpen={formOpen}
          onOpenCreateForm={handleOpenCreateForm}
          onToggleCategory={() => setCategoryOpen((prev) => !prev)}
        />

        {categoryOpen && (
          <CategorySection menu={menu} />
        )}

        <MenuListPanel
          loading={menu.loading}
          sortedItems={menu.sortedItems}
          filteredItems={menu.filteredItems}
          itemIds={menu.itemIds}
          categoryMap={menu.categoryMap}
          searchText={menu.searchText}
          setSearchText={menu.setSearchText}
          categoryFilter={menu.categoryFilter}
          setCategoryFilter={menu.setCategoryFilter}
          statusFilter={menu.statusFilter}
          setStatusFilter={menu.setStatusFilter}
          categories={menu.categories}
          canReorder={menu.canReorder}
          sensors={menu.sensors}
          onDragEnd={menu.handleDragEnd}
          onEditItem={handleEditItem}
          onDeleteItem={menu.handleDeleteItem}
          onToggleAvailable={menu.handleToggleAvailable}
          onToggleFeatured={menu.handleToggleFeatured}
        />
      </div>

      {formOpen && (
        <FormDrawer
          editingItemId={menu.editingItemId}
          itemSubmitting={menu.itemSubmitting}
          onClose={handleCloseForm}
        >
          <ItemFormPanel
            categories={menu.categories}
            itemForm={menu.itemForm}
            updateItemForm={menu.updateItemForm}
            editingItemId={menu.editingItemId}
            imageFile={menu.imageFile}
            setImageFile={menu.setImageFile}
            imagePreviewUrl={menu.imagePreviewUrl}
            itemSubmitting={menu.itemSubmitting}
            onSubmit={menu.handleSubmitItem}
            onReset={handleCloseForm}
            onAddSize={menu.handleAddSize}
            onUpdateSize={menu.handleUpdateSize}
            onRemoveSize={menu.handleRemoveSize}
            onCreateCategoryQuick={menu.handleQuickCreateCategory}
          />
        </FormDrawer>
      )}

      {!formOpen && (
        <MobileCreateButton onClick={handleOpenCreateForm} />
      )}
    </>
  );
}

function CategorySection({ menu }) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#d9dda9] bg-white shadow-sm">
      <div className="border-b border-[#d9dda9] bg-[#f7f8ec] px-3 py-3 sm:px-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#e7eac3] text-[#294f31]">
            <FolderTree size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-[#294f31]">
              Quản lý danh mục
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-[#647343]">
              Thêm, sửa, ẩn hoặc hiện danh mục sản phẩm. Nếu đang thêm món mà
              chưa có danh mục, bạn cũng có thể tạo nhanh ngay trong form sản
              phẩm.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <CategoryPanel
          categories={menu.categories}
          itemCountByCategory={menu.itemCountByCategory}
          newCategoryName={menu.newCategoryName}
          setNewCategoryName={menu.setNewCategoryName}
          categorySubmitting={menu.categorySubmitting}
          editingCategoryId={menu.editingCategoryId}
          editingCategoryName={menu.editingCategoryName}
          setEditingCategoryName={menu.setEditingCategoryName}
          onCreateCategory={menu.handleCreateCategory}
          onStartEdit={menu.startEditCategory}
          onCancelEdit={menu.cancelEditCategory}
          onUpdateCategory={menu.handleUpdateCategory}
          onToggleCategory={menu.handleToggleCategory}
          onDeleteCategory={menu.handleDeleteCategory}
        />
      </div>
    </section>
  );
}

function TopActionBar({
  total,
  categoryOpen,
  formOpen,
  onOpenCreateForm,
  onToggleCategory,
}) {
  return (
    <section className="rounded-[16px] border border-[#d9dda9] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#294f31]">
            Quản lý sản phẩm
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-[#647343] sm:text-sm">
            Hiện có{" "}
            <span className="font-black text-[#294f31]">{total}</span> sản
            phẩm. Có thể thêm món, tạo danh mục nhanh, nhập giá VNĐ và thêm size
            thuận tiện hơn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
          <button
            type="button"
            onClick={onToggleCategory}
            className={[
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border px-4 py-2.5 text-sm font-black transition",
              categoryOpen
                ? "border-[#294f31] bg-[#294f31] text-white"
                : "border-[#d9dda9] bg-[#f7f8ec] text-[#294f31] hover:bg-[#e7eac3]",
            ].join(" ")}
          >
            <FolderTree
              size={17}
              className={categoryOpen ? "text-white" : "text-[#294f31]"}
            />

            <span className={categoryOpen ? "text-white" : "text-[#294f31]"}>
              {categoryOpen ? "Ẩn danh mục" : "Quản lý danh mục"}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateForm}
            disabled={formOpen}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#294f31] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1f3d26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusCircle size={18} className="text-white" />

            <span className="text-white">
              {formOpen ? "Đang mở form" : "Thêm sản phẩm"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function FormDrawer({ children, editingItemId, itemSubmitting, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-black/45 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        disabled={itemSubmitting}
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        aria-label="Đóng form sản phẩm"
      />

      <aside className="relative z-10 flex h-[100dvh] w-full max-w-[780px] flex-col bg-[#f6f7e8] shadow-2xl sm:w-[92vw] lg:w-[760px]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d9dda9] bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-base font-black text-[#294f31] sm:text-lg">
              {editingItemId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-[#647343]">
              Tạo món, chọn hoặc thêm nhanh danh mục, nhập giá VNĐ và quản lý
              size.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={itemSubmitting}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#f7f8ec] text-[#294f31] ring-1 ring-[#d9dda9] transition hover:bg-[#e7eac3] disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          {children}
        </div>
      </aside>
    </div>
  );
}

function MobileCreateButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[calc(82px+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#294f31] text-white shadow-[0_14px_35px_rgba(41,79,49,0.35)] transition active:scale-95 lg:hidden"
      aria-label="Thêm sản phẩm"
    >
      <PlusCircle size={25} className="text-white" />
    </button>
  );
}