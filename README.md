# Proiect-TW-Echipa-5🚀🪂🪂🪂

## 1. Context si Obiectiv

* Tema: Aplicatie web pentru monitorizarea prezentei la evenimente.
* Scop: Organizatorii de evenimente (OE) pot crea grupuri de evenimente (unul sau recurente), pot deschide/inchide evenimentele si pot urmari cine este prezent, pe baza unui cod QR introdus de participanti.
* Arhitectura:
    * Frontend: React.
    * Backend: Node.js + Express, API REST.
    * Baza de date: Supabase.
    * API-uri Externe: Generare QR si pentru ora curenta/timezone.

---

## 2. Roluri in Sistem

### Organizator de Eveniment (OE)
* Creeaza grupuri de evenimente.
* Creeaza, editeaza si sterge evenimente.
* Deschide/inchide evenimentul (sau acesta se deschide automat la ora programata).
* Vizualizeaza lista participantilor prezenti si ora la care s-au inregistrat.
* Exporta prezenta in CSV / XLSX pentru:
    * un singur eveniment;
    * intregul grup de evenimente.

### Participant
* Acceseaza aplicatia din browser.
* Scaneaza codul QR sau introduce codul evenimentului.
* Introduce numele / emailul si confirma prezenta.

---

## 3. Fluxuri Principale

1. **OE: Autentificare**
    * Intra pe aplicatie, se autentifica.

2. **OE: Creare Grup de Evenimente**
    * Completeaza: nume grup, descriere, perioada.
    * Sistemul salveaza grupul in DB.

3. **OE: Definire Evenimente in Cadrul Grupului**
    * Alege grupul si:
        * adauga un singur eveniment (data, interval orar);
        * sau defineste un eveniment recurent.
    * La fiecare eveniment:
        * se genereaza cod unic (string random) si, prin librarie, un cod QR.

4. **Starea Evenimentelor**
    * Initial: CLOSED.
    * La ora de start: evenimentul devine OPEN.
    * La ora de final: din nou CLOSED.
    * OE poate forta manual OPEN/CLOSED din interfata.

5. **Participant: Confirmare Prezenta**
    * Scaneaza un QR sau introduce un cod text.
    * Deschide aplicatia:
        * scaneaza QR;
        * sau introduce codul text in input.
    * Daca evenimentul este OPEN, sistemul:
        * valideaza codul;
        * cere nume / e-mail;
        * creeaza un record de prezenta cu timestamp.

6. **OE: Monitorizare in Timp Real**
    * In dashboard, OE vede lista de participanti prezenti la eveniment:
        * nume, email, ora confirmarii, metoda (QR / text).

7. **OE: Export Prezenta CSV/XLSX**
    * Din ecranul unui eveniment sau grup:
        * buton „Export CSV” / „Export XLSX”.
    * Backend genereaza fisierul si il trimite spre download:
        * pentru un singur eveniment;
        * pentru toate evenimentele dintr-un grup (agregat).

---

## 4. Model de Date

### Tabele Principale

| Tabela | Coloana | Tip | Descriere |
| :--- | :--- | :--- | :--- |
| **users** | `id` | PK, UUID | Identificator unic |
| | `name` | TEXT | Nume |
| | `email` | UNIQUE | Email |
| | `password_hash` | TEXT | Hash parola |
| | `role` | ENUM | ORGANIZER, PARTICIPANT |
| | `created_at` | TIMESTAMP | Data creare |
| **event_groups** | `id` | PK | Identificator unic |
| | `name` | TEXT | Nume grup |
| | `description` | TEXT | Descriere |
| | `owner_id` | FK | Referinta users.id (Organizator) |
| | `created_at` | TIMESTAMP | Data creare |
| **events** | `id` | PK | Identificator unic |
| | `group_id` | FK | Referinta event_groups.id |
| | `title` | TEXT | Titlu eveniment |
| | `description` | TEXT | Descriere |
| | `start_time` | TIMESTAMP | Ora de inceput |
| | `end_time` | TIMESTAMP | Ora de final |
| | `status` | ENUM | OPEN, CLOSED (default CLOSED) |
| | `access_code` | TEXT, UNIQUE | Cod text unic de acces |
| | `qr_code_url` | TEXT | Link imagine QR |
| | `created_at` | TIMESTAMP | Data creare |
| **participants** | `id` | PK | Identificator unic |
| | `name` | TEXT | Nume participant |
| | `email` | TEXT, optional | Email participant |
| | `created_at` | TIMESTAMP | Data creare |
| **attendances** | `id` | PK | Identificator unic |
| | `event_id` | FK | Referinta events.id |
| | `participant_id` | FK | Referinta participants.id |
| | `joined_at` | TIMESTAMP | Ora confirmarii prezentei |
| | `method` | ENUM | QR, TEXT |

---

## 5. API REST

Backend Node.js (Express)

### Autentificare
* POST /api/auth/register – creare cont organizator.
* POST /api/auth/login – autentificare.

### Grupuri de Evenimente (Organizator)
* GET /api/event-groups – listeaza grupurile OE.
* POST /api/event-groups – creeaza un grup.
* GET /api/event-groups/:id – detalii grup + evenimente.
* PUT /api/event-groups/:id – actualizare.
* DELETE /api/event-groups/:id – stergere.

### Evenimente (Organizator)
* POST /api/event-groups/:groupId/events – creeaza eveniment (sau serie recurenta).
* GET /api/events/:id – detalii eveniment.
* PATCH /api/events/:id/status – schimbare OPEN/CLOSED.
* GET /api/events/:id/qr – returneaza link/imagine QR.
* GET /api/events/:id/attendance – lista participantilor.

### Participare / Prezenta (Participant)
* POST /api/attendance/check-in
    * Body: { code, name, email, method }.
    * Efect: Gaseste eveniment dupa access_code, verifica daca statusul este OPEN, creeaza participant si prezenta.

### Export (Organizator)
* GET /api/events/:id/export?format=csv|xlsx.
* GET /api/event-groups/:id/export?format=csv|xlsx.

---

## 6. Integrare Serviciu Extern
* Serviciu extern pentru ora curenta / timezone.
* Serviciu extern de generare QR.

---

## 7. Frontend (React)

### Pagini / Componente Principale
1. **Login / Register (OE)**.
2. **Dashboard Organizator:**
    * lista grupuri de evenimente;
    * buton „Adauga grup”.
3. **Detalii Grup:**
    * lista evenimente;
    * formular „Adauga eveniment (unic sau recurent)”.
4. **Detalii Eveniment:**
    * afisare cod text + QR;
    * butoane: OPEN / CLOSE;
    * tabel cu participantii prezenti (nume, email, ora);
    * butoane de export CSV/XLSX.
5. **Ecran Participant – Check-in:**
    * pagina cu input pentru cod;
    * componenta de scanare QR;
    * formular scurt (nume, email), buton „Confirma prezenta”.

---

## Planul Proiectului

Proiectul este impartit in 3 etape de livrare.

### Etapa 1: Specificatii si Setup
- X Definirea arhitecturii aplicatiei.
- X Crearea repository-ului Git si structura directoarelor.
- X Redactarea fisierului README.md cu specificatii detaliate.
- X Configurare initiala Supabase.

### Etapa 2: Backend RESTful
- Implementare server Node.js + Express.
- Definire schema.
- Implementare endpoint-uri CRUD pentru Events si Participare.
- Implementare logica de generare coduri acces.
- Integrare API-uri.

### Etapa 3: Aplicatia Finala & Frontend
- Implementare interfata React (Pagina de Login, Dashboard OE, Pagina Check-in).
- Integrare Frontend cu Backend.
- Implementare functie export CSV/XLSX.
- Implementare scanare QR (librarie frontend).
- Deployment final (Netlify + Backend Host).
- Demo functional.
