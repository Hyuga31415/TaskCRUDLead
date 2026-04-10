import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadDetail from './components/LeadDetail';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Khai báo ToastContainer ở đây */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <header style={{ backgroundColor: '#007bff', padding: '15px', color: 'white', textAlign: 'center' }}>
          <h1>Hệ thống Quản lý Khách hàng (CRM)</h1>
        </header>

        {/* Khai báo các đường dẫn (Routes) */}
        <Routes>
          {/* Chuyển hướng trang chủ về danh sách */}
          <Route path="/" element={<Navigate to="/leads" replace />} />
          
          {/* Trang danh sách */}
          <Route path="/leads" element={<LeadList />} />
          
          {/* Trang thêm mới */}
          <Route path="/leads/create" element={<LeadForm isEditMode={false} />} />
          
          {/* Trang chỉnh sửa (truyền ID qua URL) */}
          <Route path="/leads/edit/:id" element={<LeadForm isEditMode={true} />} />

          <Route path="/leads/view/:id" element={<LeadDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;