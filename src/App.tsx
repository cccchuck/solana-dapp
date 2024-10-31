import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import Header from './components/header'
import { Tab, Tabs } from '@nextui-org/react'
import CreateToken from './components/create-token'
import MintToken from './components/mint-token'
import TransferToken from './components/transfer-token'

function App() {
  const [selectedKey, setSelectedKey] = useState<string>('create-token')
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  return (
    <div>
      <Header />
      <main className="p-4">
        {!publicKey ? (
          <h2 className="text-center text-xl font-bold">
            Please connect your wallet
          </h2>
        ) : (
          <>
            <Tabs
              selectedKey={selectedKey}
              onSelectionChange={(key) => setSelectedKey(key as string)}
            >
              <Tab key="create-token" title="Create Token">
                <CreateToken
                  connection={connection}
                  publicKey={publicKey}
                  sendTransaction={sendTransaction}
                />
              </Tab>
              <Tab key="mint-token" title="Mint Token">
                <MintToken
                  connection={connection}
                  publicKey={publicKey}
                  sendTransaction={sendTransaction}
                />
              </Tab>
              <Tab key="transfer-token" title="Transfer Token">
                <TransferToken
                  connection={connection}
                  publicKey={publicKey}
                  sendTransaction={sendTransaction}
                />
              </Tab>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

export default App
