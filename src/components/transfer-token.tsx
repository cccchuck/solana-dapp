import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'

import { Connection } from '@solana/web3.js'
import Title from './title'
import { Button } from '@nextui-org/react'
import { Input } from '@nextui-org/react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getMint,
} from '@solana/spl-token'

type TransferTokenProps = {
  connection: Connection
  publicKey: PublicKey
  sendTransaction: ReturnType<typeof useWallet>['sendTransaction']
}

function TransferToken({
  connection,
  publicKey,
  sendTransaction,
}: TransferTokenProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTransferToken = async () => {
    if (!connection || !publicKey) return

    try {
      setIsLoading(true)
      const tokenMint = new PublicKey(tokenAddress)
      const { decimals } = await getMint(connection, tokenMint)
      const amountToTransfer = BigInt(amount) * BigInt(10 ** decimals)

      const sourceAssociatedTokenAddress = getAssociatedTokenAddressSync(
        tokenMint,
        publicKey
      )

      const destinationAssociatedTokenAddress = getAssociatedTokenAddressSync(
        tokenMint,
        new PublicKey(recipient)
      )

      const transaction = new Transaction().add(
        createTransferInstruction(
          sourceAssociatedTokenAddress,
          destinationAssociatedTokenAddress,
          publicKey,
          amountToTransfer
        )
      )

      const txHash = await sendTransaction(transaction, connection)
      toast.success(`Transaction sent: ${txHash}`)
    } catch (error) {
      toast.error(`${(error as Error).message} || Unknown error`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <Title
        title="Transfer Token"
        description="Transfer a token to another user"
      />
      <Input
        label="Token Address"
        size="sm"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <Input
        label="Amount"
        size="sm"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Input
        label="Recipient"
        size="sm"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Button
        color="primary"
        isLoading={isLoading}
        onClick={handleTransferToken}
      >
        Transfer Token
      </Button>
    </div>
  )
}

export default TransferToken
