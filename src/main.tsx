import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { NextUIProvider } from '@nextui-org/react'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <App />
            <Toaster />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </NextUIProvider>
  </StrictMode>
)
