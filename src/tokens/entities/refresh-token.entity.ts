import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({name: 'refresh_tokens'})
@Unique(['userId', 'userAgent'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string; // jti

    @Column('uuid', {name: 'user_id'})
    userId: string;

    @ManyToOne(() => User, user => user.refreshTokens, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({name: 'hashed_token', type: 'text', unique: true, nullable: true})
    hashedToken: string | null;

    @Column({type: 'timestamptz', name: 'expires_at'})
    expiresAt: Date;

    @Column({type: 'timestamptz', name: 'revoked_at', nullable: true})
    revokedAt: Date | null;

    @Column('uuid', {name: 'replaced_by', nullable: true})
    replacedBy: string | null;

    @Column({name: 'user_agent', type: 'varchar', length: 255})
    userAgent: string;

    @Column({name: 'last_used_at', type: 'timestamptz', nullable: true})
    lastUsedAt: Date | null;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}