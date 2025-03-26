import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Inicio from './Pages/Inicio';
import Produtos from './Pages/Produtos';
import Carrinho from './Pages/Carrinho';
import AdminLogin from './Pages/AdminLogin';
import Admin from './Pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout currentPageName="Inicio"><Inicio /></Layout>} />
        <Route path="/Inicio" element={<Layout currentPageName="Inicio"><Inicio /></Layout>} />
        <Route path="/Produtos" element={<Layout currentPageName="Produtos"><Produtos /></Layout>} />
        <Route path="/Carrinho" element={<Layout currentPageName="Carrinho"><Carrinho /></Layout>} />
        <Route path="/AdminLogin" element={<Layout currentPageName="AdminLogin"><AdminLogin /></Layout>} />
        <Route path="/Admin" element={<Layout currentPageName="Admin"><Admin /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;