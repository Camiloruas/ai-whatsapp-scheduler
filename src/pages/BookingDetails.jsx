import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, Phone, User, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('agenda_slots')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Lookup reservation details
                const { data: resData, error: resError } = await supabase
                    .from('agenda_reservas')
                    .select('*')
                    .eq('slot_id', id)
                    .maybeSingle();

                // Manual lookup for client details from 'clientes' table as fallback
                const phone = resData?.cliente_telefone || data.cliente_telefone;
                let clients = null;
                if (phone) {
                    const { data: clientData, error: clientError } = await supabase
                        .from('clientes')
                        .select('*')
                        .eq('telefone', phone)
                        .maybeSingle();

                    if (!clientError && clientData) {
                        clients = clientData;
                    }
                }

                // Merge into a single display object
                const finalBooking = {
                    ...data,
                    reserva: resData,
                    clientes: clients,
                    display_name: resData?.nome_cliente || data.nome_cliente || clients?.nome || 'Não informado',
                    display_phone: resData?.cliente_telefone || data.cliente_telefone || clients?.telefone || '—'
                };

                setBooking(finalBooking);
            } catch (error) {
                console.error('Error fetching booking details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Carregando detalhes...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="error-screen">
                <AlertTriangle size={48} color="var(--danger)" />
                <h2>Agendamento não encontrado</h2>
                <button onClick={() => navigate(-1)} className="back-btn">
                    Voltar para Lista
                </button>
            </div>
        );
    }

    const formatDateFull = (dateString) => {
        if (!dateString) return 'Não informada';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('pt-BR', { dateStyle: 'full' });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMADO': return <CheckCircle size={24} color="var(--success)" />;
            case 'CANCELADO': return <XCircle size={24} color="var(--danger)" />;
            default: return <Info size={24} color="var(--primary)" />;
        }
    };

    return (
        <div className="details-page fade-in">
            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={18} />
                <span>Voltar para Lista</span>
            </button>

            <header className="details-header">
                <div className="header-title">
                    <h1>Detalhes do Agendamento</h1>
                    <div className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                    </div>
                </div>
            </header>

            <div className="details-grid">
                {/* Slot Info */}
                <div className="details-card card">
                    <h3><Calendar size={20} /> Informações do Horário</h3>
                    <div className="info-group">
                        <div className="info-item">
                            <label>Data</label>
                            <p>{formatDateFull(booking.data)}</p>
                        </div>
                        <div className="info-item">
                            <label>Horário</label>
                            <p>{booking.hora_inicio.slice(0, 5)} - {booking.hora_fim.slice(0, 5)}</p>
                        </div>
                        <div className="info-item">
                            <label>Criado em</label>
                            <p>{new Date(booking.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="details-card card">
                    <h3><User size={20} /> Informações do Cliente</h3>
                    {(booking.clientes || booking.reserva || booking.nome_cliente || booking.cliente_telefone) ? (
                        <div className="info-group">
                            <div className="info-item">
                                <label>Nome</label>
                                <p>{booking.display_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Telefone</label>
                                <p>{booking.display_phone}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-info">
                            <p>Nenhum dado de cliente disponível para este agendamento.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default BookingDetails;
