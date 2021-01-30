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
import LoanShifterTaker_ABI from './LoanShifterTaker_ABI.json'
import DSProxy_ABI from './DSProxy_ABI.json'

const cUSDT = addresses.compound.cUSDT

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
  // const [abi, setAbi] = useState(LoanShifterTaker_ABI)
  // const [abi, setAbi] = useState(cUSDT_ABI)
  const [abi, setAbi] = useState(DSProxy_ABI)

  const e_provider = ethers.getDefaultProvider();
  const inter = new ethers.utils.Interface(abi);

  const txHashesSet = new Set()

  const pendingTxData = pendingTxs ? pendingTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;
  
  const confirmedTxData = confirmedTxs ? confirmedTxs.map((tx: any) => <><p key={tx.hash}>tx: {tx.hash}: {web3.utils.fromWei(tx.value)} ether</p></>) : null;

 // ETHERS DECODE FUNCTION
 const decodeTxnValue = (async(txnHash: any, abi: any) => {  
    
    // get txn using ethers provider
    const tx = await e_provider.getTransaction(txnHash);

        // decode input of txn
        const decodedInput = inter.parseTransaction({ data: tx.data, value: tx.value});

        console.log(decodedInput)

        // Decoded Transaction
        return {
            function_name: decodedInput.name,
            sighash: decodedInput.sighash,
            from: tx.from,
            to: decodedInput.args[0],
            erc20Value: Number(decodedInput.args[0])
          };        
    });

    const callDecodeFunction = async (txnHash: any, abi: any) => {
      const result = await decodeTxnValue(txnHash, abi)
      console.dir(result)
    }

  const decodeTxInput = () => {
    // main transaction function call (execute)
    callDecodeFunction('0x853eaedce195464f407ca9c51825ae20995265bf34dfbb1076c482f86f4c7b8c', LoanShifterTaker_ABI)
    
    // first delegate call
    // callDecodeFunction()
  }

  useEffect(() => {
    decodeTxInput()

    // callDecodeFunction('0x442d693bd5a1188c2b60d984feb42d3aedd2272cc11fb1e3aceed79e76f0bd9a', cUSDT_ABI)
  }, [])
  
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


// useEffect(() => {
     
//   // console.log('basic mint')
//   // callDecodeFunction('0x442d693bd5a1188c2b60d984feb42d3aedd2272cc11fb1e3aceed79e76f0bd9a')
    
//   // console.log('basic borrow')
//   // callDecodeFunction('0x2922821ce0afe1ca0b076f93bdf76063858b60490e6533952c9e33950d1c73cf')
    
//   // console.log('1-inch')
//   // callDecodeFunction('0x2d28c2d546142cd565f23ace7672e75b965630653d4859db1c6a3e70f29fea3d')

//   // /// @notice functions to handle various mempool events
//   // emitter.on("txPool", (transaction: TTransaction) => {
//   //   callDecodeFunction(transaction.hash)
//   // })
    
//   // // need to handle transaction fail
//   // emitter.on("txFailed", (transaction: TTransaction) =>  {
//   //   //   console.log(transaction.status, transaction)
//   //   callDecodeFunction(transaction.hash)
//   // })

//   // emitter.on("txConfirmed", (transaction: TTransaction) => {
//   // })
// }, [pendingTxs, confirmedTxs])