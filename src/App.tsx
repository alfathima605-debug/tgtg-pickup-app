import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { CustomerPage } from './pages/CustomerPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/order/:id" element={<CustomerPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
