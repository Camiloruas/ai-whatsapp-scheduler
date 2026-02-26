import React, { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw, Building2, CalendarDays, MessageCircle, Bell } from 'lucide-react';

const STORAGE_KEY = 'app_settings';

const defaultSettings = {
  businessName: 'Agendamentos AI',
  businessEmail: '',
  businessPhone: '',
  address: '',
  timezone: 'America/Sao_Paulo',
  slotDuration: 30,
  bufferMinutes: 0,
  minAdvanceHours: 2,
  bookingWindowDays: 30,
  allowWeekends: true,
  whatsappNumber: '',
  whatsappAuto: true,
  confirmMessage: 'Olá, sua reserva foi confirmada!',
  reminderMessage: 'Lembrete: você tem um horário agendado em breve.',
  adminEmail: '',
  notifyNewBooking: true,
};

const Configuracoes = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  const timezones = useMemo(() => ([
    'America/Sao_Paulo',
    'America/Fortaleza',
    'America/Manaus',
    'America/Belem',
    'America/Recife',
  ]), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header">
        <div>
          <h1>Configurações</h1>
          <p>Personalize informações do negócio, agendamentos e mensagens</p>
        </div>
        <div className="settings-actions">
          <button onClick={handleReset} className="secondary-btn" title="Restaurar padrões">
            <RotateCcw size={18} />
            <span>Restaurar</span>
          </button>
          <button onClick={handleSave} className="primary-btn" title="Salvar configurações">
            <Save size={18} />
            <span>Salvar</span>
          </button>
        </div>
      </header>

      {saved && (
        <div className="save-toast">
          Configurações salvas com sucesso.
        </div>
      )}

      <section className="settings-grid">
        <div className="settings-card card">
          <h3><Building2 size={18} /> Informações do Negócio</h3>
          <div className="settings-form">
            <div className="field">
              <label>Nome do negócio</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Email principal</label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => updateField('businessEmail', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="field">
              <label>Telefone principal</label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => updateField('businessPhone', e.target.value)}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="field">
              <label>Endereço</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Rua Exemplo, 123"
              />
            </div>
            <div className="field">
              <label>Fuso horário</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <h3><CalendarDays size={18} /> Agendamentos</h3>
          <div className="settings-form">
            <div className="field">
              <label>Duração padrão (min)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={settings.slotDuration}
                onChange={(e) => updateField('slotDuration', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Intervalo entre atendimentos (min)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={settings.bufferMinutes}
                onChange={(e) => updateField('bufferMinutes', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Antecedência mínima (horas)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.minAdvanceHours}
                onChange={(e) => updateField('minAdvanceHours', Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Janela máxima de agendamento (dias)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.bookingWindowDays}
                onChange={(e) => updateField('bookingWindowDays', Number(e.target.value))}
              />
            </div>
            <div className="field toggle-field">
              <label>Permitir agendamentos aos fins de semana</label>
              <button
                type="button"
                className={`toggle-btn ${settings.allowWeekends ? 'on' : ''}`}
                onClick={() => updateField('allowWeekends', !settings.allowWeekends)}
              >
                <span />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <h3><MessageCircle size={18} /> WhatsApp e Mensagens</h3>
          <div className="settings-form">
            <div className="field">
              <label>Número WhatsApp padrão</label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => updateField('whatsappNumber', e.target.value)}
                placeholder="55 11 99999-0000"
              />
            </div>
            <div className="field toggle-field">
              <label>Enviar mensagens automáticas</label>
              <button
                type="button"
                className={`toggle-btn ${settings.whatsappAuto ? 'on' : ''}`}
                onClick={() => updateField('whatsappAuto', !settings.whatsappAuto)}
              >
                <span />
              </button>
            </div>
            <div className="field">
              <label>Mensagem de confirmação</label>
              <textarea
                rows="3"
                value={settings.confirmMessage}
                onChange={(e) => updateField('confirmMessage', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mensagem de lembrete</label>
              <textarea
                rows="3"
                value={settings.reminderMessage}
                onChange={(e) => updateField('reminderMessage', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="settings-card card">
          <h3><Bell size={18} /> Notificações</h3>
          <div className="settings-form">
            <div className="field">
              <label>Email do administrador</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => updateField('adminEmail', e.target.value)}
                placeholder="admin@empresa.com"
              />
            </div>
            <div className="field toggle-field">
              <label>Receber alerta de novos agendamentos</label>
              <button
                type="button"
                className={`toggle-btn ${settings.notifyNewBooking ? 'on' : ''}`}
                onClick={() => updateField('notifyNewBooking', !settings.notifyNewBooking)}
              >
                <span />
              </button>
            </div>
            <p className="settings-note">
              Essas configurações são salvas localmente no navegador.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Configuracoes;
