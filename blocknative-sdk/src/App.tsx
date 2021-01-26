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

//     console.log(getIncomingValue({
//   "status": "confirmed",
//   "monitorId": "GETH_1_F_PROD",
//   "monitorVersion": "0.79.3",
//   "timePending": "360330",
//   "blocksPending": 31,
//   "pendingTimeStamp": "2021-01-25T20:39:44.274Z",
//   "pendingBlockNumber": 11727106,
//   "hash": "0x4dccd0035d676494549097d587f17ff7613f8346592d696df6ff902c52c6b766",
//   "from": "0x51E646cf615DF72c6732EE407f6F524DD4374E45",
//   "to": "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
//   "value": "0",
//   "gas": 242020,
//   "gasPrice": "50000000000",
//   "nonce": 11,
//   "blockHash": "0x949218f7e2b39898316b5e53d6172bb799be88f4d984686d1831c1ac1aa5d78e",
//   "blockNumber": 11727137,
//   "transactionIndex": 118,
//   "input": "0x852a12e30000000000000000000000000000000000000000000000000000000000b71b00",
//   "gasUsed": "189981",
//   "asset": "ETH",
//   "blockTimeStamp": "2021-01-25T20:45:40.000Z",
//   "watchedAddress": "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9",
//   "direction": "incoming",
//   "counterparty": "0x51E646cf615DF72c6732EE407f6F524DD4374E45",
//   "id": "0x4dccd0035d676494549097d587f17ff7613f8346592d696df6ff902c52c6b766",
//   "serverVersion": "0.87.4",
//   "eventCode": "txConfirmed",
//   "timeStamp": "2021-01-25T20:45:44.580Z",
//   "system": "ethereum",
//   "network": "main"
// }))
    
    
    
    /// @notice functions to handle pending and txConfirmed events

    // need to handle transaction fail
    
    emitter.on("txPool", (transaction: any) => getIncomingValue(transaction))

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
