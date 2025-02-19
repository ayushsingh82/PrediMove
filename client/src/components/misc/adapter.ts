import { NightlyConnectAptosAdapter } from '@nightlylabs/wallet-selector-aptos'

let _adapter: NightlyConnectAptosAdapter | undefined
export const getAdapter = async (persisted = true) => {
  try {
    if (_adapter) return _adapter
    _adapter = await NightlyConnectAptosAdapter.build({
      appMetadata: {
        name: 'PrediMove',
        description: 'Prediction Market on MovementLabs',
        icon: 'https://docs.nightly.app/img/logo.png',
      },
      persistent: persisted,
    })
    return _adapter
  } catch (error) {
    console.error('Error initializing adapter:', error)
    throw error
  }
}