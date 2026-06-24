import { Navigate, createBrowserRouter } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";

import DashboardPage from "../pages/admin/DashboardPage";
import LoginPage from "../pages/admin/LoginPage";
import MenuItemsPage from "../pages/admin/MenuItemsPage";
import PostsPage from "../pages/admin/PostsPage";
import PromotionsPage from "../pages/admin/PromotionsPage";
import ReservationsPage from "../pages/admin/ReservationsPage";
import SettingsPage from "../pages/admin/SettingsPage";
import ToppingsPage from "../pages/admin/ToppingsPage";

import BlogPage from "../pages/public/BlogPage";
import MenuPage from "../pages/public/MenuPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin/login" replace />,
  },
  {
    path: "/admin/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "menu",
        element: <MenuItemsPage />,
      },
      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      {
        path: "posts",
        element: <PostsPage />,
      },
      {
        path: "reservations",
        element: <ReservationsPage />,
      },
      {
        path: "toppings",
        element: <ToppingsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/:shopSlug",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <MenuPage />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
    ],
  },
]);
