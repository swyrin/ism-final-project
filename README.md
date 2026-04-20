# What's this?

This is the group project for the course "Information System Management", commonly referred as:

- Management Information System (MIS)
- Hệ thống thông tin quản lý. (transliteration of course name)

## What's inside?

A `pnpm` monorepo containing:

- the `frontend`: user-facing portion.
  - React
  - React Router v7
  - Vite

- the `backend`: server portion
  - auth
  - "not quite AWS S3" (read: MinIO)
  - PostgreSQL ORM: Prisma
  
- both sides are wired through `better-auth`

## How's the code?

The code is nowhere good, but it serves its purposes *partially* well.

## Development

> Make sure `pnpm` is installed, RTFM where you deem fit.

```sh
pnpm install
pnpm dev
```

## Deployment

```sh
pnpm build
pnpm start
```

- Production website ran via `vite preview` are hosted at port **4**173, **hard number four**.
  - Remember to set appropriate CORS.
