import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import blocknativeSDK from 'bnc-sdk';
import configuration from './configuration.json'
import sdkSetup from './sdkSetup'
// import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './App.css';

// const DAPP_ID: string = 'ce6489a0-beeb-4c0a-99ff-d168118b35e5' // API KEY FOR BN ACCOUNT
const NETWORK_ID: number = 1 // mainnet

const logTransactionEvent = (event: any) => console.log("event:", event.transaction)

const blocknative = new blocknativeSDK({
  dappId: DAPP_ID,
  networkId: NETWORK_ID,
  // transactionHandlers: [logTransactionEvent]
})

sdkSetup(blocknative, configuration)

// const { clientIndex } = blocknative

declare const window: any;

const provider = window.ethereum
const web3 = new Web3(provider)

const USDC_ETH_ADDRESS = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'

interface Itx {
  hash: string;
}

const App = (): JSX.Element => {

  const {emitter, details} =  blocknative.account(USDC_ETH_ADDRESS)

  const [txs, setTxs] = useState<Itx[] | any>([])
  const [valIncoming, setValIncoming] = useState(0)


  const txData = txs ? txs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;

  useEffect(() => {

    emitter.on("txConfirmed", (transaction: any) => {
      console.log('emitter: ')
      console.log(transaction)
      setTxs([...txs, transaction])
      if (transaction.direction !== "") console.log(transaction.direction)
      const ether = +web3.utils.fromWei(transaction.value)
      setValIncoming(valIncoming + ether)
    })
  }, [txs])
  
  
  return (
    <div className="App">
      <main>
        <h3>Transactions</h3>
        <p>{valIncoming}</p>
        <div>{txData}</div>
      </main>
    </div>
  );
}

export default App;
