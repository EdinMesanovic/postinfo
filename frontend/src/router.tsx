import { createBrowserRouter } from "react-router-dom";
import App from "./App"; // ⬅️ glavni layout sa <Outlet/>
import ProtectedRoute from "./components/guards/ProtectedRoute";
import RoleRoute from "./components/guards/RoleRoute";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Shipments from "./pages/Shipments/Shipments";
import NewShipment from "./pages/NewShipment/NewShipment";
import PrintLabel from "./pages/PrintLabel/PrintLabel";
import ScanPickup from "./pages/ScanPickup/ScanPickup";
import ScanSlug from "./pages/ScanSlug/ScanSlug";
import Login from "./pages/Login/Login";

export const router = createBrowserRouter([
  // Public (login izvan layouta)
  { path: "/login", element: <Login /> },

  // Auto pickup — traži login i ulogu
  {
    path: "/scan/:slug",
    element: (
      <ProtectedRoute>
        <RoleRoute allow={["DRIVER", "ADMIN"]}>
          <ScanSlug />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },

  // Root layout (App) + zaštićene child rute
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      // ADMIN
      {
        index: true,
        element: (
          <RoleRoute allow={["ADMIN"]}>
            <Dashboard />
          </RoleRoute>
        ),
      },
      {
        path: "shipments",
        element: (
          <RoleRoute allow={["ADMIN"]}>
            <Shipments />
          </RoleRoute>
        ),
      },
      {
        path: "new-shipment",
        element: (
          <RoleRoute allow={["ADMIN"]}>
            <NewShipment />
          </RoleRoute>
        ),
      },
      {
        path: "print/:id",
        element: (
          <RoleRoute allow={["ADMIN"]}>
            <PrintLabel />
          </RoleRoute>
        ),
      },

      // DRIVER (+ ADMIN)
      {
        path: "scan",
        element: (
          <RoleRoute allow={["DRIVER", "ADMIN"]}>
            <ScanPickup />
          </RoleRoute>
        ),
      },
    ],
  },
]);
