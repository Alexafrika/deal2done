import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Введите email и пароль" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { kyc: { select: { status: true } } },
    });

    if (!user) {
      // Use constant-time check to avoid user enumeration
      await bcrypt.compare(password, "$2b$12$invalidhashforenumerationprotect");
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.toLowerCase(),
        kycStatus: user.kyc?.status ?? null,
      },
    });
    setSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
