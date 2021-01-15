import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';
import axios from 'axios';
import './App.css';

const ENDPOINT = 'http://5f27a67e853d.ngrok.io';

function App() {
	const [transactions, setTransactions] = useState([]);
	const [number, setNumber] = useState([{ num: 1 }]);
	const [times, setTimes] = useState([]);

	useEffect(() => {
		const socket = openSocket(ENDPOINT);
		// const pingServer = async () => {
		// 	const res = await axios.get(ENDPOINT);
		// 	console.log(res.data.data);
		// };

		// pingServer();

		// socket.on('FromAPI', (data) => {
		// 	console.log(data);
		// 	setTimes([...times, data]);
		// });

		socket.on('tx', (data) => {
			console.log(data.hash.slice(0, 10), data.status);
			console.log(transactions);
			setTransactions([...transactions, data]);
			setNumber([...number, { num: number[0].num + 1 }]);
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
			{/* <ul style={{ border: '1px solid' }}>
				{number.map((num, idx) => (
					<li key={idx}>{num.num}</li>
				))}
			</ul>
			<ul>
				{times.map((time) => (
					<li key={time}>{time}</li>
				))}
			</ul> */}
		</div>
	);
}

export default App;
