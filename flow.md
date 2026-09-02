"pnpm --filter api start:dev" for server
"pnpm --filter web dev" for frontend
"docker run --rm -d --name cairn-test-db -p 5433:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_DB=cairn_test postgres:17" 
for testing.


- setup nestjs scaffolding
- install dependencies, setup env, gitignore, add nestjs scaffolding, health route, remove hello world, alter the test for hello world, pin workspace ts for editor, update health controller test, handle bootstrap promise rejection
- deploy on render
- scaffold nextjs frontend and deploy on vercel
- setup neon project and env vars
- enable cors on the backend
- make project a monorepo and wire api and web into a pnpm workspace. 
- restructure feature folders, remove helloworld deadcode
- setup neon, setup prisma, seed data
- add env validation with joi
- add guest and google oauth 









