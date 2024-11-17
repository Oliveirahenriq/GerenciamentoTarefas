const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) console.error("Erro ao conectar ao SQLite", err);
    console.log("Conectado ao SQLite");
});

// Criação da tabela (executa apenas uma vez)
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    descricao TEXT,
    status TEXT
)`);

// Rota GET para listar todas as tarefas
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ tasks: rows });
    });
});

// Rota POST para adicionar uma nova tarefa
app.post('/tasks', (req, res) => {
    const { title, description, status } = req.body;
    db.run(`INSERT INTO tasks (titulo, descricao, status) VALUES (?, ?, ?)`,
        [title, description, status],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Rota DELETE para excluir uma tarefa pelo ID
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    db.run(`DELETE FROM tasks WHERE id = ?`, taskId, function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: `Tarefa ${taskId} excluída com sucesso` });
    });
});

// Rota PUT para editar uma tarefa pelo ID
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, description, status } = req.body;
    db.run(`UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`,
        [title, description, status, taskId],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: `Tarefa ${taskId} atualizada com sucesso` });
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});
