import React, { useState } from 'react';
import Web3 from 'web3';
import blocknativeSDK from 'bnc-sdk';
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
const runkelbug = '0x11113c2fba9ae08d7d16c817f03de51f29117db2'

interface Itx {
  hash: string;
}

const App = (): JSX.Element => {

  const [txs, setTxs] = useState<Itx[] | any>()

  const sendTx = async (e: any): Promise<any> => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts()
    const address = accounts[0]

    const txOptions = {
      to: runkelbug,
      from: address,
      value: web3.utils.toWei("0.03")
    }

    web3.eth.sendTransaction(txOptions)
      .on('transactionHash', hash => {
        const { emitter } = blocknative.transaction(hash)

        emitter.on('txPool', transaction => {
          console.log(transaction)
          console.log('tx in mempool')
        })

        emitter.on('txConfirmed', (transaction: any) => {
          console.log(transaction)
          console.log('tx confirmed')
          setTxs((prevTxs: any) => [...prevTxs, { hash: transaction.hash }])
        })
      })

    const randos: string[] = ['brown', 'slinging slasher', 'potato']
    const theHash: string = randos[Math.floor(Math.random() * randos.length)]
    setTxs([{ hash: theHash }])
  }

  const txData = txs ? txs.map((tx: any) => <p key={tx.hash}>{tx.hash}</p>) : 'no tx Data yet';

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={sendTx}>Send Transaction</button>
      </header>
      <main>
        <div>{txData}</div>
      </main>
    </div>
  );
}

export default App;
