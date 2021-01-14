const express = require('express');

// Initialize express and define a port
const app = express();
const PORT = 4000;

// Tell express to use body-parser's JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
	res.send('hi');
});

app.post('/', (req, res) => {
	console.log('body', req.body);
	res.status(200).send('hook'); // Responding is important
});

// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
