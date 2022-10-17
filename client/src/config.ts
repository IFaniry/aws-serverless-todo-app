// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'iru3qefp8k'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-y5vfm-dl.us.auth0.com',            // Auth0 domain
  clientId: 'pNvL6d1Ja34S796hD5O2wguvkP0oGYoh',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
