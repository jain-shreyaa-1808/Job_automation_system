import bcrypt from "bcryptjs";

import { UserModel } from "../models/User.js";
import { AppError } from "../utils/app-error.js";
import { signAccessToken } from "../utils/jwt.js";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  currentCtc?: number;
  expectedCtc?: number;
  preferredRoles?: string[];
  preferredLocations?: string[];
};

export class AuthService {
  async signup(input: SignupInput) {
    const existing = await UserModel.findOne({
      email: input.email.toLowerCase(),
    });

    if (existing) {
      throw AppError.conflict("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({
      ...input,
      email: input.email.toLowerCase(),
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    return this.buildAuthResponse(user);
  }

  async getUserById(userId: string) {
    return UserModel.findById(userId).select("-passwordHash");
  }

  private buildAuthResponse(user: {
    _id: { toString(): string };
    email: string;
    fullName: string;
    currentCtc: number;
    expectedCtc: number;
    preferredRoles: string[];
    preferredLocations: string[];
    autoApplyEnabled: boolean;
  }) {
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        currentCtc: user.currentCtc,
        expectedCtc: user.expectedCtc,
        preferredRoles: user.preferredRoles,
        preferredLocations: user.preferredLocations,
        autoApplyEnabled: user.autoApplyEnabled,
      },
    };
  }
}
