import express from 'express';
import { getTrends } from './scraper.js';
import mysql from 'mysql';

const app = express();
const PORT = 3000;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
});

app.get('/', async (req, res) => {
    try {
        const results = await getTrends();
        let sql = "INSERT INTO gtrends_daily (title, url, source, time, search_count) VALUES ?";
        con.query(sql, [results], (err, result) => {
            if (err) throw err;
            console.log("number of records inserted: " + result.affectedRows);
        });
        res.status(200).send(results);
    } catch (error) {
        res.status(500).send(error);
    }
})


app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
con.connect((err) => {
    if (err) throw err;
    console.log('connected to mysql db!');
})