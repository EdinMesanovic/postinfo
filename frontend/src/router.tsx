import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import RoleRoute from "./components/guards/RoleRoute";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Shipments from "./pages/Shipments/Shipments";
import NewShipment from "./pages/NewShipment/NewShipment";
import PrintLabel from "./pages/PrintLabel/PrintLabel";
import ScanPickup from "./pages/ScanPickup/ScanPickup";
import ScanSlug from "./pages/ScanSlug/ScanSlug"; // auto pickup iz URL-a
import Login from "./pages/Login/Login";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  // Auto pickup ruta – i dalje ćemo tražiti login (ako nema cookie, redirect na login pa nastavi)
  { path: "/scan/:slug", element: (
      <ProtectedRoute><RoleRoute allow={["DRIVER","ADMIN"]}><ScanSlug /></RoleRoute></ProtectedRoute>
    ) 
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // ADMIN sekcija
      { path: "", element: <RoleRoute allow={["ADMIN"]}><Dashboard /></RoleRoute> },
      { path: "shipments", element: <RoleRoute allow={["ADMIN"]}><Shipments /></RoleRoute> },
      { path: "new-shipment", element: <RoleRoute allow={["ADMIN"]}><NewShipment /></RoleRoute> },
      { path: "print/:id", element: <RoleRoute allow={["ADMIN"]}><PrintLabel /></RoleRoute> },

      // DRIVER sekcija
      { path: "scan", element: <RoleRoute allow={["DRIVER","ADMIN"]}><ScanPickup /></RoleRoute> },
    ],
  },
]);
