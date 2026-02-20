import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, User, Phone, RefreshCw } from 'lucide-react';

const Clientes = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchClients = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('clientes')
                .select('*')
                .order('nome', { ascending: true });

            if (searchTerm) {
                query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [searchTerm]);

    return (
        <div className="dashboard-page fade-in">
            <header className="page-header">
                <div>
                    <h1>Clientes</h1>
                    <p>Base de contatos e interessados</p>
                </div>
                <button onClick={fetchClients} className="refresh-btn" title="Atualizar">
                    <RefreshCw size={20} className={loading && clients.length === 0 ? 'spinning' : ''} />
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
            </section>

            <div className="table-container">
                {loading && clients.length === 0 ? (
                    <div className="table-loading">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length > 0 ? clients.map((client) => (
                                <tr key={client.id} className="table-row">
                                    <td>
                                        <div className="client-cell">
                                            <User size={16} />
                                            <span>{client.nome || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <Phone size={16} />
                                            <span>{client.telefone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn whatsapp-btn"
                                            title="Contato via WhatsApp"
                                            onClick={() => window.open(`https://wa.me/${client.telefone.replace(/\D/g, '')}`, '_blank')}
                                        >
                                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                                <path
                                                    fill="currentColor"
                                                    d="M12.04 2.01c-5.5 0-9.97 4.45-9.97 9.95 0 1.76.46 3.47 1.33 4.98L2 22l5.18-1.35a9.96 9.96 0 0 0 4.86 1.25h.01c5.5 0 9.97-4.45 9.97-9.95s-4.47-9.94-9.97-9.94zm5.82 14.27c-.25.7-1.46 1.35-2.01 1.43-.51.08-1.16.12-1.86-.11-.43-.14-.98-.32-1.68-.63-2.96-1.3-4.89-4.35-5.03-4.55-.14-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.17 1.03-2.46.27-.29.59-.36.78-.36h.56c.18 0 .42-.07.66.5.25.6.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.33-.29.51-.14.18-.3.4-.43.54-.14.14-.28.29-.12.57.16.28.72 1.19 1.54 1.93 1.06.94 1.95 1.23 2.23 1.37.28.14.45.12.62-.07.17-.2.71-.83.9-1.12.19-.29.38-.24.63-.14.25.1 1.59.75 1.86.89.27.14.45.2.51.31.07.11.07.66-.18 1.36z"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="empty-state">Nenhum cliente encontrado</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <footer className="pagination-bar">
                <p>Total de {clients.length} clientes cadastrados</p>
            </footer>
        </div>
    );
};

export default Clientes;
