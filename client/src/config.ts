// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ygnt2wvq48'

export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
// export const apiEndpoint = `http://localhost:5000/dev`

// Auth0 Config
export const authConfig = {
  domain: 'dev-y5vfm-dl.us.auth0.com',
  clientId: 'pNvL6d1Ja34S796hD5O2wguvkP0oGYoh',
  callbackUrl: 'http://localhost:3000/callback',
}
