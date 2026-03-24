import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnection from "@/utils/Connection";
import UserModel from "@/models/userModel";

export async function POST(request: Request) {
  await dbConnection();

  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
          success: false,
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already exists with this email",
          success: false,
        },
        { status: 409 }
      );
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({
        username: trimmedUsername,
        email: normalizedEmail,
        password: hashedPassword
    });

    return NextResponse.json({
        message: "User signup successful",
        success: true
    },{status: 201})

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}