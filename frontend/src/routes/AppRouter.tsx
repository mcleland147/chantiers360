import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AdminPage } from "../pages/AdminPage";
import { ChantierDetailPage } from "../pages/ChantierDetailPage";
import { ChantierEditPage } from "../pages/ChantierEditPage";
import { ChantierFormPage } from "../pages/ChantierFormPage";
import { ChantiersListPage } from "../pages/ChantiersListPage";
import { DashboardConducteurPage } from "../pages/DashboardConducteurPage";
import { DashboardDirectionPage } from "../pages/DashboardDirectionPage";
import { LoginPage } from "../pages/LoginPage";
import { MobileChefPage } from "../pages/MobileChefPage";
import { PhotosPage } from "../pages/PhotosPage";
import { PlanningPage } from "../pages/PlanningPage";
import { ReportsPage } from "../pages/ReportsPage";
import { ReservesPage } from "../pages/ReservesPage";
import { GuestGuard } from "./GuestGuard";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { RootRedirect } from "./RootRedirect";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <RootRedirect /> },
              { path: "dashboard", element: <DashboardConducteurPage /> },
              {
                path: "dashboard/direction",
                element: <DashboardDirectionPage />,
              },
              { path: "chantiers", element: <ChantiersListPage /> },
              { path: "chantiers/nouveau", element: <ChantierFormPage /> },
              { path: "chantiers/:id/modifier", element: <ChantierEditPage /> },
              { path: "chantiers/:id", element: <ChantierDetailPage /> },
              { path: "reserves", element: <ReservesPage /> },
              { path: "photos", element: <PhotosPage /> },
              { path: "planning", element: <PlanningPage /> },
              { path: "mobile", element: <MobileChefPage /> },
              { path: "reports", element: <ReportsPage /> },
              { path: "admin", element: <AdminPage /> },
              {
                path: "projects",
                element: <Navigate to="/chantiers" replace />,
              },
              {
                path: "projects/:id",
                element: <Navigate to="/chantiers" replace />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
