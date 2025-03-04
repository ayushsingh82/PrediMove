import React, { useState } from 'react'
// import { ConnectButton } from './ConnectButton'
import { FaChartLine, FaPlus, FaUser, FaQuestionCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
// import { publicClient, getWalletClient, chainConfig } from '../config'
import { wagmiAbi } from '../abi'
import { usePrivy } from '@privy-io/react-auth'
import { createWalletClient ,custom } from 'viem'
// import { flowTestnet } from 'viem/chains'
import { parseGwei } from 'viem'
import { createPublicClient , http } from 'viem'
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




function Create() {
  const navigate = useNavigate()
  const { user } = usePrivy()
  
  const [question, setQuestion] = useState('')
  const [option1, setOption1] = useState('Yes')
  const [option2, setOption2] = useState('No')
  const [endTime, setEndTime] = useState('')
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
        functionName: 'submitQuestion',
        args: [question],
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

      setSuccess('Prediction created successfully!')
      setTimeout(() => navigate('/live-bets'), 2000)

    } catch (err) {
      console.error('Error creating prediction:', err)
      setError(err.message || 'Failed to create prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E6] to-[#FFEDCC] flex flex-col items-center justify-center p-8">
      {/* Header with Wallet Connection */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold text-[#FF9900] mb-4">PrediMove</h1>
          <ConnectButton />
        </div>
        <div className="h-px bg-[#FFB84D]/60 w-full mt-4"></div>
      </div>

      {/* Create Form */}
      <div className="w-full max-w-xl mb-16">
        <div className="bg-white/80 rounded-2xl p-8 border-2 border-[#FFB84D]">
          <div className="flex items-center justify-center gap-3 mb-8">
            <FaQuestionCircle className="text-[#FF9900] text-3xl" />
            <h2 className="text-2xl font-bold text-[#FF9900] text-center">Create New Prediction</h2>
          </div>
          
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div className="bg-white/80 p-5 rounded-xl border border-[#FFB84D]">
              <label className="block text-[#664400] font-semibold mb-2">
                What's your prediction?
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#FFB84D] text-[#664400] placeholder-gray-500 focus:outline-none focus:border-[#FF9900] transition-colors"
                placeholder="E.g., Will Bitcoin reach $100k?"
                rows="2"
                required
              />
            </div>

            {/* Options */}
            <div className="bg-white/80 p-5 rounded-xl border border-[#FFB84D]">
              <label className="block text-[#664400] font-semibold mb-3">
                Prediction Options
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#664400] mb-2">Option 1</div>
                  <input
                    type="text"
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#FFB84D] text-[#664400] placeholder-gray-500 focus:outline-none focus:border-[#FF9900] transition-colors"
                    placeholder="Yes"
                  />
                </div>
                <div>
                  <div className="text-xs text-[#664400] mb-2">Option 2</div>
                  <input
                    type="text"
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#FFB84D] text-[#664400] placeholder-gray-500 focus:outline-none focus:border-[#FF9900] transition-colors"
                    placeholder="No"
                  />
                </div>
              </div>
            </div>

            {/* End Time */}
            <div className="bg-white/80 p-5 rounded-xl border border-[#FFB84D]">
              <label className="block text-[#664400] font-semibold mb-2">
                When will this prediction end?
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#FFB84D] text-[#664400] placeholder-gray-500 focus:outline-none focus:border-[#FF9900] transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#FF9900] to-[#CC7A00] hover:from-[#CC7A00] hover:to-[#FF9900] 
                text-white font-bold py-3.5 px-6 rounded-xl border-2 border-[#FFB84D]/50 transition-all 
                transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Prediction...' : 'Create Prediction'}
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl mt-8">
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
            className="bg-[#FF9900] hover:bg-[#CC7A00] text-white p-5 rounded-full transition-colors border-2 border-[#FFB84D]"
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

export default Create