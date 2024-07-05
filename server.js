const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'dbproject',
});

app.get('/movies', (req, res) => {
  const query = 'SELECT * FROM myTable';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/simpleQuery', (req, res) => {
  const query = ' SELECT Title, Genre, Revenue_Millions FROM mytable m WHERE Revenue_Millions = (SELECT MAX(Revenue_Millions) FROM mytable WHERE Genre = m.Genre);';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/Query', (req, res) => {
  const query = 'SELECT Title, Year, Metascore FROM myTable ORDER BY Metascore DESC LIMIT 100';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {
      
      res.send(results);
    }
  });
});

app.get('/rev', (req, res) => {
  const query = 'SELECT m.Ranking, m.Title, m.Genre, m.Director, m.Actors, m.Year, m.Runtime_Minutes, m.Rating, m.Votes, m.Revenue_Millions, m.Metascore, r.Review FROM mytable m INNER JOIN reviewtable r ON m.Ranking = r.Ranking';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {
      
      res.send(results);
    }
  });
});


app.get('/dir', (req, res) => {
  const query = 'SELECT Director, MAX(Rating) AS BestMovieRating FROM mytable  GROUP BY Director limit 20';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {
      
      res.send(results);
    }
  });
});


app.post('/insertData', (req, res) => {
  const {
    ranking,
    title,
    genre,
    director,
    actors,
    year,
    runtime,
    rating,
    votes,
    revenue,
    metascore,
  } = req.body;

  console.log('Received Movie Data:');
  console.log('Ranking:', ranking);
  console.log('Title:', title);
  console.log('Genre:', genre);
  console.log('Director:', director);
  console.log('Actors:', actors);
  console.log('Year:', year);
  console.log('Runtime:', runtime);
  console.log('Rating:', rating);
  console.log('Votes:', votes);
  console.log('Revenue:', revenue);
  console.log('Metascore:', metascore);



  // Validate input (add more validation as needed)
  if (!ranking || !title || !genre || !director || !actors || !year || !runtime || !rating || !votes || !revenue || !metascore) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO myTable (Ranking, Title, Genre, Director, Actors, Year, Runtime_Minutes, Rating, Votes, Revenue_Millions, Metascore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(query, [ranking, title, genre, director, actors, year, runtime, rating, votes, revenue, metascore], (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).send('Internal Server Error');
    } else {

      console.log('Inserted Movie:', { ranking, title, genre, director, actors, year, runtime, rating, votes, revenue, metascore });
      
      res.status(201).json({ message: 'Movie inserted successfully' });

    }
  });
});



app.post('/search', (req, res) => {
  const searchTerm = req.body.title.toLowerCase();
console.log(searchTerm);

const query = `SELECT mytable.*, reviewtable.Review FROM mytable LEFT JOIN reviewtable ON mytable.Ranking = reviewtable.Ranking WHERE mytable.Title LIKE ?`;

connection.query(query, [`%${searchTerm}%`], (err, results) => {
  if (err) {
    console.error('Error fetching data:', err);
    // Handle the error appropriately
  } else {
    // Check if results are available
    if (results && results.length > 0) {
      // Process the results
      console.log(results);
      res.json(results);
    } else {
      console.log('No results found.');

    }
  }
});
});

// Endpoint to handle the update operation
app.post('/update', (req, res) => {
  const { ranking, title, genre } = req.body;

  const updateQuery = 'UPDATE mytable SET Title = ?, Genre = ? WHERE Ranking = ?';
  connection.query(updateQuery, [title, genre, ranking], (err, results) => {
    if (err) {
      console.error('Error updating data:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.json({ message: 'Movie details updated successfully' });
  });
});



app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});