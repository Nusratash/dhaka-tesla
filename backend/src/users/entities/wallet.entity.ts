import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Stored as integer poysha (1 BDT = 100 poysha) - never a float - so
  // fare/wallet math never suffers binary floating point rounding drift.
  @Column({ type: 'bigint', default: 0 })
  balancePoysha: number;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
