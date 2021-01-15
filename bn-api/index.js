require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Initialize express and define a port
const { PORT } = process.env;

// Tell express to use body-parser's JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	console.log('user connected');
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

app.post('/blocknative-webhook', (req, res) => {
	try {
		console.log('body', req.body);
		io.sockets.emit('tx', req.body);
		res.status(200).send('hook'); // Responding is important
	} catch (error) {
		console.log(error);
	}
});

http.listen(PORT, () => console.log(`🚀 ${PORT}`));
