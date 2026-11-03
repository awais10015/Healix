"use server";

import mongoose from "mongoose";
import User from "../modals/user.modal";
import { connect } from "@/lib/db";
import {
  isEmailDuplicateKeyError,
  isMongoDuplicateKeyError,
  reconcileUserIndexes,
} from "@/lib/reconcile-user-indexes";

interface CreateUserInput {
  email: string;
  passwordHash: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  role?: "doctor" | "patient";
}

export async function createUser(user: CreateUserInput) {
  try {
    await connect();

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return null;
    }

    const payload = {
      email: user.email,
      passwordHash: user.passwordHash,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      ...(user.photo ? { photo: user.photo } : {}),
    };

    try {
      const newUser = await User.create(payload);
      return JSON.parse(JSON.stringify(newUser));
    } catch (createErr) {
      if (
        !isMongoDuplicateKeyError(createErr) ||
        isEmailDuplicateKeyError(createErr)
      ) {
        throw createErr;
      }
      await reconcileUserIndexes(mongoose);
      const newUser = await User.create(payload);
      return JSON.parse(JSON.stringify(newUser));
    }
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
}
