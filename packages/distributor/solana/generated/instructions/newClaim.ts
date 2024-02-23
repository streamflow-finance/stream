import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js";
import BN from "bn.js";
import * as borsh from "@coral-xyz/borsh";

import { PROGRAM_ID } from "../programId";

export interface NewClaimArgs {
  amountUnlocked: BN;
  amountLocked: BN;
  proof: Array<Array<number>>;
}

export interface NewClaimAccounts {
  /** The [MerkleDistributor]. */
  distributor: PublicKey;
  /** Claim status PDA */
  claimStatus: PublicKey;
  /** Distributor ATA containing the tokens to distribute. */
  from: PublicKey;
  /** Account to send the claimed tokens to. */
  to: PublicKey;
  /** Who is claiming the tokens. */
  claimant: PublicKey;
  /** The mint to claim. */
  mint: PublicKey;
  /** SPL [Token] program. */
  tokenProgram: PublicKey;
  /** The [System] program. */
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("amountUnlocked"),
  borsh.u64("amountLocked"),
  borsh.vec(borsh.array(borsh.u8(), 32), "proof"),
]);

export function newClaim(
  args: NewClaimArgs,
  accounts: NewClaimAccounts,
  programId: PublicKey = PROGRAM_ID
): TransactionInstruction {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.distributor, isSigner: false, isWritable: true },
    { pubkey: accounts.claimStatus, isSigner: false, isWritable: true },
    { pubkey: accounts.from, isSigner: false, isWritable: true },
    { pubkey: accounts.to, isSigner: false, isWritable: true },
    { pubkey: accounts.claimant, isSigner: true, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([78, 177, 98, 123, 210, 21, 187, 83]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      amountUnlocked: args.amountUnlocked,
      amountLocked: args.amountLocked,
      proof: args.proof,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
