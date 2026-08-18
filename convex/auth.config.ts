// Tells Convex to trust JWTs minted by Clerk. The domain is the Clerk instance
// "Issuer" URL (Clerk dashboard → JWT Templates → the `convex` template).
// applicationID must match that template's name: `convex`.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
