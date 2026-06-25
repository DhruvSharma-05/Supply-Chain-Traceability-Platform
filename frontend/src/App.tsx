import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StakeholdersPage from './pages/StakeholdersPage';
import CreateProductPage from './pages/CreateProductPage';
import ProductTrackingPage from './pages/ProductTrackingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="stakeholders" element={<StakeholdersPage />} />
          <Route path="create" element={<CreateProductPage />} />
          <Route path="tracking" element={<ProductTrackingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
