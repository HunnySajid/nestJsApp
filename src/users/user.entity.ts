import {
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log(`New user created with id: ${this.id}`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`A user is updated with id: ${this.id}`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`A user is removed with id: ${this.id}`);
  }
}
