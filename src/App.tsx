import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { useState } from 'react'
import Header from './components/header'
import { Button, Input } from '@nextui-org/react'
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata'
import { toast } from 'sonner'

function App() {
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState('')
  const [tokenMint, setTokenMint] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const handleCreateToken = async () => {
    if (!connection || !publicKey) return

    setIsLoading(true)

    try {
      const programId = TOKEN_PROGRAM_ID
      const keypair = Keypair.generate()
      const newAccountPubkey = keypair.publicKey
      const lamports = await getMinimumBalanceForRentExemptMint(connection)

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey,
          space: MINT_SIZE,
          lamports,
          programId,
        }),
        createInitializeMint2Instruction(
          keypair.publicKey,
          parseInt(tokenDecimals),
          publicKey,
          null,
          programId
        )
      )

      // Create the token mint
      const txid = await sendTransaction(transaction, connection, {
        signers: [keypair],
      })

      await connection.confirmTransaction(txid, 'confirmed')

      const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      )

      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          newAccountPubkey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      const metadataData = {
        name: tokenName,
        symbol: tokenSymbol,
        uri: 'https://arweave.net/1234',
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      }

      const metadataTransaction = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataPDA,
            mint: newAccountPubkey,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              collectionDetails: null,
              data: metadataData,
              isMutable: true,
            },
          }
        )
      )

      // Create the token metadata
      await sendTransaction(metadataTransaction, connection)

      toast.success('Token created successfully')
      setTokenMint(newAccountPubkey.toBase58())
    } catch (error) {
      toast.error(`Error creating token: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <main className="p-4">
        {!publicKey ? (
          <h2 className="text-center text-xl font-bold">
            Please connect your wallet
          </h2>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-xl font-bold">Create Your SPL Token</h2>
            <p className="text-sm text-foreground-600">
              Create your own SPL token with a custom name and symbol.
            </p>
            <Input
              disabled={isLoading}
              label="Token Name"
              size="sm"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
            <Input
              disabled={isLoading}
              label="Token Symbol"
              size="sm"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
            />
            <Input
              disabled={isLoading}
              label="Token Decimals"
              size="sm"
              value={tokenDecimals}
              onChange={(e) => setTokenDecimals(e.target.value)}
            />
            <Button
              color="primary"
              isLoading={isLoading}
              onClick={handleCreateToken}
            >
              Create Token
            </Button>
            {tokenMint && (
              <p className="text-sm text-foreground-600">
                Create Token Success! You can find details at{' '}
                <a
                  href={`https://explorer.solana.com/address/${tokenMint}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tokenMint}
                </a>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
