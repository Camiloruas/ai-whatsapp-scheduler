import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookingDetails from './pages/BookingDetails';
import Clientes from './pages/Clientes';
import Configuracoes from './pages/Configuracoes';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login user={session?.user} />} />

        <Route element={<Layout user={session?.user} loading={loading} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agendamentos" element={<Dashboard />} />
          <Route path="/agendamento/:id" element={<BookingDetails />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
