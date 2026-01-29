# Supabase SSRパッケージへの移行ガイド

## 変更内容

`@supabase/auth-helpers-nextjs`は非推奨（deprecated）のため、`@supabase/ssr`パッケージに移行しました。

## パッケージの更新

以下のコマンドを実行してください：

```bash
cd Master-Portfolio-DB\math-challenge-50
npm uninstall @supabase/auth-helpers-nextjs
npm install @supabase/ssr
```

## コードの変更点

### 1. クライアントサイド（`lib/supabaseClient.ts`）

**変更前:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createSupabaseClient = () => {
  return createClientComponentClient()
}
```

**変更後:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. サーバーサイド（`lib/supabaseServer.ts`）

**変更前:**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createSupabaseServerClient = () => {
  return createServerComponentClient({ cookies })
}
```

**変更後:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからの呼び出しは無視
          }
        },
      },
    }
  )
}
```

## 次のステップ

1. パッケージを更新：
   ```bash
   npm uninstall @supabase/auth-helpers-nextjs
   npm install @supabase/ssr
   ```

2. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

## 参考

- [Supabase SSR パッケージ公式ドキュメント](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Auth HelpersからSSRパッケージへの移行ガイド](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
