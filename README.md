## Installation 
- `npm ci`

## Dev server start
- `npm run dev`

## Prod server start
- `npm start` @todo still needs work

## @TODO
I exhausted the 4 hours that you left me. 
I did not : 
- install a testing suite, but I would go for Jest + Jasmine or Mocha for unit tests
For functional testing, I did not do my research but I think it is a must for an API. However, since
we are here working mainly with external providers, we do not have full control over the data. Functional testing
lose here a bit of interest.
- install a code linter (ESLint) 
- install TypeScript (might be tricky with some libs, but worth the shot with code autocompletion and type checking)
- install tools as commitizen or husky
- do profiling.

I choosed Node.JS as a solution mainly because of ease to send parallel API request.

## Bonus
### We would like to be able to cache and reuse results. Be aware that the response can be quite big / huge.
- There are multiple layers of cache. Here we could be concerned by a Proxy Cache and Database Caching
- Proxy Cache : Varnish can be a solution to prevent the nodeJS server from being called, and serve the 
same response across users for the same (query) parameters. It might become tricky with user authentication.
- Database Caching : Redis can be a solution to store API calls to providers or the response calculated itself.
- Caching for short periods might be a best fit since we rely on different APIs with data flows highly variable.
- Varnish and Redis are highly scalable. The response being huge, the server infrastructure can be scaled horizontally
- Another performance trick, not by caching, but by paginating results or limiting combination could be a lead.
### We would like to be able to perform searches using a search radius. See "Bonus // Search radius" paragraph
- Elasticsearch could be an answer. It has built-in functionalities that answer perfectly to the "Bonus // Search radius"
problematic
### We would like the endpoint to be secured
- As far as I know, in NodeJS we can implement api guard thanks to middlewares
- https://github.com/jaredhanson/passport is a well known library
- Depending of the needs, the authentication strategy will be chosen.
### Beyond security, we need to be able to identify a user
- The user must register,
- When authenticated, we can retrieve his informations with a database query or (JWT) payload infos.
### Once security and identification in place, we need to be able to rate limit this API. The limit is up to you.
- Depending of the needs, https://github.com/SGrondin/bottleneck can be a solution. 
### How you would deploy this in production.
- First of all, I am no expert in server infrastructurey. Wild guess is : 
1 - Adapt depending the needs : it is a small business, I would go for a installation directly on a server, with
nginx acting as a proxy. 
2 - It is a bigger business, I would go for a docker container to ease the scalability. With 
the demand rapidly increasing, we can scale it on multiple instances load balanced.
### What technologies would you use to have a CI/CD running
- I am no expert either in CI/CD.
- From my experience, Jenkins can be a solution as everything can be coded with differents languages, for specific
needs. But from what I saw, it looks a bit dusty. 
