const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("خطأ في الاتصال بقاعدة البيانات:", err);
    } else {
        console.log("تم الاتصال بقاعدة البيانات بنجاح.");
    }
    db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullNameArabic TEXT,
        fullNameEnglish TEXT,
        email TEXT,
        gender TEXT,
        age INTEGER,
        education TEXT,
        nationalId TEXT,
        mobile TEXT,
        governorate TEXT,
        source TEXT,
        submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'UI')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'UI', 'index.html'));
});

app.post('/submit', (req, res) => {
    console.log("--> تم استلام طلب جديد. البيانات المستلمة:", req.body);

    const {
        fullNameArabic, fullNameEnglish, email, gender, age,
        education, nationalId, mobile, governorate, source
    } = req.body;
    
    const sql = `INSERT INTO submissions (fullNameArabic, fullNameEnglish, email, gender, age, education, nationalId, mobile, governorate, source)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [fullNameArabic, fullNameEnglish, email, gender, age, education, nationalId, mobile, governorate, source], function(err) {
        if (err) {
            console.error("!!! حدث خطأ في قاعدة البيانات:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        console.log(`--> تم حفظ البيانات بنجاح. ID الصف الجديد: ${this.lastID}`);
        res.status(200).json({ success: true, message: 'Data saved successfully' });
    });
});

app.get('/data', (req, res) => {
    const sql = `SELECT * FROM submissions ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send("حدث خطأ أثناء استرجاع البيانات.");
        }
        let tableRows = rows.map(row => `
            <tr>
                <td>${row.id}</td>
                <td>${row.fullNameArabic}</td>
                <td>${row.fullNameEnglish}</td>
                <td>${row.email}</td>
                <td>${row.mobile}</td>
                <td>${row.age}</td>
                <td>${row.gender}</td>
                <td>${row.governorate}</td>
                <td>${row.education}</td>
                <td>${row.nationalId}</td>
                <td>${row.source}</td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>البيانات المسجلة</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', sans-serif; background-color: #f5f7fa; color: #2c3e50; padding: 20px; }
                    .container { max-width: 1200px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
                    h1 { text-align: center; padding: 20px; background: #0d47a1; color: #fff; margin: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 12px 15px; border: 1px solid #e0e0e0; text-align: right; }
                    th { background-color: #f2f4f7; font-weight: 700; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    tr:hover { background-color: #e8f4fd; }
                    .back-link { display: block; text-align: center; margin-top: 20px; font-weight: bold; color: #0d47a1; text-decoration: none;}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>البيانات المسجلة في قاعدة البيانات</h1>
                    <div style="overflow-x:auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الاسم بالعربي</th>
                                    <th>الاسم بالانجليزي</th>
                                    <th>الايميل</th>
                                    <th>الموبايل</th>
                                    <th>السن</th>
                                    <th>النوع</th>
                                    <th>المحافظة</th>
                                    <th>المؤهل</th>
                                    <th>الرقم القومي</th>
                                    <th>المصدر</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
                <a class="back-link" href="/">العودة إلى صفحة التسجيل الرئيسية</a>
            </body>
            </html>
        `);
    });
});

app.listen(port, () => {
    console.log(`الخادم يعمل الآن على http://localhost:${port}`);
});