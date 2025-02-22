import React, { useState, useEffect } from 'react'

export const ConnectButton = () => {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  // Movement Bardock Testnet Configuration
  const networkConfig = {
    chainId: '0xfa', // 250 in hex
    name: "Movement Bardock Testnet",
    rpcUrl: "https://aptos.testnet.bardock.movementlabs.xyz/v1",
    blockExplorerUrl: "https://explorer.movementlabs.xyz/",
    nativeCurrency: {
      name: 'MOVE',
      symbol: 'MOVE',
      decimals: 18
    }
  }

  useEffect(() => {
    const initWallet = async () => {
      try {
        const provider = window.ethereum
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            const addr = accounts[0]
            setAddress(addr)
            setConnected(true)
          }
        }
      } catch (error) {
        console.error('Wallet initialization error:', error)
      }
    }

    initWallet()
  }, [])

  const handleConnect = async () => {
    try {
      if (!connected) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: networkConfig.chainId,
            chainName: networkConfig.name,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.blockExplorerUrl],
            nativeCurrency: networkConfig.nativeCurrency
          }]
        })

        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts && accounts.length > 0) {
          const addr = accounts[0]
          setAddress(addr)
          setConnected(true)
        }
      } else {
        setConnected(false)
        setAddress('')
      }
    } catch (error) {
      console.error('Connection error:', error)
      if (error.code === 4001) {
        console.log('User rejected connection')
        return
      }
      setConnected(false)
      setAddress('')
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {connected ? (
        <div className="bg-[#FFB84D] rounded-2xl p-4">
          <p className="text-[#664400] font-medium mb-2">
            Connected to Movement Bardock Testnet
          </p>
          <p className="text-[#664400]">
            {formatAddress(address)}
          </p>
          <button 
            onClick={handleConnect}
            className="mt-2 text-sm text-[#FF9900] hover:text-[#CC7A00]"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="bg-[#FFB84D] rounded-2xl p-3 cursor-pointer hover:bg-[#CC7A00] transition-colors text-[#664400]"
        >
          Connect to Movement Bardock
        </button>
      )}
    </div>
  )
}

export default ConnectButton 