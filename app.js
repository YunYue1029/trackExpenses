const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();

// 创建或打开数据库文件
const db = new sqlite3.Database('db/budgeting.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the sqlite database.');
    }
});

// 创建 transactions 表
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            note TEXT,
            date TEXT NOT NULL
        )
    `);
});

// 设置中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 使用路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 添加记账记录
app.post('/api/transactions', (req, res) => {
    const { amount, category, note, date } = req.body;
    const sql = 'INSERT INTO transactions (amount, category, note, date) VALUES (?, ?, ?, ?)';
    db.run(sql, [amount, category, note, date], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({
            id: this.lastID,
            amount,
            category,
            note,
            date
        });
    });
});

// 获取所有记账记录
app.get('/api/transactions', (req, res) => {
    const sql = 'SELECT * FROM transactions';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

// 删除记账记录
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM transactions WHERE id = ?';
    db.run(sql, id, function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.sendStatus(200);
    });
});

// 修改记账记录
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { amount, category, note, date } = req.body;
    const sql = 'UPDATE transactions SET amount = ?, category = ?, note = ?, date = ? WHERE id = ?';
    db.run(sql, [amount, category, note, date, id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.sendStatus(200);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

module.exports = app;
