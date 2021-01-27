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


// typescript stuffs
//  enum valueType {
//     pending = "pending",
//     confirmed = "confirmed"
//   }
 type TTransaction = any

/// @dev test
// const DAPP_ID: string = 'ce6489a0-beeb-4c0a-99ff-d168118b35e5' // API KEY #1 FOR BN ACCOUNT
/// @dev test2
// const DAPP_ID: string = 'c49c368d-6f2c-4933-9053-9116d1fe39d1' // API KEY #2 FOR BN ACCOUNT 

const NETWORK_ID: number = 1 // mainnet

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

const App = (): JSX.Element => {

  const {emitter, details} =  blocknative.account(cUSDT)

  const [pendingTxs, setPendingTxs] = useState<TTransaction | undefined>([])
  const [confirmedTxs, setConfirmedTxs] = useState<TTransaction | undefined>([])
  const [valIncoming, setValIncoming] = useState(0)
  const [valConfirmed, setValConfirmed] = useState(0)

  const txHashesSet = new Set()

  // remove pending tx from list of all txs if confirmed tx === a tx in pending list 
  const addOrRemoveNewTx = (transaction: TTransaction) => {
    if (transaction.status === 'pending') {
      if (txHashesSet.has(transaction.hash)) {
        // remove tx from current txs State
        const newTxs = pendingTxs.filter((tx: TTransaction) => tx.hash === transaction.hash)
        // set new State
        setPendingTxs(newTxs)
      } else {
        txHashesSet.add(transaction.hash)
        setPendingTxs([...pendingTxs, transaction])
      }
    } else if (transaction.status === "confirmed") {
      // add tx to txs State if it's confirmed
      setConfirmedTxs([...confirmedTxs, transaction])
    }
  }

  const decodeTxAmount = (token: string, input: string): number => {
    // decode input 
    const value = +web3.eth.abi.decodeParameter('uint256', input)
    switch (token) {
      case 'cUSDT':
        return value / 10 ** 6  
      default:
        return value
    }    
  }
  
  const updateValueSums = (tokenType: string, valueType: string, transaction: TTransaction) => {    
    // find hex of value being transferred by slicing out part of transaction.input that indicates the method name
    const hexInput = transaction.input.slice(10, transaction.input.length)
    console.log('tx input', hexInput)

    // decode amount being used in transaction
    const decodedValue = decodeTxInput(transaction, tokenType)

    if (valueType === "pending") {
      if (!txHashesSet.has(transaction.hash)) {
        setValIncoming(valIncoming + decodedValue)
      }
    } else if (valueType === "confirmed") {
      if (txHashesSet.has(transaction.hash)) {
        setValIncoming(valIncoming - decodedValue)
        setValConfirmed(valConfirmed + decodedValue)
      } else {
        setValConfirmed(valConfirmed + decodedValue)
      }
    }

    console.log('tx value', decodedValue)
  }

  const decodeTxInput = (transaction: TTransaction, token: string): number => {
    // log status of tx
    console.log(transaction.status, transaction)

    const methodHex = transaction.input.slice(0,10)
    const methodInput = transaction.input.slice(10, transaction.input.length)
    
    // log code of method
    console.log('method hex:', methodHex)
    console.log('method input:', methodInput)

    // find method being called by slicing it out of transaction.input
    switch (methodHex) {
      case '0xa0712d68':
        console.log('mint method called')
        break;
      case '0xc5ebeaec':
        console.log('borrow method called')
        break;
      default:
        console.log('idk method called')
        break;
    }

  return decodeTxAmount(token, methodInput)
  }
  const pendingTxData = pendingTxs ? pendingTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;
  
  const confirmedTxData = confirmedTxs ? confirmedTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;

  useEffect(() => {
        
    /// @notice functions to handle various mempool events
    emitter.on("txPool", (transaction: TTransaction) => {
      addOrRemoveNewTx(transaction)
      updateValueSums("cUSDT", "pending", transaction)  
    })
    
    // need to handle transaction fail
    emitter.on("txFailed", (transaction: TTransaction) =>  {
      console.log(transaction.status, transaction)
      addOrRemoveNewTx(transaction)
    })

    emitter.on("txConfirmed", (transaction: TTransaction) => {
      addOrRemoveNewTx(transaction)
      updateValueSums("cUSDT", "confirmed", transaction)
    })
  }, [pendingTxs, confirmedTxs])

  
  
  return (
    <div className="App">
      <main>
        <h1>DeFlow</h1>
        <h2>Values</h2>
        <p>incoming: {valIncoming}</p>
        <p>confirmed: {valConfirmed}</p>
        <h2>Pending Tx Hashes</h2>
        <div>{pendingTxData}</div>
        <h2>Confirmed Tx Hashes</h2>
        <div>{confirmedTxData}</div>
      </main>
    </div>
  );
}

export default App;
