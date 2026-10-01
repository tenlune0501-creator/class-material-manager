"use server";

/**
 * 로그인 · 로그아웃.
 *
 * 회원가입은 만들지 않습니다 — 계정은 Supabase 쪽에서 미리 만들어 둔 것만 씁니다.
 */
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/url";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 로그인 전에 보려던 화면으로 돌아간다. 폼 값은 사용자가 조작할 수 있으므로 여기서
  // 다시 검증한다 — 외부 주소·//host·/api 등은 전부 거부되고 / 로 간다(Open Redirect 방지).
  redirect(safeNextPath(formData.get("next")) ?? "/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
