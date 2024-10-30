import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'

function Header() {
  const [balance, setBalance] = useState(0)
  const { connection } = useConnection()
  const { publicKey, select } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    const updateBalance = async () => {
      if (!connection || !publicKey) return

      connection.onAccountChange(publicKey, async (accountInfo) => {
        const balance = accountInfo?.lamports
        if (balance) setBalance(balance / LAMPORTS_PER_SOL)
      })

      const balance = await connection.getBalance(publicKey)
      if (balance) setBalance(balance / LAMPORTS_PER_SOL)
    }
    updateBalance()
  }, [connection, publicKey])

  return (
    <header className="p-4 flex justify-between items-center">
      <h1 className="font-bold text-2xl">Solana DAPP</h1>
      {publicKey ? (
        <Dropdown>
          <DropdownTrigger>
            <Button color="primary" variant="light">
              <span className="font-bold flex flex-col items-center gap-1">
                <span className="text-xs text-foreground-600">
                  {balance} SOL
                </span>
                <span>
                  {publicKey.toString().slice(0, 4)}...
                  {publicKey.toString().slice(-4)}
                </span>
              </span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem
              key="disconnect"
              textValue="Disconnect"
              onClick={() => select(null)}
            >
              Disconnect
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button color="primary" onClick={() => setVisible(true)}>
          Connect
        </Button>
      )}
    </header>
  )
}

export default Header
