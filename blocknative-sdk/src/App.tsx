import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import blocknativeSDK from 'bnc-sdk';
import configuration from './configuration.json'
import sdkSetup from './sdkSetup'
// import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './App.css';
import {addresses} from './addresses'

const USDC_ETH = addresses.uniswap.USDC_ETH
const cUSDT = addresses.compound.cUSDT

/// @dev test
const DAPP_ID: string = 'ce6489a0-beeb-4c0a-99ff-d168118b35e5' // API KEY #1 FOR BN ACCOUNT
/// @dev test2
// const DAPP_ID: string = 'c49c368d-6f2c-4933-9053-9116d1fe39d1' // API KEY #2 FOR BN ACCOUNT 

const NETWORK_ID: number = 1 // mainnet

const logTransactionEvent = (event: any) => {
  switch(event.transaction.eventCode)  {
    case 'txPool':
      console.log('txPool:' , event.transaction)
      break;
    case 'txConfirmed':
      console.log('txConfirmed:' , event.transaction)
      break;
    default:
      console.log('other:', event.transaction)
      break;
  }
}
// Uniswap v2 router: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"

const blocknative = new blocknativeSDK({
  dappId: DAPP_ID,
  networkId: NETWORK_ID,
  // transactionHandlers: [logTransactionEvent],
})

sdkSetup(blocknative, configuration)

// const { clientIndex } = blocknative

declare const window: any;

const provider = window.ethereum
const web3 = new Web3(provider)

interface Itx {
  hash: string;
}

const App = (): JSX.Element => {

  const {emitter, details} =  blocknative.account(cUSDT)

  const [txs, setTxs] = useState<Itx[] | any>([])
  const [valIncoming, setValIncoming] = useState(0)
  const [valConfirmed, setValConfirmed] = useState(0)


  const decodeMintAmount = (token: string, input: string): number => {
    // decode input 
    const value = +web3.eth.abi.decodeParameter('uint256', input)
    switch (token) {
      case 'cUSDT':
        return value / 10 ** 6  
      default:
        return value
    }    
  }

  const getIncomingValue = (transaction: any): void => {
    setTxs([...txs, transaction])
      const input = '0x' + transaction.input.slice(10, transaction.input.length)
      console.log('txP input', input)
      const value = decodeMintAmount('cUSDT', input)
      console.log('value txP', value)
      console.log('pending: ', transaction)
      setValIncoming(valIncoming + value)
  }

  const txData = txs ? txs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;

  useEffect(() => {
        
    /// @notice functions to handle various mempool events
    emitter.on("txPool", (transaction: any) => getIncomingValue(transaction))
    
    // need to handle transaction fail
    emitter.on("txFailed", (transaction: any) =>  {
      if (txs.includes(transaction)) {
        const newTxs = txs.filter((tx: any) => tx.hash === transaction.hash)
        setTxs(newTxs)
      }
    })

    emitter.on("txConfirmed", (transaction: any) => {
      if (txs.includes(transaction)) {
        const newTxs = txs.filter((tx: any) => tx.hash === transaction.hash)
        setTxs(newTxs)
      }
      const input = '0x' + transaction.input.slice(10, transaction.input.length)
      console.log('txC input', input)
      const value = decodeMintAmount('cUSDT', input)
      console.log('value txC', value)
      console.log('pending: ', transaction)
      setValConfirmed(valConfirmed + value)
      console.log('confirmed: ', transaction)
    })
  }, [txs])
// }, [])

  
  
  return (
    <div className="App">
      <main>
        <h3>Transactions</h3>
        <p>incoming: {valIncoming}</p>
        <p>confirmed: {valConfirmed}</p>
        <div>{txData}</div>
      </main>
    </div>
  );
}

export default App;
