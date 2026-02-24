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
    const pageSize = 50;

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let clientIdsFromSearch = null;
            if (searchTerm) {
                const { data: searchClients, error: searchClientsError } = await supabase
                    .from('clients')
                    .select('id')
                    .or(`telefone.ilike.%${searchTerm}%,nome.ilike.%${searchTerm}%`);

                if (!searchClientsError) {
                    clientIdsFromSearch = (searchClients || []).map((c) => c.id);
                }
            }

            let query = supabase
                .from('agenda_slots')
                .select('*', { count: 'exact' });

            if (statusFilter !== 'ALL') {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                if (clientIdsFromSearch && clientIdsFromSearch.length > 0) {
                    query = query.in('client_id', clientIdsFromSearch);
                } else {
                    query = query.eq('id', '__no_match__');
                }
            }

            const { data, count, error } = await query
                .order('data', { ascending: true })
                .order('hora_inicio', { ascending: true })
                .range((page - 1) * pageSize, page * pageSize - 1);

            if (error) throw error;
            const slotsData = data || [];

            const clientIds = [...new Set(slotsData.map((b) => b.client_id).filter((id) => id))];
            let clientsMap = {};
            if (clientIds.length > 0) {
                const { data: clientsData, error: clientsError } = await supabase
                    .from('clients')
                    .select('id, nome, telefone')
                    .in('id', clientIds);

                if (!clientsError && clientsData) {
                    clientsData.forEach((c) => {
                        clientsMap[c.id] = c;
                    });
                }
            }

            const finalBookings = slotsData.map((slot) => ({
                ...slot,
                display_name: clientsMap[slot.client_id]?.nome || '—',
                display_phone: clientsMap[slot.client_id]?.telefone || '—'
            }));

            setBookings(finalBookings);
            setClientNames(clientsMap);
            setReservations({});
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
            case 'OCUPADO': return 'status-reserved';
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
                        <option value="OCUPADO">Apenas Ocupados</option>
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
