import { Button, Input } from '@nextui-org/react'
import Title from './title'
import { useState } from 'react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountError,
} from '@solana/spl-token'
import { toast } from 'sonner'

type MintTokenProps = {
  connection: Connection
  publicKey: PublicKey
  sendTransaction: ReturnType<typeof useWallet>['sendTransaction']
}

function MintToken({ connection, publicKey, sendTransaction }: MintTokenProps) {
  const [tokenMint, setTokenMint] = useState('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMintToken = async () => {
    if (!connection || !publicKey) return

    if (!tokenMint || !amount || !recipient) {
      toast.error('Please fill in all fields')
      return
    }

    if (!PublicKey.isOnCurve(recipient)) {
      toast.error('Invalid recipient address')
      return
    }

    try {
      setIsLoading(true)

      const tokenMintAddress = new PublicKey(tokenMint)
      const recipientAddress = new PublicKey(recipient)

      const { decimals } = await getMint(connection, tokenMintAddress)
      const amountToMint = BigInt(amount) * BigInt(10 ** decimals)

      const destinationAssociatedTokenAddress = getAssociatedTokenAddressSync(
        tokenMintAddress,
        recipientAddress
      )

      try {
        await getAccount(connection, destinationAssociatedTokenAddress)
      } catch (error) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountError
        ) {
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              destinationAssociatedTokenAddress,
              recipientAddress,
              tokenMintAddress
            )
          )
          await sendTransaction(transaction, connection)
        }
      }

      const transaction = new Transaction().add(
        createMintToInstruction(
          tokenMintAddress,
          destinationAssociatedTokenAddress,
          publicKey,
          amountToMint,
          [],
          TOKEN_PROGRAM_ID
        )
      )

      await sendTransaction(transaction, connection)
      toast.success('Token minted successfully')
    } catch (error) {
      toast.error(`Error minting token: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <Title title="Mint Token" description="Mint your own SPL token." />
      <Input
        label="Token Mint"
        size="sm"
        value={tokenMint}
        onChange={(e) => setTokenMint(e.target.value)}
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
      <Button color="primary" isLoading={isLoading} onClick={handleMintToken}>
        Mint Token
      </Button>
    </div>
  )
}

export default MintToken
