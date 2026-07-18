require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
console.log("Cerco il modello in:", path.resolve('./models/User.js'));
// Percorsi corretti puntati alla cartella model e con la lettera maiuscola!

const User = require('./models/User'); 
const Session = require('./models/Session');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔥 Connesso a MongoDB Atlas per il seeding!');

        // 1. Pulizia delle collezioni per non avere duplicati
        // 1. Pulizia delle collezioni per non avere duplicati E DISTRUGGERE GLI INDICI VECCHI
        await User.deleteMany({});
        
        // Questo comando cancella l'intera collezione Session e le sue regole sbagliate
        try {
            await Session.collection.drop();
            console.log('🗑️ Collezione Session e vecchi indici distrutti!');
        } catch (e) {
            console.log('Nessuna collezione Session da distruggere, procedo...');
        }

        // 2. Creazione array di 5 Utenti (ORA CON NOME E COGNOME!)
        const usersData = [
            { username: 'Magnifico Rettore', email: 'rettore@poliba.it', password: 'password123', propic: '/public/propic/1.jpg', nome: 'Magnifico', cognome: 'Rettore' },
            { username: 'matteormn', email: 'matteo@mixtue.io', password: 'password123', propic: '/public/propic/2.jpg', nome: 'Matteo', cognome: 'Romano' },
            { username: 'daniele', email: 'daniele@mixtue.io', password: 'password123', propic: '/public/propic/3.jpg', nome: 'Daniele', cognome: 'Rossi' },
            { username: 'alice_dj', email: 'alice@mixtue.io', password: 'password123', propic: '/public/propic/4.jpg', nome: 'Alice', cognome: 'Verdi' },
            { username: 'arianna', email: 'arianna@mixtue.io', password: 'password123', propic: '/public/propic/5.jpg', nome: 'Arianna', cognome: 'Bianchi' }
        ];

        // Inserimento massivo nel DB
        const createdUsers = await User.insertMany(usersData);
        console.log('👤 5 Utenti creati!');

        // Estraiamo gli utenti appena creati (con i loro _id generati da MongoDB)
        const rettore = createdUsers[0];
        const matteo = createdUsers[1];
        const daniele = createdUsers[2];
        const alice = createdUsers[3];
        const arianna = createdUsers[4];

        // 3. Creazione array di 5 Sessioni
        const sessionsData = [
            {
                name: 'Inaugurazione Anno Accademico',
                ownerId: rettore._id,
                collaborators: [matteo._id],
                tracks: [{ name: 'Discorso Ufficiale', fileUrl: 'discorso.mp3', state: { volume: 0 } }]
            },
            {
                name: 'Mix Matteo',
                ownerId: matteo._id,
                collaborators: [daniele._id],
                tracks: [{ name: 'Giro di Basso', fileUrl: 'bass.mp3', state: { volume: 2 } }] // fileUrl richiesto!
            },
            {
                name: 'Mix Daniele',
                ownerId: daniele._id,
                collaborators: [rettore._id],
                tracks: [{ name: 'Basso Slap', fileUrl: 'bass.mp3', state: { volume: 5 } }] // fileUrl richiesto!
            },
            {
                name: 'Elettronica Chill',
                ownerId: alice._id,
                collaborators: [arianna._id],
                tracks: [{ name: 'Synth', fileUrl: 'synth.mp3', state: { volume: -2 } }]
            },
            {
                name: 'Rock Jam',
                ownerId: arianna._id,
                collaborators: [alice._id],
                tracks: [{ name: 'Batteria', fileUrl: 'drums.mp3', state: { volume: 0 } }]
            }
        ];

        // Inserimento massivo delle sessioni
        const createdSessions = await Session.insertMany(sessionsData);
        console.log('🎛️ 5 Sessioni create!');

        // 4. Aggiorniamo gli utenti assegnando l'ID della sessione creata alla loro array "activeSessions"
        rettore.activeSessions.push(createdSessions[0]._id);
        rettore.activeSessions.push(createdSessions[2]._id);
        matteo.activeSessions.push(createdSessions[1]._id);
        daniele.activeSessions.push(createdSessions[2]._id);
        alice.activeSessions.push(createdSessions[3]._id);
        arianna.activeSessions.push(createdSessions[4]._id);

        // Salviamo tutti gli utenti aggiornati contemporaneamente con Promise.all
        await Promise.all([
            rettore.save(),
            matteo.save(),
            daniele.save(),
            alice.save(),
            arianna.save()
        ]);

        console.log('🔗 Sessioni collegate correttamente ai rispettivi proprietari!');
        console.log('✅ Seeding completato con successo!');
        
        process.exit(0); // Uscita corretta

    } catch (error) {
        console.error('❌ Errore durante il seeding:', error);
        process.exit(1); // Uscita con codice di errore
    }
};

seedDB();