import { APP_NAME, greet, type User } from "@fake-goes-party/shared";

const user: User = { id: "1", name: "Bun" };
console.log(greet(user.name));
console.log(`Server running for ${APP_NAME}`);
