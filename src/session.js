const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

let members = [
  { name: 'Alice', password: '1234' },
  { name: 'Alicec', password: '12345' }
];

// Middleware für JSON und URL-encoded Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'mein-geheimer-schluessel',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }  // httpOnly schützt vor XSS
}));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Login-Seite
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Registrierungsseite
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// API: Überprüft, ob der Benutzer angemeldet ist
app.get('/get-username', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user });
  } else {
    res.status(401).json({ error: 'Nicht angemeldet' });
  }
});

// Registrierungs-Handler
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Fehler: Benutzername und Passwort sind erforderlich.');
  }

  // Prüfen, ob der Benutzername bereits existiert
  if (members.some(member => member.name === username)) {
    return res.status(409).send('Benutzername bereits vergeben.');
  }

  members.push({ name: username, password: password });
  return res.redirect('/login');
});

// Login-Handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = members.find(member => member.name === username && member.password === password);

  if (user) {
    req.session.user = username;
    return res.redirect('/content');
  } else {
    return res.status(401).send('Ungültige Anmeldedaten');
  }
});

// Geschützte Seite nach Login
app.get('/content', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('Zugriff verweigert. Bitte anmelden.');
  }
  res.sendFile(path.join(__dirname, 'views', 'content.html'));
});

// Logout als POST
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Fehler beim Abmelden');
    }
    res.redirect('/');  // Zurück zur Startseite nach Logout
  });
});

// Logout als GET (für einfache Links)
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});