import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwtCertificate = `-----BEGIN CERTIFICATE-----
MIIC/TCCAeWgAwIBAgIJXEv7oFqpTOM7MA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMTEXJ5LWZzbmQuYXV0aDAuY29tMB4XDTIwMDUxNzE3MDMxNloXDTM0MDEyNDE3
MDMxNlowHDEaMBgGA1UEAxMRcnktZnNuZC5hdXRoMC5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQDtW1eczfd5gnMpZebxID4OLoxYk5Yu8QF1xD3I
p2XkbExJ7t3SSXGn2VcZITHbWruVcTLNfho6sFtJe40LhR0/uu2+Yi4tVNLlNzwz
uCgoonNIXk2xn/ozFwrdQewMDgDT6ZqKDU1MfHslEXD1MimUcfefAqns6Q1r6NGM
Bp0x3PyIz12g+SQVrf3m00aH/6ieE9UBoWt417b+f9G4k4TBGcoeZdN+OC3UQESk
BoyCPENqRIHIH0zv7TEd8bNtb/Cj1YLxEE2KevqVKcownU9Q0P7U4cai5cuu8594
4j41opDUM+XldJbDmEHCaWgNbhlpywP1/crBLS6H4ptZv0/dAgMBAAGjQjBAMA8G
A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFOWOYgdcNUv3Rwuqa9/2vGZIjbbaMA4G
A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAj5HvaVfcdvDZyvi23u29
6AEPSuwVDDCsFdYgglIR2cXuTE2BUYl9xIi0/7QtpFGwVBRxXEXI5fKNhDMk+drl
/AMt3c16s1RQPgKQzh4yNTerhdb56aWnndBcytV22+UwGJcNPIJ3m04iGOMiBf2Z
JWyqD+7vvJ0rQ4rldaC2L1UW92ZFqB0C5GFB4nY8CTp6tcBL9cFaleVa7xTGkNNc
PjUWJZutWoLTYTvzqjNyVPJUiqzlEKubc8ixIrScxCO/JRcHyYILOEEKqpJUm85G
69D8Vlqc+NILhWDGIfWIiHZg1nMHtFFo+NQxi15tlfxc/v7IhRdDFGqx42Qxbbp3
IA==
-----END CERTIFICATE-----`

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
  logger.info('Verifying Token')
  return verify(token, jwtCertificate, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
