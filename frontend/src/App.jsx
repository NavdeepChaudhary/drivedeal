import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import NotFound from './pages/NotFound.jsx';

const CarDetail = lazy(() => import('./pages/CarDetail.jsx'));
const Sell = lazy(() => import('./pages/Sell.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Compare = lazy(() => import('./pages/Compare.jsx'));
const Emi = lazy(() => import('./pages/Emi.jsx'));
const AutoPrice = lazy(() => import('./pages/AutoPrice.jsx'));
const Static = lazy(() => import('./pages/Static.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Suspense fallback={<div className="min-h-[60vh] grid place-items-center text-black/40">Loading…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="browse" element={<Browse />} />
            <Route path="cars/:id" element={<CarDetail />} />
            <Route path="sell" element={<Sell />} />
            <Route path="login" element={<Auth mode="login" />} />
            <Route path="signup" element={<Auth mode="signup" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:carId/:buyerId" element={<Messages />} />
            <Route path="compare" element={<Compare />} />
            <Route path="emi" element={<Emi />} />
            <Route path="autoprice" element={<AutoPrice />} />
            <Route path="about" element={<Static page="about" />} />
            <Route path="contact" element={<Static page="contact" />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
