import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import axios from 'axios';
import './App.css';

const ENDPOINT = 'http://693713908727.ngrok.io/';

function App() {
	const [response, setResponse] = useState('');

	useEffect(() => {
		// const socket = socketIOClient(ENDPOINT);
		const pingServer = async () => {
			const res = await axios.get(ENDPOINT);
			console.log(res.data.data);
		};

		pingServer();

		const socket = openSocket(ENDPOINT);
		socket.on('FromAPI', (data) => {
			setResponse(data);
		});
	}, []);

	return (
		<div className='App'>
			<h1>DeFlow</h1>
			<p>
				It's <time dateTime={response}>{response}</time>
			</p>
		</div>
	);
}

export default App;
