// Creates ADMIN_PASSWORD_HASH for the admin password login. The password is read from the terminal
// (not from arguments, so it stays out of shell history). Paste the printed value into
// Cloudflare Pages → Settings → Variables and Secrets as the secret ADMIN_PASSWORD_HASH.
//   node scripts/hash-admin-password.mjs
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

const ITERATIONS = 100_000; // Cloudflare Workers' PBKDF2 limit
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => rl.output.write(s.includes("Admin password") ? s : "*");
rl.question("Admin password (min 12 characters): ", (password) => {
  rl.close();
  process.stdout.write("\n");
  if (password.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  console.log(`pbkdf2-sha256$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`);
  console.log("\nAlso set SESSION_SECRET to a random value, e.g.:", randomBytes(32).toString("base64url"));
});
