import { ObjectId } from 'mongoose';
import { Role } from 'src/modules/auth/enum/role.enum';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role[];
}
