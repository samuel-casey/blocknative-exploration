import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import axios from 'axios';
import './App.css';

const ENDPOINT = 'http://693713908727.ngrok.io';

function App() {
	const [transactions, setTransactions] = useState([{ hash: 'ABC', value: 0 }]);
	const [number, setNumber] = useState([{ num: 1 }]);

	useEffect(() => {
		const pingServer = async () => {
			const res = await axios.get(ENDPOINT);
			console.log(res.data.data);
		};

		pingServer();

		const socket = openSocket(ENDPOINT);

		socket.on('tx', (data) => {
			console.log(data.hash.slice(0, 10));
			console.log(transactions);
			setTransactions([...transactions, data]);
			setNumber([...number, { num: number[0].num + 1 }]);
			console.log(transactions);
		});
	}, []);

	return (
		<div className='App'>
			<h1>DeFlow</h1>
			<ul>
				{transactions.map((transaction) => (
					<li key={transaction.hash}>
						{transaction.value / 10 ** 18}: {transaction.hash.slice(0, 10)}
					</li>
				))}
			</ul>
			<ul style={{ border: '1px solid' }}>
				{number.map((num, idx) => (
					<li key={idx}>{num.num}</li>
				))}
			</ul>
		</div>
	);
}

export default App;
