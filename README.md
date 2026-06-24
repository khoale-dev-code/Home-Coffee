<div align="center">

<img src="public/logohome.png" alt="Home Coffee Logo" width="130" />

# Home Coffee Menu

### Website menu online dành riêng cho quán **Home Coffee**

Khách hàng quét QR hoặc bấm link là xem menu ngay. Admin có thể quản lý toàn bộ nội dung như món, danh mục, topping, khuyến mãi, bản tin, hình ảnh và thông tin quán trực tiếp trên dashboard.

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Cloudinary-Media%20Upload-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Domain-Hostinger-673DE6?style=for-the-badge" alt="Hostinger" />
</p>

<p>
  <strong>Repository:</strong>
  <a href="https://github.com/khoale-dev-code/Home-Coffee">github.com/khoale-dev-code/Home-Coffee</a>
</p>

<p>
  <strong>Production Domain:</strong>
  <a href="https://homecoffee.shop">homecoffee.shop</a>
</p>

<p>
  <strong>Vercel URL:</strong>
  <a href="https://home-coffee-zeta.vercel.app">home-coffee-zeta.vercel.app</a>
</p>

[Tổng quan](#-tổng-quan) •
[Tính năng](#-tính-năng-chính) •
[Công nghệ](#️-công-nghệ-sử-dụng) •
[Cài đặt](#-cài-đặt-dự-án) •
[Firebase](#-firebase-setup) •
[Cloudinary](#️-cloudinary-setup) •
[Vercel](#-deploy-vercel) •
[Hostinger](#-domain-hostinger--dns)

</div>

<br />

## 📌 Tổng quan

**Home Coffee Menu** là website menu online dành cho quán cafe **Home Coffee**. Hệ thống giúp khách hàng xem menu nhanh qua QR Code hoặc đường link trực tiếp, đồng thời giúp chủ quán quản lý toàn bộ nội dung bằng một trang admin riêng.

Dự án được thiết kế theo hướng thực tế cho quán cafe nhỏ:

* Khách hàng không cần đăng nhập.
* Khách mở link hoặc quét QR là xem menu.
* Admin đăng nhập để quản lý dữ liệu.
* Dữ liệu được lưu trên Firebase Firestore.
* Hình ảnh và video được upload lên Cloudinary.
* Website được deploy bằng Vercel.
* Domain được mua và quản lý DNS tại Hostinger.
* Giao diện tối ưu cho mobile, tablet và desktop.

Dự án hiện ưu tiên cho mô hình **một quán cafe duy nhất** là **Home Coffee**, nhưng cấu trúc dữ liệu vẫn có thể mở rộng thành multi-shop trong tương lai.

<br />

## 🚀 Tính năng chính

<table>
<tr>
<th width="50%">👤 Trang khách hàng</th>
<th width="50%">🛠️ Trang quản trị Admin</th>
</tr>

<tr valign="top">
<td>

### Public Menu

* Xem menu theo danh mục.
* Tìm kiếm món nhanh.
* Lọc món theo category.
* Xem món nổi bật.
* Xem chi tiết món trong modal.
* Bấm vào ảnh để xem lớn.
* Hiển thị trạng thái còn bán / tạm hết.
* Hỗ trợ nhiều size và nhiều mức giá.
* Hiển thị topping chung của quán.
* Xem khuyến mãi bằng ảnh hoặc video.
* Xem bản tin / bài viết của quán.
* Truy cập Facebook cửa hàng.
* Responsive tốt trên điện thoại.

</td>

<td>

### Admin Dashboard

* Đăng nhập bằng Firebase Authentication.
* Xem dashboard tổng quan.
* Quản lý danh mục món.
* Quản lý sản phẩm / đồ uống.
* Tạo nhanh danh mục khi thêm món.
* Upload ảnh sản phẩm.
* Nhập ảnh bằng URL.
* Quản lý size và giá theo VNĐ.
* Bật / tắt món còn bán.
* Đánh dấu món nổi bật.
* Quản lý topping chung.
* Quản lý khuyến mãi.
* Quản lý bản tin / blog.
* Upload ảnh / video bài viết.
* Ghim bài, ẩn / hiện bài viết.
* Cài đặt logo, ảnh bìa, Facebook và trạng thái public.

</td>
</tr>
</table>

<br />

## 🧩 Module chính

### 1. Public Menu

Route public dùng để khách xem menu:

```txt
/:shopSlug
```

Ví dụ:

```txt
/home-coffee
```

Hoặc khi đã cấu hình redirect trang chủ:

```txt
https://homecoffee.shop
```

Chức năng:

* Header thương hiệu.
* Hero giới thiệu quán.
* Danh mục sản phẩm.
* Danh sách món.
* Modal chi tiết món.
* Topping chung.
* Khuyến mãi.
* Bản tin mới.
* Footer Facebook.

<br />

### 2. Admin Login

```txt
/admin/login
```

Admin đăng nhập bằng Firebase Authentication. Sau khi đăng nhập thành công, hệ thống kiểm tra document trong collection `admins`.

<br />

### 3. Dashboard

```txt
/admin/dashboard
```

Hiển thị tổng quan:

* Tổng số danh mục.
* Tổng số món.
* Tổng số món đang bán.
* Tổng số món nổi bật.
* Tổng số khuyến mãi.
* Tổng số bài viết.

<br />

### 4. Quản lý menu

```txt
/admin/menu
```

Chức năng:

* Thêm / sửa / xóa danh mục.
* Ẩn / hiện danh mục.
* Thêm / sửa / xóa sản phẩm.
* Upload ảnh sản phẩm lên Cloudinary.
* Thêm ảnh bằng URL.
* Nhập giá dạng VNĐ.
* Quản lý size như S / M / L hoặc 500ml / 700ml.
* Tạo nhanh category trong form thêm món.
* Bật / tắt trạng thái còn bán.
* Đánh dấu best seller / nổi bật.

<br />

### 5. Quản lý topping

```txt
/admin/toppings
```

Topping được thiết kế dạng **danh sách chung của quán**, phù hợp với menu chỉ để khách xem, chưa đặt hàng online.

Ví dụ dữ liệu topping:

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

Topping được lưu trực tiếp trong document:

```txt
shops/home-coffee
```

Field:

```txt
toppings[]
```

<br />

### 6. Quản lý khuyến mãi

```txt
/admin/promotions
```

Chức năng:

* Thêm khuyến mãi.
* Upload nhiều ảnh / video.
* Dán link media.
* Bật / tắt hiển thị.
* Sắp xếp thứ tự.
* Hiển thị khuyến mãi ngoài trang khách.

<br />

### 7. Quản lý bản tin

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
* Hỗ trợ trang blog public.

Public blog route:

```txt
/:shopSlug/blog
```

Ví dụ:

```txt
/home-coffee/blog
```

<br />

### 8. Cài đặt quán

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
* Preview nhanh thông tin hiển thị ngoài trang khách.

<br />

## 🛠️ Công nghệ sử dụng

| Nhóm             | Công nghệ               |
| ---------------- | ----------------------- |
| Frontend         | React 19                |
| Build Tool       | Vite                    |
| Styling          | Tailwind CSS v4         |
| Routing          | React Router            |
| Icons            | Lucide React            |
| Authentication   | Firebase Authentication |
| Database         | Cloud Firestore         |
| Media Upload     | Cloudinary              |
| Hosting / Deploy | Vercel                  |
| Domain Provider  | Hostinger               |
| Package Manager  | npm                     |

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
│           ├── MenuStates.jsx
│           ├── MenuToolbar.jsx
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

| Route               | Mô tả                             |
| ------------------- | --------------------------------- |
| `/`                 | Có thể redirect về `/home-coffee` |
| `/admin/login`      | Đăng nhập admin                   |
| `/admin/dashboard`  | Dashboard tổng quan               |
| `/admin/menu`       | Quản lý danh mục và món           |
| `/admin/toppings`   | Quản lý topping chung             |
| `/admin/promotions` | Quản lý khuyến mãi                |
| `/admin/posts`      | Quản lý bản tin / blog            |
| `/admin/settings`   | Cài đặt thông tin quán            |
| `/:shopSlug`        | Trang menu công khai              |
| `/:shopSlug/blog`   | Trang blog công khai              |

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

Lưu ý:

```txt
Không commit .env.local lên GitHub.
```

File `.gitignore` nên có:

```gitignore
node_modules
dist
.env
.env.local
.env.*.local
.DS_Store
source-code.txt
```

### 4. Chạy local

```bash
npm run dev
```

Mặc định Vite chạy tại:

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

## 🔥 Firebase Setup

### 1. Firebase Authentication

Bật phương thức đăng nhập bằng Email/Password:

```txt
Firebase Console → Authentication → Sign-in method → Email/Password
```

### 2. Firestore Database

Tạo Firestore Database và dùng cấu trúc:

```txt
shops/home-coffee
admins/{uid}
```

Ví dụ document shop:

```js
{
  name: "Home Coffee",
  slug: "home-coffee",
  description: "Home Coffee - không gian cà phê ấm cúng, menu đồ uống đa dạng.",
  facebookUrl: "https://www.facebook.com/profile.php?id=100089933292350",
  logoUrl: "/logohome.png",
  coverUrl: "",
  isPublished: true,
  theme: "light",
  ownerUid: "UID_TAI_KHOAN_ADMIN",
  toppings: []
}
```

Ví dụ document admin:

```js
{
  email: "admin@homecoffee.vn",
  role: "owner",
  shopId: "home-coffee"
}
```

### 3. Authorized Domains

Khi dùng domain thật, thêm domain vào Firebase Auth:

```txt
Firebase Console → Authentication → Settings → Authorized domains
```

Thêm:

```txt
homecoffee.shop
www.homecoffee.shop
```

Nếu không thêm, admin login trên domain mới có thể bị lỗi Firebase Auth.

<br />

## 🔒 Firestore Security Rules

Nguyên tắc bảo mật:

* Khách chỉ đọc được dữ liệu khi shop `isPublished = true`.
* Admin hoặc owner mới được tạo, sửa, xóa dữ liệu.
* Không cho client tự tạo admin.
* Không cho user lạ tự tạo shop.
* Bản tin ẩn không cho public đọc.
* Món tạm tắt không cho public đọc.
* Topping nằm trong document `shops/{shopId}`, không cần subcollection riêng.

<br />

## ☁️ Cloudinary Setup

Project dùng Cloudinary để upload ảnh / video từ admin.

Cần tạo unsigned upload preset trong Cloudinary:

```txt
Settings → Upload → Upload presets
```

Cấu hình gợi ý:

```txt
Signing mode: Unsigned
Folder: home-coffee
```

Biến môi trường:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_CLOUDINARY_FOLDER=home-coffee
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

Repository:

```txt
https://github.com/khoale-dev-code/Home-Coffee
```

### 2. Import project vào Vercel

Vào Vercel:

```txt
Add New Project → Import Git Repository → Home-Coffee
```

Cấu hình:

| Mục              | Giá trị         |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### 3. Thêm Environment Variables

Trong Vercel:

```txt
Project Settings → Environment Variables
```

Thêm đầy đủ các biến từ `.env.local`.

### 4. SPA fallback

Dự án nên có file `vercel.json` để refresh route con không bị lỗi 404:

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

## 🌐 Domain Hostinger & DNS

Domain production:

```txt
homecoffee.shop
www.homecoffee.shop
```

Domain được mua tại Hostinger và trỏ về project Vercel.

### 1. Nameserver Hostinger

Domain đang dùng nameserver của Hostinger:

```txt
aurora.dns-parking.com
nebula.dns-parking.com
```

Nếu đang quản lý DNS trong Hostinger, giữ nguyên nameserver này.

### 2. Add domain trong Vercel

Trong Vercel:

```txt
Project → Settings → Domains
```

Thêm:

```txt
homecoffee.shop
www.homecoffee.shop
```

Vercel sẽ đưa ra DNS record cần cấu hình.

### 3. DNS Records tại Hostinger

Trong Hostinger:

```txt
Domains → homecoffee.shop → DNS / DNS Records
```

Cấu hình các record chính:

| Type  | Name  | Value                                 | Mục đích                 |
| ----- | ----- | ------------------------------------- | ------------------------ |
| A     | `@`   | `216.198.79.1`                        | Trỏ domain gốc về Vercel |
| CNAME | `www` | `06676c1fb5a7b96d.vercel-dns-017.com` | Trỏ www về Vercel        |

Các record email của Hostinger như `MX`, `TXT`, `_domainkey`, `autodiscover`, `autoconfig` nên giữ nguyên nếu dùng email theo domain.

### 4. Tránh record xung đột

Không nên có các record trùng sau:

```txt
A      @      IP khác
AAAA   @      bất kỳ
A      www    IP bất kỳ
CNAME  www    giá trị khác
```

### 5. Kiểm tra DNS bằng PowerShell

Kiểm tra trực tiếp nameserver Hostinger:

```powershell
nslookup -type=NS homecoffee.shop aurora.dns-parking.com
```

```powershell
nslookup -type=A homecoffee.shop aurora.dns-parking.com
```

```powershell
nslookup -type=CNAME www.homecoffee.shop aurora.dns-parking.com
```

Kết quả đúng:

```txt
homecoffee.shop nameserver = aurora.dns-parking.com
homecoffee.shop nameserver = nebula.dns-parking.com
homecoffee.shop A = 216.198.79.1
www.homecoffee.shop CNAME = 06676c1fb5a7b96d.vercel-dns-017.com
```

Kiểm tra DNS public:

```powershell
nslookup -type=NS homecoffee.shop 1.1.1.1
```

```powershell
nslookup -type=A homecoffee.shop 1.1.1.1
```

```powershell
nslookup -type=CNAME www.homecoffee.shop 1.1.1.1
```

Nếu DNS public vẫn báo `Non-existent domain` nhưng query trực tiếp `aurora.dns-parking.com` ra đúng, nghĩa là DNS Hostinger đã đúng nhưng domain chưa propagate ra public DNS. Khi đó chờ thêm vài giờ rồi kiểm tra lại.

### 6. Refresh domain trong Vercel

Sau khi DNS public ra đúng, quay lại:

```txt
Vercel → Project → Settings → Domains
```

Bấm:

```txt
Refresh
```

cho cả:

```txt
homecoffee.shop
www.homecoffee.shop
```

Khi cấu hình đúng, Vercel sẽ hiển thị:

```txt
Valid Configuration
```

<br />

## ✅ Checklist trước khi deploy production

* [ ] Đã push code lên GitHub repo `Home-Coffee`.
* [ ] Đã import project vào Vercel.
* [ ] Đã thêm biến môi trường trên Vercel.
* [ ] Đã tạo Firebase project.
* [ ] Đã bật Firebase Authentication.
* [ ] Đã tạo Firestore Database.
* [ ] Đã tạo document `shops/home-coffee`.
* [ ] Đã tạo document `admins/{uid}`.
* [ ] Đã thêm `homecoffee.shop` vào Firebase Authorized Domains.
* [ ] Đã thêm `www.homecoffee.shop` vào Firebase Authorized Domains.
* [ ] Đã tạo Cloudinary unsigned upload preset.
* [ ] Đã thêm domain `homecoffee.shop` vào Vercel.
* [ ] Đã thêm domain `www.homecoffee.shop` vào Vercel.
* [ ] Đã cấu hình DNS Hostinger.
* [ ] Đã chạy `npm run build` thành công.
* [ ] Đã kiểm tra login admin.
* [ ] Đã kiểm tra public menu trên mobile.

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
* [x] Deploy Vercel.
* [x] Kết nối domain Hostinger.
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

<strong>Home Coffee Menu</strong>

Simple, clean and practical online menu for a real coffee shop.

<br />

Built with ❤️ using React, Firebase, Cloudinary, Vercel and Hostinger.

</div>
