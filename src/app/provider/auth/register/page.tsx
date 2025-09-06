"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthApiClient } from "@/lib/auth-client";

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const api = new AuthApiClient();
      // Note: default register creates USER; provider onboarding may be admin-approved
      await api.register({ email, password, name });
      router.push("/provider/auth/login");
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Provider Sign Up</h1>
        <p className="text-sm text-gray-600 mb-4">Create your provider account</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-700">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating...' : 'Create account'}</Button>
        </form>
        <div className="mt-4 text-xs text-gray-600">
          After signup, contact support to upgrade your account to PROVIDER.
        </div>
      </div>
    </div>
  );
}
