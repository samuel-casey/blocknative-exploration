require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);

const options = {
	cors: {
		origin: '*',
	},
};

const io = require('socket.io')(http, options);

// Initialize express and define a port
const { PORT } = process.env;

// Tell express to use body-parser's JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
	try {
		res.status(200).json({ message: 'ok', data: 'pinged' });
	} catch (error) {
		res.status(400).json({ message: 'error', data: error.message });
	}
});

io.on('connection', (socket) => {
	console.log('user connected:', socket.id);
	socket.on('disconnect', () => {
		console.log('user disconnected', socket.id);
	});
});

app.post('/blocknative-hook', (req, res) => {
	try {
		console.log('body', req.body);
		io.sockets.emit('tx', req.body);
		res.status(200).send('hook');
	} catch (error) {
		console.log(error);
	}
});

http.listen(PORT, () => console.log(`🚀 ${PORT}`));
