import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tesla } from '../../teslas/entities/tesla.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ default: false })
  isOnline: boolean;

  // A driver owns exactly one Tesla in this MVP (1:1). JoinColumn lives here
  // so `driver.tesla` is directly loadable without a second query.
  @OneToOne(() => Tesla, (tesla) => tesla.driver, { cascade: true, nullable: true })
  @JoinColumn()
  tesla: Tesla;
}
