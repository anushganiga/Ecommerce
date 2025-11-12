


<!-- Prisma Setup -->
npx prisma studio 
http://localhost:5555

| Step | Command                                        | Description                   |
| ---- | ---------------------------------------------- | ----------------------------- |
| 1    | `npm init -y`                                  | Create Node.js project        |
| 2    | `npm install prisma --save-dev @prisma/client` | Install Prisma                |
| 3    | `npx prisma init`                              | Initialize Prisma             |
| 4    | Edit `.env`                                    | Configure DB connection       |
| 5    | Define models in `schema.prisma`               | Define schema                 |
| 6    | `npx prisma migrate dev --name init`           | Apply DB migration            |
| 7    | Use PrismaClient in your code                  | Interact with DB              |
| 8    | `npx prisma studio`                            | View and manage data visually |

npx prisma db seed