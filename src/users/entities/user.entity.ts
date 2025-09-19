/**
 * User entity
 * Maps to the 'users' table in the database
 * Defines the structure and constraints for user data
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  /**
   * Primary key - auto-generated unique identifier
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User's full name
   * Maximum 255 characters
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * User's email address
   * Must be unique across all users
   * Maximum 255 characters
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /**
   * Timestamp when the user was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
