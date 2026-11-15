/**
 * Genera el hash de una contraseña con el mismo formato que usa la aplicación.
 *
 * Sirve para resetear una contraseña en desarrollo cuando se ha olvidado, ya
 * que todavía no hay recuperación por email. NO es un endpoint ni se ejecuta en
 * producción: es una herramienta local.
 *
 * Uso:
 *   npm run hash-password -- "mi-nueva-contraseña"
 *
 * Después, actualizar el usuario:
 *   psql -h 127.0.0.1 -U signajob -d signajob_dev -c "UPDATE users SET \"passwordHash\" = '<hash>', \"updatedAt\" = now() WHERE email = 'tu@email.com';"
 */
import { hashPassword } from "../lib/auth/password.ts";

const password = process.argv[2];

if (!password) {
  console.error('Falta la contraseña. Uso: npm run hash-password -- "mi-contraseña"');
  process.exit(1);
}

if (password.length < 10) {
  console.error("La aplicación exige al menos 10 caracteres.");
  process.exit(1);
}

console.log(await hashPassword(password));
