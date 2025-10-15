import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Shipments from './pages/Shipments/Shipments';
import NewShipment from './pages/NewShipment/NewShipment';
import PrintLabel from './pages/PrintLabel/PrintLabel';
import ScanPickup from './pages/ScanPickup/ScanPickup';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'shipments', element: <Shipments /> },
      { path: 'new-shipment', element: <NewShipment /> },
      { path: 'print/:id', element: <PrintLabel /> },
      { path: 'scan', element: <ScanPickup /> },
    ],
  },
]);
