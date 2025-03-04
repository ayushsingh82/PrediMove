import React, { useState } from 'react'
// import { ConnectButton } from './ConnectButton'
import { FaChartLine, FaPlus, FaUser, FaShoppingCart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
// import { publicClient, walletClient, chainConfig } from '../config'
import { wagmiAbi } from '../abi'
import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient , http } from 'viem'
import { createWalletClient ,custom } from 'viem'
import ConnectButton from './ConnectButton'

const flowTestnet = {
  id: 545,
  name: 'Flow Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org']
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org']
    }
  }
}


function BuyBet() {
  const navigate = useNavigate()
  const { user } = usePrivy()

  const [amount, setAmount] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!window.ethereum) {
        throw new Error('No ethereum provider found')
      }

      if (!amount) {
        throw new Error('Please enter an amount')
      }

      // Convert amount to BigInt (1 FLOW = 1e18 wei)
      const amountInWei = BigInt(Math.floor(Number(amount) * 1e18))

      // Create public client
      const publicClient = createPublicClient({
        chain: flowTestnet,
        transport: http()
      })

      // Create wallet client
      const walletClient = createWalletClient({
        chain: flowTestnet,
        transport: custom(window.ethereum)
      })

      // Switch to Flow Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x221' }]
        })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x221',
              chainName: 'Flow Testnet',
              nativeCurrency: {
                name: 'FLOW',
                symbol: 'FLOW',
                decimals: 18
              },
              rpcUrls: ['https://testnet.evm.onflow.org'],
              blockExplorerUrls: ['https://testnet.flowscan.org']
            }]
          })
        }
      }

      // Get current chain ID to verify
      const chainId = await walletClient.getChainId()
      if (chainId !== 545) {
        throw new Error('Please switch to Flow Testnet')
      }

      // Prepare the contract write
      const { request } = await publicClient.simulateContract({
        account: user.wallet.address,
        address: '0x5a8E771b5D0B3d2e4d218478CB7C9029d00c4e5a',
        abi: wagmiAbi,
        functionName: 'depositFunds',
        args: [amountInWei],
        value: 0n,
      })

      // Execute the contract write
      const hash = await walletClient.writeContract({
        ...request,
        account: user.wallet.address,
      })

      setSuccess('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt)

      setSuccess('Funds deposited successfully!')
      setTimeout(() => navigate('/live-bets'), 2000)

    } catch (err) {
      console.error('Error depositing funds:', err)
      setError(err.message || 'Failed to deposit funds. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E6] to-[#FFEDCC] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold text-[#FF9900] mb-4">PrediMove</h1>
          <ConnectButton />
        </div>
        <div className="h-px bg-[#FFB84D]/60 w-full mt-4"></div>
      </div>

      {/* Purchase Form */}
      <div className="w-full max-w-xl mb-16">
        <div className="bg-white/80 rounded-2xl p-8 border-2 border-[#FFB84D]">
          <div className="flex items-center justify-center gap-3 mb-8">
            <FaShoppingCart className="text-[#FF9900] text-3xl" />
            <h2 className="text-2xl font-bold text-[#FF9900] text-center">Purchase Shares</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
            
            {/* Amount Input */}
            <div className="bg-white/80 p-5 rounded-xl border border-[#FFB84D]">
              <label className="block text-[#664400] font-semibold mb-2">
                Amount (MOVE)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#FFB84D] text-[#664400] placeholder-gray-500 focus:outline-none focus:border-[#FF9900] transition-colors"
                placeholder="Enter amount..."
                min="0"
                step="0.1"
              />
            </div>

            {/* Options */}
            <div className="bg-white/80 p-5 rounded-xl border border-[#FFB84D]">
              <label className="block text-[#664400] font-semibold mb-3">
                Choose Option
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedOption('yes')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all transform ${
                    selectedOption === 'yes'
                      ? 'bg-gradient-to-r from-[#FF9900] to-[#CC7A00] text-[#FF9900] border-[#FFB84D] scale-105'
                      : 'bg-white text-[#664400] border-[#FFB84D] hover:border-[#FF9900]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOption('no')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all transform ${
                    selectedOption === 'no'
                      ? 'bg-gradient-to-r from-[#FF9900] to-[#CC7A00] text-[#FF9900] border-[#FFB84D] scale-105'
                      : 'bg-white text-[#664400] border-[#FFB84D] hover:border-[#FF9900]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#FF9900] to-[#CC7A00] hover:from-[#CC7A00] hover:to-[#FF9900] 
                text-[#FF9900] font-bold py-3.5 px-6 rounded-xl border-2 border-[#FFB84D]/50 transition-all 
                transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Purchase Shares'}
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl">
        <div className="bg-white/80 rounded-2xl p-6 border-2 border-[#FFB84D] flex justify-between items-center px-16">
          <button 
            onClick={() => navigate('/live-bets')}
            className="flex flex-col items-center gap-2 text-[#664400]"
          >
            <FaChartLine size={32} />
            <span className="text-sm">Live Bets</span>
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-[#FF9900] hover:bg-[#CC7A00] text-[#FF9900] p-5 rounded-full transition-colors border-2 border-[#FFB84D]"
          >
            <FaPlus size={36} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 text-[#664400]"
          >
            <FaUser size={32} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuyBet