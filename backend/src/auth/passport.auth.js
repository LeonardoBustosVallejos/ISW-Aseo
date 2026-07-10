"use strict";
import passport from "passport";
import User from "../entity/user.entity.js";
import TrabajadorSchema from "../entity/trabajador.entity.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: ACCESS_TOKEN_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const trabajadorRepository = AppDataSource.getRepository(TrabajadorSchema);
      let accountFound = await userRepository.findOne({
        where: {
          email: jwt_payload.email,
        },
        relations: ["rol"]
      });

      if (!accountFound) {
        accountFound = await trabajadorRepository.findOne({
          where: {
            email: jwt_payload.email,
          },
          relations: ["rol"]
        });
      }

      if (accountFound) {
        return done(null, accountFound);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.error("Error en Passport JWT Strategy:", error);
      return done(error, false);
    }
  }),
);

export function passportJwtSetup() {
  passport.initialize();
}