import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { pool } from "./db.js";
import { jwtSecret } from "./jwt.js";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      algorithms: ["HS256"],
    },
    async (payload, done) => {
      try {
        const [users] = await pool.execute(
          "SELECT id, nombre, email FROM usuarios WHERE id = ?",
          [payload.sub],
        );
        return done(null, users[0] || false);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export const authenticate = passport.authenticate("jwt", { session: false });

export default passport;
