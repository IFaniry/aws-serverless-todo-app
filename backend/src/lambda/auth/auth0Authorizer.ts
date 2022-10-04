import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { JwksClient, CertSigningKey, RsaSigningKey } from 'jwks-rsa'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// jwksUri is from Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUri = 'https://dev-y5vfm-dl.us.auth0.com/.well-known/jwks.json'
// https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
const jwksClient = new JwksClient({ jwksUri })
function getKey(header, callback){
  jwksClient.getSigningKey(header.kid, function(_, key) {
    const signingKey = (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey

    callback(null, signingKey)
  });
}

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  function jwtVerify(token): Promise<JwtPayload> {
    return new Promise(function (resolve, reject) {
      verify(token, getKey, { algorithms: ["RS256"] }, function (err, decoded) {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
  }

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
  return jwtVerify(token)
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
