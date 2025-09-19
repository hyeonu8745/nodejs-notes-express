const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 3000;

// 1) View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2) Middlewares
app.use(morgan('dev')); // Request logging
app.use(express.urlencoded({ extended: true })); // Parse HTML form data
app.use(express.json()); // Parse JSON data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// 3) In-memory Data (Sample)
let notes = [
    { id: 1, title: '첫 메모', body: 'EJS 연습', createdAt: new Date() }
];
const nextId = () => (notes.length ? Math.max(...notes.map(n => n.id)) + 1 : 1);

// 4) Routes
app.get('/', (req, res) => {
    res.render('home', { title: '홈', notesCount: notes.length });
});

app.get('/notes', (req, res) => {
    res.render('notes/index', { title: '메모 목록', notes });
});

app.get('/notes/new', (req, res) => {
    res.render('notes/new', { title: '새 메모' });
});

app.post('/notes', (req, res) => {
    const { title, body } = req.body;
    
    // Server-side validation
    if (!title || !body) {
        return res.status(400).render('notes/new', { 
            title: '새 메모', 
            error: '제목과 내용을 입력하세요.' 
        });
    }
    
    notes.push({ id: nextId(), title, body, createdAt: new Date() });
    res.redirect('/notes'); // Post/Redirect/Get pattern
});

app.get('/notes/:id', (req, res, next) => {
    const note = notes.find(n => n.id === parseInt(req.params.id, 10));
    if (!note) return next(); // Go to 404 handler
    res.render('notes/show', { title: note.title, note });
});

app.post('/notes/:id/delete', (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return next(); // Go to 404 handler
    notes.splice(idx, 1);
    res.redirect('/notes');
});

// 5) 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Not Found' });
});

// 6) Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('500', { title: 'Server Error', error: err });
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
