# AI WhatsApp Scheduler

A production ready WhatsApp AI appointment scheduling system built with n8n, Supabase, and a conversational AI model. It integrates with your existing dashboard for operational visibility and management.

## English

### Overview
This system automates client registration, appointment slot generation, availability management, and booking confirmation through natural language conversations on WhatsApp. Incoming messages arrive via an Evolution API webhook and trigger an event driven workflow in n8n.

### Event Flow
1. Receive webhook message
2. Validate message and ignore group or self messages
3. Identify client by phone number
4. Register client if missing
5. Classify intent with AI
6. Extract date and time when relevant
7. Check slot availability in the database
8. Reserve slot with conflict protection
9. Send confirmation back to the client

### Architecture
Workflow Orchestration
1. n8n self hosted
2. Webhook based processing
3. Conditional routing using Switch and IF nodes
4. AI classification node for intent parsing

Database Layer
1. Supabase PostgreSQL
2. Tables: clients, agenda_slots
3. Unique constraints prevent duplicate clients and duplicate slots

Slot Engine
1. Weekly slot generation via scheduled workflow
2. Working days Monday to Friday
3. Business hours 08:00 to 12:00 and 14:00 to 18:00
4. Lunch break excluded

### AI Layer
The model returns structured JSON for deterministic routing. It handles intent classification, date normalization, and time normalization, accepting natural language input such as 2pm meaning 14:00.

Supported intents
1. greeting
2. request_available_slots
3. schedule_appointment
4. cancel_appointment
5. reschedule_appointment
6. other

### Data Integrity
The system relies on database constraints to keep operations safe under concurrency.

Examples
1. Unique client phone number
2. Unique date and start_time for slots
3. Protected inserts or UPSERT for conflict handling

### Design Goals
1. Fully automated booking
2. Natural language interaction
3. Scalable architecture
4. Database level integrity
5. Clean separation of concerns
6. Production ready reliability

### Future Improvements
1. Multi location support
2. Multi employee scheduling
3. Google Calendar integration
4. Admin dashboard enhancements
5. Slot auto expiration
6. Payment integration
7. Multi language support

### Tech Stack
1. n8n workflow automation
2. Supabase PostgreSQL
3. WhatsApp API via Evolution API
4. OpenAI or LLM for intent recognition
5. Node.js runtime

## Portugues

### Visao Geral
Este sistema automatiza o cadastro de clientes, a geracao de horarios, a gestao de disponibilidade e a confirmacao de agendamentos por conversas naturais no WhatsApp. As mensagens entram por webhook da Evolution API e disparam um fluxo orientado a eventos no n8n.

### Fluxo de Eventos
1. Receber mensagem do webhook
2. Validar mensagem e ignorar grupos ou mensagens do proprio numero
3. Identificar cliente pelo telefone
4. Registrar cliente se necessario
5. Classificar intencao com IA
6. Extrair data e horario quando aplicavel
7. Verificar disponibilidade no banco
8. Reservar horario com protecao de conflito
9. Enviar confirmacao ao cliente

### Arquitetura
Orquestracao de Fluxo
1. n8n auto hospedado
2. Processamento via webhook
3. Roteamento condicional com Switch e IF
4. No de classificacao de IA para interpretar intencoes

Camada de Banco
1. Supabase PostgreSQL
2. Tabelas: clients, agenda_slots
3. Restricoes unicas evitam duplicidade de clientes e de horarios

Motor de Horarios
1. Geracao semanal por fluxo agendado
2. Dias uteis de segunda a sexta
3. Horarios 08:00 a 12:00 e 14:00 a 18:00
4. Intervalo de almoco excluido

### Camada de IA
O modelo retorna JSON estruturado para roteamento deterministico. Ele cuida da classificacao de intencao, normalizacao de datas e normalizacao de horarios, aceitando linguagem natural como 2pm para 14:00.

Intencoes suportadas
1. greeting
2. request_available_slots
3. schedule_appointment
4. cancel_appointment
5. reschedule_appointment
6. other

### Integridade de Dados
O sistema se apoia em restricoes do banco para manter seguranca em concorrencia.

Exemplos
1. Telefone do cliente unico
2. Data e horario inicial unicos para cada slot
3. Inserts protegidos ou UPSERT para conflitos

### Objetivos de Design
1. Agendamento totalmente automatizado
2. Interacao em linguagem natural
3. Arquitetura escalavel
4. Integridade no banco de dados
5. Separacao clara de responsabilidades
6. Confiabilidade de producao

### Melhorias Futuras
1. Suporte a multiplas unidades
2. Agenda para varios profissionais
3. Integracao com Google Calendar
4. Melhorias no dashboard administrativo
5. Expiracao automatica de slots
6. Integracao com pagamentos
7. Suporte a varios idiomas

### Stack Tecnologica
1. n8n automacao de fluxos
2. Supabase PostgreSQL
3. WhatsApp API via Evolution API
4. OpenAI ou LLM para reconhecimento de intencao
5. Ambiente Node.js
