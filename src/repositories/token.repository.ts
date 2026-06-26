import { TokenModel, ITokenDocument } from '../models/token.model';

export class TokenRepository {
  async create(userId: string, refreshToken: string, expiresAt: Date): Promise<ITokenDocument> {
    return TokenModel.create({ userId, refreshToken, expiresAt });
  }

  async findByToken(refreshToken: string): Promise<ITokenDocument | null> {
    return TokenModel.findOne({ refreshToken, isRevoked: false }).exec();
  }

  async revokeToken(refreshToken: string): Promise<void> {
    await TokenModel.findOneAndUpdate({ refreshToken }, { isRevoked: true }).exec();
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await TokenModel.updateMany({ userId, isRevoked: false }, { isRevoked: true }).exec();
  }

  async deleteExpired(): Promise<void> {
    await TokenModel.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
  }
}

export const tokenRepository = new TokenRepository();
