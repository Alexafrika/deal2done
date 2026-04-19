import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  console.log("REGISTER_START");

  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Пароль минимум 8 символов" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: full_name,
        role: role?.toUpperCase() === "SUPPLIER" ? "SUPPLIER" : "BUYER",
      },
    });

    const token = await signToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.toLowerCase(),
        kycStatus: null,
      },
    });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("REGISTER_ROUTE_ERROR", error);

    if (error instanceof Error) {
      console.error("REGISTER_ROUTE_MESSAGE", error.message);
      console.error("REGISTER_ROUTE_STACK", error.stack);
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}
