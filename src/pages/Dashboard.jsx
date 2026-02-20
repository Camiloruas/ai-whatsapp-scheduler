import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [clientNames, setClientNames] = useState({});
    const [reservations, setReservations] = useState({});
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const pageSize = 10;

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('agenda_slots')
                .select('*', { count: 'exact' });

            if (statusFilter !== 'ALL') {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                // Search by phone or name in the slots table
                query = query.or(`cliente_telefone.ilike.%${searchTerm}%,nome_cliente.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order('data', { ascending: true })
                .order('hora_inicio', { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            const slotsData = data || [];

            // 1. Fetch relevant reservations from agenda_reservas
            const slotIds = slotsData.map(b => b.id);
            let resMap = {};
            let currentReservations = [];
            if (slotIds.length > 0) {
                const { data: resData, error: resError } = await supabase
                    .from('agenda_reservas')
                    .select('slot_id, nome_cliente, cliente_telefone')
                    .in('slot_id', slotIds);

                if (!resError && resData) {
                    currentReservations = resData;
                    resData.forEach(r => {
                        resMap[r.slot_id] = r;
                    });
                }
            }

            // 2. Fetch client names from 'clientes' table as fallback
            const phones = [...new Set(slotsData.map(b => b.cliente_telefone).filter(p => p))];

            // Also include phones from newly fetched reservations
            const resPhones = [...new Set(currentReservations.map(r => r.cliente_telefone).filter(p => p))];
            const allPhones = [...new Set([...phones, ...resPhones])];

            let namesMap = {};
            if (allPhones.length > 0) {
                const { data: clientsData, error: clientsError } = await supabase
                    .from('clientes')
                    .select('nome, telefone')
                    .in('telefone', allPhones);

                if (!clientsError && clientsData) {
                    clientsData.forEach(c => {
                        namesMap[c.telefone] = c.nome;
                    });
                }
            }

            // 3. Merge everything into a final bookings array
            const finalBookings = slotsData.map(slot => ({
                ...slot,
                // Prioritize reservation data
                display_name: resMap[slot.id]?.nome_cliente ||
                    slot.nome_cliente ||
                    namesMap[resMap[slot.id]?.cliente_telefone] ||
                    namesMap[slot.cliente_telefone] ||
                    '—',
                display_phone: resMap[slot.id]?.cliente_telefone ||
                    slot.cliente_telefone ||
                    '—'
            }));

            setBookings(finalBookings);
            setClientNames(namesMap);
            setReservations(resMap);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter, page, searchTerm]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'agenda_slots' }, () => {
                fetchBookings();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'DISPONIVEL': return 'status-available';
            case 'RESERVADO': return 'status-reserved';
            case 'CONFIRMADO': return 'status-confirmed';
            case 'CANCELADO': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="dashboard-page fade-in">
            <header className="page-header">
                <div>
                    <h1>Agendamentos</h1>
                    <p>Gerencie as reservas e horários do sistema</p>
                </div>
                <button onClick={fetchBookings} className="refresh-btn" title="Atualizar">
                    <RefreshCw size={20} className={loading ? 'spinning' : ''} />
                </button>
            </header>

            <section className="filters-bar card">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={18} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">Todos os Horários</option>
                        <option value="DISPONIVEL">Apenas Disponíveis</option>
                        <option value="RESERVADO">Apenas Reservados</option>
                        <option value="CONFIRMADO">Confirmados</option>
                        <option value="CANCELADO">Cancelados</option>
                    </select>
                </div>
            </section>

            <div className="table-container">
                {loading && bookings.length === 0 ? (
                    <div className="table-loading">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Horário</th>
                                <th>Status</th>
                                <th>Telefone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="table-row clickable"
                                    onClick={() => navigate(`/agendamento/${booking.id}`)}
                                >
                                    <td>
                                        <div className="client-cell">
                                            <User size={16} />
                                            <span>{booking.display_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <CalendarIcon size={16} />
                                            <span>{formatDate(booking.data)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <Clock size={16} />
                                            <span>{booking.hora_inicio.slice(0, 5)} - {booking.hora_fim.slice(0, 5)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>{booking.display_phone}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty-state">Nenhum agendamento encontrado</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <footer className="pagination-bar">
                <p>Mostrando {bookings.length} registros</p>
                <div className="pagination-controls">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-btn"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="page-indicator">Página {page}</span>
                    <button
                        disabled={bookings.length < pageSize}
                        onClick={() => setPage(p => p + 1)}
                        className="p-btn"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </footer>

        </div>
    );
};

export default Dashboard;
