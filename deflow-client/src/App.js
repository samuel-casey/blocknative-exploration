import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import axios from 'axios';
import './App.css';

const ENDPOINT = 'http://4b6ce298b306.ngrok.io/';

function App() {
	const [transactions, setTransactions] = useState([]);

	useEffect(() => {
		const socket = openSocket(ENDPOINT);

		socket.on('tx', (data) => {
			console.log(data.hash.slice(0, 10), data.status);
			console.log(transactions);
			setTransactions([...transactions, data]);
			console.log(transactions);
		});
	}, [transactions]);

	return (
		<div className='App'>
			<h1>DeFlow</h1>
			<ul>
				{transactions.map((transaction, idx) => (
					<li key={idx}>
						{transaction.value / 10 ** 18}: {transaction.hash.slice(0, 10)}:{' '}
						{transaction.status}
					</li>
				))}
			</ul>
		</div>
	);
}

export default App;
