import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import { getAdapter } from './misc/adapter'
import { AccountInfo, UserResponseStatus ,Network } from "@aptos-labs/wallet-standard"


function Home() {
  const navigate = useNavigate()
  const [userAccount, setUserAccount] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const networkInfo = {
    chainId: 27,
    name: Network.CUSTOM,
    url: "https://aptos.testnet.suzuka.movementlabs.xyz/v1",
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        const adapter = await getAdapter()
        if (await adapter.canEagerConnect()) {
          try {
            const response = await adapter.connect()
            if (response.status === UserResponseStatus.APPROVED) {
              setUserAccount(response.args)
            }
          } catch (error) {
            console.error('Connection error:', error)
            await adapter.disconnect().catch(() => {})
          }
        }

        // Events
        adapter.on("connect", (accInfo) => {
          if (accInfo && "address" in accInfo) {
            setUserAccount(accInfo)
          }
        })

        adapter.on("disconnect", () => {
          setUserAccount(undefined)
        })

        adapter.on("accountChange", (accInfo) => {
          if (accInfo && "address" in accInfo) {
            setUserAccount(accInfo)
          }
        })
      } catch (error) {
        console.error('Initialization error:', error)
        toast.error('Failed to initialize wallet connection')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleConnect = async () => {
    const adapter = await getAdapter()
    try {
      const response = await adapter.connect()
      if (response.status === UserResponseStatus.APPROVED) {
        setUserAccount(response.args)
        toast.success("Wallet connected!")
      } else {
        toast.error("User rejected connection")
      }
    } catch (error) {
      toast.error("Wallet connection failed!")
      await adapter.disconnect().catch(() => {})
    }
  }

  const handleDisconnect = async () => {
    try {
      const adapter = await getAdapter()
      await adapter.disconnect()
      setUserAccount(undefined)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7E6] to-[#FFEDCC] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">
            🚀 🎯 🎊
          </div>
          <h1 className="text-3xl md:text-3xl font-bold text-[#FF9900] mb-8">
            PrediMove
          </h1>
          <p className="text-xl text-[#664400] mb-12">
            <span className="px-4 py-2 rounded-lg text-sm font-bold">
              Prediction market on MovementLabs powered by eliza AI <br/> and polymarket insights.
            </span>

            <hr className='mt-[10px] mb-[10px] border-[#FFB84D]/30'/>
            
            <span className="bg-[#FF9900] px-4 py-2 rounded-lg mt-[20px] text-lg text-white">
              Predict the future and earn rewards.
            </span>
          </p>
          <div className="flex justify-center gap-4">
            <div 
              onClick={!isLoading && (userAccount ? handleDisconnect : handleConnect)}
              className={`bg-[#FFB84D] rounded-2xl p-2 cursor-pointer hover:bg-[#CC7A00] transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Initializing...' : 
                userAccount ? 
                  `Connected: ${userAccount.address.toString().slice(0,6)}...${userAccount.address.toString().slice(-4)}` 
                  : 'Connect Wallet'
              }
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className="bg-[#FF9900] text-white font-bold py-3 px-8 rounded-2xl border-2 border-[#FF9900] hover:bg-[#CC7A00] hover:border-[#CC7A00] transition-colors text-xl"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
