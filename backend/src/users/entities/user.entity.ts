import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../common/enums/ride-status.enum';
import { Wallet } from './wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  // One user <-> one TeslaPay wallet. Created alongside the user at signup.
  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;
}
