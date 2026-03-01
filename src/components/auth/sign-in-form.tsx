'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ActionState = { error: string } | undefined

export function SignInForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signIn, undefined)

  return (
    <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your household account</p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div>
          <Label htmlFor="email" className="mb-1">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password" className="mb-1">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
          Create one
        </Link>
      </p>
    </div>
  )
}
