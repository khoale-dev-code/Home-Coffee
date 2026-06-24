<div align="center">

<img src="public/logohome.png" alt="Home Coffee Logo" width="130" />

# Home Coffee Menu

### Website menu online dành riêng cho quán **Home Coffee**

Khách quét QR hoặc bấm link là xem menu ngay. Admin có thể quản lý món, danh mục, topping, khuyến mãi, bản tin và thông tin quán trực tiếp trên dashboard — không cần chỉnh code.

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Cloudinary-Media%20Upload-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p>
  <strong>Repository:</strong>
  <a href="https://github.com/khoale-dev-code/Home-Coffee">github.com/khoale-dev-code/Home-Coffee</a>
</p>

<p>
  <strong>Demo:</strong>
  <a href="https://www.home-coffee-menue.website/home-coffee">home-coffee-menue.website/home-coffee</a>
</p>

[Tổng quan](#-tổng-quan) •
[Tính năng](#-tính-năng-chính) •
[Công nghệ](#️-công-nghệ-sử-dụng) •
[Cấu trúc](#-cấu-trúc-thư-mục) •
[Cài đặt](#-cài-đặt-dự-án) •
[Deploy](#-deploy-vercel)

</div>

<br />

## 📌 Tổng quan

**Home Coffee Menu** là website menu online dành cho quán cafe **Home Coffee**. Hệ thống giúp khách hàng xem menu nhanh qua QR Code hoặc đường link trực tiếp, đồng thời giúp chủ quán quản lý toàn bộ nội dung trên trang admin.

Dự án tập trung vào trải nghiệm thực tế cho quán cafe:

* Khách hàng chỉ cần mở link là xem được menu.
* Không cần đăng nhập khi xem menu.
* Admin đăng nhập để quản lý dữ liệu.
* Nội dung cập nhật realtime thông qua Firebase Firestore.
* Ảnh và video được upload qua Cloudinary.
* Giao diện tối ưu cho điện thoại, tablet và desktop.

> Dự án hiện ưu tiên cho mô hình **1 quán cafe**: Home Coffee. Tuy nhiên cấu trúc dữ liệu vẫn có thể mở rộng thành multi-shop trong tương lai.

<br />

## 🚀 Tính năng chính

<table>
<tr>
<th width="50%">👤 Trang khách hàng</th>
<th width="50%">🛠️ Trang quản trị Admin</th>
</tr>

<tr valign="top">
<td>

### Menu công khai

* Xem menu theo danh mục.
* Tìm kiếm món nhanh.
* Lọc món theo category.
* Xem món nổi bật.
* Hiển thị trạng thái còn bán / tạm hết.
* Xem chi tiết món trong modal.
* Bấm vào ảnh để xem lớn hơn.
* Hỗ trợ danh sách size / giá nếu món có nhiều size.
* Hiển thị topping chung của quán.
* Xem khuyến mãi bằng ảnh hoặc video.
* Xem bản tin / bài viết của quán.
* Truy cập Facebook cửa hàng.
* Giao diện mobile-first, dễ xem trên điện thoại.

</td>

<td>

### Dashboard quản trị

* Đăng nhập admin bằng Firebase Authentication.
* Xem tổng quan số lượng danh mục, món, khuyến mãi, bài viết.
* Quản lý danh mục menu.
* Quản lý món ăn / đồ uống.
* Thêm món có ảnh, mô tả, giá, size, tag.
* Tạo nhanh danh mục ngay trong form thêm món.
* Bật / tắt món còn bán.
* Đánh dấu món nổi bật.
* Quản lý danh sách topping chung.
* Quản lý khuyến mãi với nhiều ảnh / video.
* Quản lý bản tin, bài viết, ghim bài, ẩn / hiện bài.
* Cài đặt thông tin quán, logo, ảnh bìa, Facebook.
* Bật / tắt public menu.

</td>
</tr>
</table>

<br />

## 🧩 Các module chính

### 1. Public Menu

Trang menu dành cho khách hàng, truy cập theo slug của quán.

```txt
/:shopSlug
```

Ví dụ:

```txt
/home-coffee
```

Chức năng chính:

* Hero giới thiệu quán.
* Danh mục món.
* Danh sách sản phẩm.
* Modal xem chi tiết sản phẩm.
* Topping chung.
* Khuyến mãi.
* Bản tin mới.
* Footer Facebook.

<br />

### 2. Admin Dashboard

Trang quản trị nội bộ cho chủ quán.

```txt
/admin/login
/admin/dashboard
```

Admin có thể xem nhanh:

* Tổng số danh mục.
* Tổng số món.
* Tổng số món đang bán.
* Tổng số món nổi bật.
* Tổng số khuyến mãi.
* Tổng số bài viết.

<br />

### 3. Quản lý menu

```txt
/admin/menu
```

Chức năng:

* Thêm, sửa, xóa danh mục.
* Ẩn / hiện danh mục.
* Thêm, sửa, xóa sản phẩm.
* Upload ảnh sản phẩm.
* Nhập ảnh bằng URL.
* Tạo nhiều size cho món.
* Nhập giá theo định dạng VNĐ.
* Tạo nhanh category khi đang thêm món.
* Bật / tắt trạng thái còn bán.
* Đánh dấu món nổi bật.

<br />

### 4. Quản lý topping

```txt
/admin/toppings
```

Topping được thiết kế theo dạng **danh sách chung của quán**, phù hợp với mô hình menu chỉ để khách xem, chưa đặt hàng online.

Ví dụ dữ liệu:

```js
toppings: [
  {
    id: "topping-1-kem-cheese",
    name: "Kem cheese",
    price: 10000,
    order: 1
  },
  {
    id: "topping-2-tran-chau-trang",
    name: "Trân châu trắng",
    price: 8000,
    order: 2
  }
]
```

<br />

### 5. Quản lý khuyến mãi

```txt
/admin/promotions
```

Chức năng:

* Thêm khuyến mãi.
* Upload nhiều ảnh / video.
* Dán link media.
* Bật / tắt hiển thị.
* Sắp xếp thứ tự media.
* Hiển thị popup khuyến mãi ngoài trang khách.

<br />

### 6. Quản lý bản tin

```txt
/admin/posts
```

Chức năng:

* Tạo bài viết / bản tin.
* Thêm nhiều ảnh / video.
* Xem trước bài viết.
* Bật / tắt public.
* Ghim bài viết.
* Click ảnh để xem full màn hình.
* Hỗ trợ trang blog công khai.

Public route:

```txt
/:shopSlug/blog
```

<br />

### 7. Cài đặt quán

```txt
/admin/settings
```

Chức năng:

* Cập nhật tên quán.
* Cập nhật slug đường dẫn.
* Cập nhật mô tả ngắn.
* Cập nhật Facebook URL.
* Upload logo.
* Upload ảnh bìa.
* Bật / tắt menu public.
* Preview nhanh giao diện hiển thị ngoài trang khách.

<br />

## 🛠️ Công nghệ sử dụng

| Nhóm            | Công nghệ               |
| --------------- | ----------------------- |
| Frontend        | React 19, Vite          |
| Styling         | Tailwind CSS v4         |
| Routing         | React Router            |
| Icons           | Lucide React            |
| Authentication  | Firebase Authentication |
| Database        | Cloud Firestore         |
| Media Upload    | Cloudinary              |
| Deploy          | Vercel                  |
| Package Manager | npm                     |

<br />

## 🏗️ Cấu trúc thư mục

```txt
src/
├── app/
│   └── router.jsx
│
├── components/
│   ├── admin/
│   │   └── menu/
│   │       ├── CategoryPanel.jsx
│   │       ├── ItemFormPanel.jsx
│   │       ├── MenuListPanel.jsx
│   │       ├── MenuStats.jsx
│   │       └── PageHeader.jsx
│   │
│   └── public/
│       └── menu/
│           ├── CategorySidebar.jsx
│           ├── FeaturedProducts.jsx
│           ├── HeroBanner.jsx
│           ├── MenuHeader.jsx
│           ├── ProductGrid.jsx
│           ├── PromotionModal.jsx
│           ├── PromotionStrip.jsx
│           ├── QuickActions.jsx
│           ├── ShopFooter.jsx
│           └── ToppingSection.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useShopMenu.js
│   └── admin/
│       └── useMenuItemsAdmin.js
│
├── layouts/
│   └── AdminLayout.jsx
│
├── lib/
│   └── firebase.js
│
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MenuItemsPage.jsx
│   │   ├── PostsPage.jsx
│   │   ├── PromotionsPage.jsx
│   │   ├── ReservationsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── ToppingsPage.jsx
│   │
│   └── public/
│       ├── BlogPage.jsx
│       └── MenuPage.jsx
│
├── services/
│   ├── cloudinaryService.js
│   ├── postService.js
│   └── shopService.js
│
├── utils/
│   └── admin/
│       └── menuItemUtils.js
│
├── App.jsx
└── index.css
```

<br />

## 🗺️ Routes

| Route               | Mô tả                   |
| ------------------- | ----------------------- |
| `/admin/login`      | Đăng nhập admin         |
| `/admin/dashboard`  | Dashboard tổng quan     |
| `/admin/menu`       | Quản lý danh mục và món |
| `/admin/toppings`   | Quản lý topping chung   |
| `/admin/promotions` | Quản lý khuyến mãi      |
| `/admin/posts`      | Quản lý bản tin / blog  |
| `/admin/settings`   | Cài đặt thông tin quán  |
| `/:shopSlug`        | Trang menu công khai    |
| `/:shopSlug/blog`   | Trang blog công khai    |

<br />

## 🗄️ Data Model Firestore

```txt
admins/{uid}
  ├── email
  ├── role
  └── shopId

shops/{shopId}
  ├── name
  ├── slug
  ├── description
  ├── facebookUrl
  ├── logoUrl
  ├── coverUrl
  ├── isPublished
  ├── theme
  ├── ownerUid
  ├── toppings[]
  │
  ├── categories/{categoryId}
  │   ├── name
  │   ├── order
  │   └── isActive
  │
  ├── items/{itemId}
  │   ├── name
  │   ├── description
  │   ├── price
  │   ├── oldPrice
  │   ├── imageUrl
  │   ├── images[]
  │   ├── categoryId
  │   ├── isAvailable
  │   ├── isFeatured
  │   ├── tags[]
  │   ├── sizes[]
  │   └── order
  │
  ├── promotions/{promotionId}
  │   ├── title
  │   ├── description
  │   ├── media[]
  │   ├── active
  │   ├── startAt
  │   ├── endAt
  │   └── order
  │
  └── posts/{postId}
      ├── title
      ├── content
      ├── media[]
      ├── isPublished
      ├── isActive
      ├── isPinned
      └── order
```

<br />

## ⚙️ Cài đặt dự án

### 1. Clone source code

```bash
git clone https://github.com/khoale-dev-code/Home-Coffee.git
cd Home-Coffee
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=

VITE_DEFAULT_SHOP_ID=home-coffee

VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_CLOUDINARY_FOLDER=home-coffee
```

> Không commit `.env.local` lên GitHub. File này phải nằm trong `.gitignore`.

### 4. Chạy local

```bash
npm run dev
```

Mặc định Vite sẽ chạy tại:

```txt
http://localhost:5173
```

<br />

## 📜 Scripts

| Lệnh              | Chức năng                   |
| ----------------- | --------------------------- |
| `npm run dev`     | Chạy môi trường development |
| `npm run build`   | Build production            |
| `npm run preview` | Xem thử bản build           |
| `npm run lint`    | Kiểm tra lint               |

<br />

## 🔐 Firebase Auth & Admin

Admin được quản lý bằng collection:

```txt
admins/{uid}
```

Ví dụ document:

```js
{
  email: "admin@homecoffee.vn",
  role: "owner",
  shopId: "home-coffee"
}
```

Luồng đăng nhập:

1. Tạo tài khoản admin trong Firebase Authentication.
2. Lấy UID của tài khoản.
3. Tạo document `admins/{uid}` trong Firestore.
4. Admin đăng nhập tại `/admin/login`.

<br />

## 🔒 Firestore Security Rules

Gợi ý nguyên tắc bảo mật:

* Khách chỉ đọc được dữ liệu khi shop `isPublished = true`.
* Admin hoặc owner mới được tạo, sửa, xóa dữ liệu.
* Không cho client tự tạo admin.
* Không cho user lạ tự tạo shop.
* Bản tin ẩn không nên cho public đọc.
* Món tạm tắt không nên cho public đọc.
* Reservation có thể tắt nếu quán không dùng đặt bàn.

<br />

## ☁️ Cloudinary Upload

Project dùng Cloudinary để upload ảnh / video từ admin.

Cấu hình cần có:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_CLOUDINARY_FOLDER=home-coffee
```

Upload preset trên Cloudinary cần để dạng:

```txt
Signing mode: Unsigned
```

Không đưa `API Secret` của Cloudinary vào frontend.

<br />

## 🚀 Deploy Vercel

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Initial Home Coffee project"
git push -u origin main
```

### 2. Import project vào Vercel

* Vào Vercel.
* Chọn **Add New Project**.
* Import repo `Home-Coffee`.
* Framework Preset: **Vite**.
* Build Command:

```bash
npm run build
```

* Output Directory:

```txt
dist
```

### 3. Thêm Environment Variables trên Vercel

Thêm toàn bộ biến trong `.env.local` vào phần:

```txt
Project Settings → Environment Variables
```

### 4. SPA fallback

Dự án có file `vercel.json` để khi refresh các route con như `/admin/dashboard`, `/home-coffee/blog` không bị lỗi 404.

Ví dụ:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

<br />

## ✅ Checklist trước khi deploy

* [ ] Đã tạo Firebase project.
* [ ] Đã bật Firebase Authentication.
* [ ] Đã tạo Firestore Database.
* [ ] Đã tạo document `shops/home-coffee`.
* [ ] Đã tạo document `admins/{uid}`.
* [ ] Đã cấu hình Firestore Rules.
* [ ] Đã tạo Cloudinary unsigned upload preset.
* [ ] Đã thêm `.env.local` ở local.
* [ ] Đã thêm env trên Vercel.
* [ ] Đã đảm bảo `.env.local` không bị commit lên GitHub.
* [ ] Đã kiểm tra `public/logohome.png` tồn tại.
* [ ] Đã chạy `npm run build` trước khi deploy.

<br />

## 🧭 Roadmap

* [x] Public menu cho khách hàng.
* [x] Admin login.
* [x] Quản lý danh mục.
* [x] Quản lý món.
* [x] Quản lý topping chung.
* [x] Quản lý khuyến mãi.
* [x] Quản lý bản tin.
* [x] Upload ảnh / video qua Cloudinary.
* [x] Cài đặt thông tin quán.
* [x] Responsive mobile / tablet / desktop.
* [ ] QR Code tự động cho menu.
* [ ] Thống kê lượt xem menu.
* [ ] Tùy chỉnh theme màu trong admin.
* [ ] Phân quyền nhiều admin.
* [ ] Multi-shop hoàn chỉnh.
* [ ] Đặt món online.
* [ ] Xuất menu dạng PDF.

<br />

## 👨‍💻 Tác giả

**khoale-dev-code**

* GitHub: [github.com/khoale-dev-code](https://github.com/khoale-dev-code)
* Repository: [Home-Coffee](https://github.com/khoale-dev-code/Home-Coffee)

<br />

---

<div align="center">

<strong>Home Coffee Menu</strong> — simple, clean and practical online menu for a real coffee shop.

<br />

Built with ❤️ using React, Firebase, Cloudinary and Vercel.

</div>
