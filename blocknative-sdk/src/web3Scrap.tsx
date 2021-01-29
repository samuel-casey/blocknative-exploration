import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import blocknativeSDK from 'bnc-sdk';
import configuration from './configuration.json'
import sdkSetup from './sdkSetup'
import {ethers} from 'ethers'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import './App.css';
import {addresses} from './addresses'
import cUSDT_ABI from './cUSDT_ABI.json'

const cUSDT = addresses.compound.cUSDT

const e_provider = ethers.getDefaultProvider();
const inter = new ethers.utils.Interface(cUSDT_ABI);

// typescript stuffs
type TTransaction = any

/// @dev test
const DAPP_ID: string = 'ce6489a0-beeb-4c0a-99ff-d168118b35e5' // API KEY #1 FOR BN ACCOUNT
/// @dev test2
// const DAPP_ID: string = 'c49c368d-6f2c-4933-9053-9116d1fe39d1' // API KEY #2 FOR BN ACCOUNT 

const NETWORK_ID: number = 1 // mainnet

const blocknative = new blocknativeSDK({
  dappId: DAPP_ID,
  networkId: NETWORK_ID,
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

  const updateValueSums = (tokenType: string, valueType: string, transaction: TTransaction) => {    
    // find hex of value being transferred by slicing out part of transaction.input that indicates the method name
    const hexInput = transaction.input.slice(10, transaction.input.length)
    console.log('tx input', hexInput)

    // decode amount being used in transaction
    const decodedValue = decodeTxInput()

    if (valueType === "pending") {
      if (!txHashesSet.has(transaction.hash)) {
        // setValIncoming(valIncoming + decodedValue)
      }
    } else if (valueType === "confirmed") {
      if (txHashesSet.has(transaction.hash)) {
        // setValIncoming(valIncoming - decodedValue)
        // setValConfirmed(valConfirmed + decodedValue)
      } else {
        // setValConfirmed(valConfirmed + decodedValue)
      }
    }

    console.log('tx value', decodedValue)
  }

  const decodeTxInput = () => {

  }
  const pendingTxData = pendingTxs ? pendingTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;
  
  const confirmedTxData = confirmedTxs ? confirmedTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;

 // ETHERS DECODE FUNCTION
 const decodeTxnValue = (async(txnHash: any) => {
      const tx = await e_provider.getTransaction(txnHash);

        console.log(tx.data)

        const decodedInput = inter.parseTransaction({ data: tx.data, value: tx.value});

        // Decoded Transaction
        return {
            function_name: decodedInput.name,
            from: tx.from,
            to: decodedInput.args[0],
            erc20Value: Number(decodedInput.args[0])
          };        
    });

    const callDecodeFunction = async (txnHash: any) => {
      const result = await decodeTxnValue(txnHash)
      console.log(txnHash, result.erc20Value)
    }


  useEffect(() => {
     
    console.log('basic mint')
    callDecodeFunction('0x442d693bd5a1188c2b60d984feb42d3aedd2272cc11fb1e3aceed79e76f0bd9a')
    
    console.log('basic borrow')
    callDecodeFunction('0x2922821ce0afe1ca0b076f93bdf76063858b60490e6533952c9e33950d1c73cf')
    
    console.log('1-inch')
    callDecodeFunction('0x2d28c2d546142cd565f23ace7672e75b965630653d4859db1c6a3e70f29fea3d')

    // /// @notice functions to handle various mempool events
    // emitter.on("txPool", (transaction: TTransaction) => {
    //   // addOrRemoveNewTx(transaction)
    //   // updateValueSums("cUSDT", "pending", transaction)  
    //   callDecodeFunction(transaction.hash)
    // })
    
    // // need to handle transaction fail
    // emitter.on("txFailed", (transaction: TTransaction) =>  {
    //   //   console.log(transaction.status, transaction)
    //   //   addOrRemoveNewTx(transaction)
    //   callDecodeFunction(transaction.hash)
    // })

    // emitter.on("txConfirmed", (transaction: TTransaction) => {
    //   addOrRemoveNewTx(transaction)
    //   updateValueSums("cUSDT", "confirmed", transaction)
    // })
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
