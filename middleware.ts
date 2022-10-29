// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import axios from 'axios';
import * as jose from 'jose';
import jwkToPem from "jwk-to-pem";



class CognitoExpress {
  userPoolId: any;
  tokenUse: any;
  tokenExpiration: any;
  iss: any;
  hasFinishedProcessing: any;
  pems: any;

  constructor(config: any) {
    if (!config)
      throw new TypeError(
        "Options not found. Please refer to README for usage example at https://github.com/ghdna/cognito-express"
      );

    if (configurationIsCorrect(config)) {
      this.userPoolId = config.cognitoUserPoolId;
      this.tokenUse = config.tokenUse;
      this.tokenExpiration = config.tokenExpiration || 3600000;
      this.iss = `https://cognito-idp.${config.region}.amazonaws.com/${this.userPoolId}`;
      this.hasFinishedProcessing = this.init();
      this.pems = {};
    }
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios(`${this.iss}/.well-known/jwks.json`);
        if (response.data.keys) {
          const keys = response.data.keys;
          for (let i = 0; i < keys.length; i++) {
            let key_id = keys[i].kid;

            let modulus = keys[i].n;
            let exponent = keys[i].e;
            let key_type = keys[i].kty;
            let jwk = {
              kty: key_type,
              n: modulus,
              e: exponent,
            };
            let pem = jwkToPem(jwk);
            this.pems[key_id] = pem;
          }
          resolve(null);
        }
      } catch (err) {
        console.error(err);
        reject("Unable to generate certificate due to \n" + err);
      }
    });
  }

  async validate(token: string, callback: any) {
    await this.hasFinishedProcessing;
    return new Promise(async (resolve, reject) => {
      let decodedJwt = jose.decodeJwt(token);
      try {
        if (!decodedJwt) throw new TypeError("Not a valid JWT token");

        if (decodedJwt.iss !== this.iss)
          throw new TypeError("token is not from your User Pool");

        if (decodedJwt.token_use !== this.tokenUse)
          throw new TypeError(`Not an ${this.tokenUse} token`);

        let kid = decodedJwt.jti;
        let pem = this.pems[kid!];

        if (!pem) throw new TypeError(`Invalid ${this.tokenUse} token`);

        const result = jose.jwtVerify(token, pem, {
          issuer: this.iss,
        });
        if (callback) {
          callback(null, result);
        } else {
          resolve(result);
        }
      } catch (error) {
        console.error(error);
        if (callback) {
          callback(error, null);
        } else {
          reject(error);
        }
      }
    });
  }
}

function configurationIsCorrect(config: any) {
  let configurationPassed = false;
  switch (true) {
    case !config.region:
      throw new TypeError("AWS Region not specified in constructor");

    case !config.cognitoUserPoolId:
      throw new TypeError(
        "Cognito User Pool ID is not specified in constructor"
      );

    case !config.tokenUse:
      throw new TypeError(
        "Token use not specified in constructor. Possible values 'access' | 'id'"
      );

    case !(config.tokenUse == "access" || config.tokenUse == "id"):
      throw new TypeError(
        "Token use values not accurate in the constructor. Possible values 'access' | 'id'"
      );

    default:
      configurationPassed = true;
  }
  return configurationPassed;
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // return NextResponse.next();
  // return NextResponse.redirect(new URL('/unauthorized', request.url))
  const cognito = new CognitoExpress({
    region: "ap-south-1",
    cognitoUserPoolId: "ap-south-1_8Ylepg5f1",
    tokenUse: "access",
    tokenExpiration: 3600000,
  });
  cognito.validate(request.headers.get("access-token") as string, (err: any, response: any) => {
    if (err) {
      console.log("------")
      console.log(err)
      console.log("------")
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    return NextResponse.next();
  })
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
}
