## UI Server

The current UI requires Clerk for authentication. You can create a free Clerk account from [here](https://clerk.com/docs/quickstarts/setup-clerk). You can also skip the Clerk setup by disabling it from the code.

First, create a `.env` file inside this directory and add the following variables to the `.env` file.

```
LOG_LEVEL=info

# Clerk related environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<CLERK_SECRET_KEY>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

1. Build environment

```bash
npm install
```

2. Start UI

```bash
npm run dev
```