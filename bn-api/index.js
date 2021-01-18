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

// http://4b6ce298b306.ngrok.io/blocknative-hook -- 1/17 WBTC-ETH local webhook

// 0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc -- USDC-ETH
// 0xbb2b8038a1640196fbe3e38816f3e67cba72d940 -- WBTC-ETH

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

// let interval

// if (interval) {
//     clearInterval(interval);
// }
// interval = setInterval(() => getApiAndEmit(socket), 1000);

// const getApiAndEmit = (socket) => {
// 	const response = new Date();
// 	// Emitting a new message. Will be consumed by the client
// 	socket.emit('FromAPI', response);
// };
