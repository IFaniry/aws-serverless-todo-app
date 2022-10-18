import 'source-map-support/register'
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import { JwksClient, CertSigningKey, RsaSigningKey } from 'jwks-rsa'
import { JwtHeader, SigningKeyCallback, verify } from 'jsonwebtoken'

import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// jwksUri is from Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUri = 'https://dev-y5vfm-dl.us.auth0.com/.well-known/jwks.json'
// https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
const jwksClient = new JwksClient({ jwksUri })
function getKey(header: JwtHeader, callback: SigningKeyCallback): void {
  jwksClient.getSigningKey(header.kid, function(_, key) {
    const signingKey = (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey

    callback(null, signingKey)
  });
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub as string,
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
    logger.error('User not authorized', { error: (e as Error).message })

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

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  function jwtVerify(token: string): Promise<JwtPayload> {
    return new Promise(function (resolve, reject) {
      verify(token, getKey, { algorithms: ["RS256"] }, function (err, decoded) {
        if (err) {
          reject(err)
        } else {
          resolve(decoded as JwtPayload)
        }
      })
    })
  }

  // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
  return jwtVerify(token)
}
