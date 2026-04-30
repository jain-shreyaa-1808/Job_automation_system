import { StatusCodes } from "http-status-codes";

import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const authService = new AuthService();

export const signup = asyncHandler(async (request, response) => {
  const result = await authService.signup(request.body);
  response.status(StatusCodes.CREATED).json(result);
});

export const login = asyncHandler(async (request, response) => {
  const result = await authService.login(
    request.body.email,
    request.body.password,
  );
  response.json(result);
});

export const me = asyncHandler(async (request, response) => {
  const user = await authService.getUserById(request.user!.sub);
  response.json({ user });
});
