import { ROLE, STATUS } from '@ganhealth/types';
import { UserResponseDto } from '@ganhealth/validation';

export type UserResponseSource = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Maps a user persistence record into the public API response shape. */
export function toUserResponse(user: UserResponseSource): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as ROLE,
    status: user.status as STATUS,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
    ...(user.profileImage ? { profileImage: user.profileImage } : {}),
  };
}
