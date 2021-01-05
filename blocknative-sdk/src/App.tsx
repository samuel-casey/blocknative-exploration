import React, { useState } from 'react';
import Web3 from 'web3';
import blocknativeSDK from 'bnc-sdk';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './App.css';

const DAPP_ID: string = '1e6835da-e541-4da6-bec2-e5047dc0031e'
const NETWORK_ID: number = 4

const blocknative = new blocknativeSDK({
  dappId: DAPP_ID,
  networkId: NETWORK_ID
})

// const { clientIndex } = blocknative

declare const window: any;

const provider = window.ethereum
const web3 = new Web3(provider)

const rinkelborg = '0xD3a4CCF97122DA15750E50d3E97B54DF1D71DAA5'
const runklebug = '0x11113c2fba9ae08d7d16c817f03de51f29117db2'

interface Itx {
  hash: string;
}

const App = (): JSX.Element => {

  const [txs, setTxs] = useState<Itx[] | any>([])
  const [status, setStatus] = useState<any>()

  const sendTx = async (e: any): Promise<any> => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts()
    const address = accounts[0]

    const txOptions = {
      to: runklebug,
      from: address,
      value: web3.utils.toWei("0.00000001")
    }

    web3.eth.sendTransaction(txOptions)
      .on('transactionHash', hash => {
        const { emitter } = blocknative.transaction(hash)

        emitter.on('txPool', transaction => {
          console.log(transaction)
          console.log('tx in mempool')
          setStatus('pending')
        })

        emitter.on('txConfirmed', (transaction: any) => {
          console.log(transaction)
          console.log('tx confirmed')
          setTxs((prevTxs: any) => [...prevTxs, { hash: transaction.hash, value: transaction.value }])
          setStatus('complete')
        })
      })
  }

  const txData = txs ? txs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;


  let txStatus;

  switch (status) {
    case 'pending':
      txStatus = <Loader type="Puff"
        color="#00BFFF"
        height={100}
        width={100}
        timeout={3000} />
      break;
    case 'complete':
      const lastTx = txs.length > 0 ? txs.slice(txs.length - 1, 1)[0].hash : 'womp'
      console.log(lastTx)
      txStatus = <p>TX {lastTx} COMPLETE</p>
      break;
    default:
      txStatus = 'Waiting for tx to be sent via MetaMask'
      break;
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={sendTx}>Send Transaction</button>
      </header>
      <main>
        <div>{txStatus}</div>
        <h3>Transactions</h3>
        <div>{txData}</div>
      </main>
    </div>
  );
}

export default App;
