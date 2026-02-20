# AI WhatsApp Scheduler

Production ready WhatsApp AI appointment scheduling system built with n8n, Supabase, and a conversational AI model. It integrates with your dashboard for visibility, monitoring, and operational control.

## English

### Overview
Event driven workflow that receives WhatsApp messages via Evolution API webhook, registers clients, checks availability, and confirms bookings with natural language.

### Flow Summary
1. Webhook message received
2. Validation ignores group and self messages
3. Client lookup and registration
4. AI intent classification and date time extraction
5. Availability check and slot reservation
6. Confirmation response

### Architecture
1. n8n self hosted workflow orchestration
2. Supabase PostgreSQL with tables clients and agenda_slots
3. Database constraints prevent duplicate clients and duplicate slots
4. Slot generation workflow for weekdays, 08:00 to 12:00 and 14:00 to 18:00

### AI Layer
Structured JSON output for deterministic routing, with intent classification, date normalization, and time normalization.

### Dashboard Integration
The dashboard is the operational view of the system, exposing client records, slot availability, and booking status so teams can monitor and manage the flow.

### Tech Stack
1. n8n
2. Supabase PostgreSQL
3. WhatsApp API via Evolution API
4. OpenAI or LLM for intent recognition
5. Node.js runtime

### Future Improvements
1. Multi location support
2. Multi employee scheduling
3. Google Calendar integration
4. Slot auto expiration
5. Payment integration
6. Multi language support

## Portugues

### Visao Geral
Fluxo orientado a eventos que recebe mensagens do WhatsApp via webhook da Evolution API, cadastra clientes, verifica disponibilidade e confirma agendamentos com linguagem natural.

### Resumo do Fluxo
1. Mensagem recebida pelo webhook
2. Validacao ignora grupos e mensagens do proprio numero
3. Busca e cadastro do cliente
4. Classificacao de intencao e extracao de data e horario
5. Checagem de disponibilidade e reserva do horario
6. Resposta de confirmacao

### Arquitetura
1. n8n auto hospedado para orquestracao
2. Supabase PostgreSQL com tabelas clients e agenda_slots
3. Restricoes no banco evitam duplicidade de clientes e horarios
4. Geracao de slots em dias uteis, 08:00 a 12:00 e 14:00 a 18:00

### Camada de IA
Saida em JSON estruturado para roteamento deterministico, com classificacao de intencao, normalizacao de datas e de horarios.

### Integracao com Dashboard
O dashboard e a visao operacional do sistema, mostrando clientes, disponibilidade de slots e status dos agendamentos para monitorar e gerenciar o fluxo.

### Stack Tecnologica
1. n8n
2. Supabase PostgreSQL
3. WhatsApp API via Evolution API
4. OpenAI ou LLM para reconhecimento de intencao
5. Ambiente Node.js

### Melhorias Futuras
1. Suporte a multiplas unidades
2. Agenda para varios profissionais
3. Integracao com Google Calendar
4. Expiracao automatica de slots
5. Integracao com pagamentos
6. Suporte a varios idiomas
