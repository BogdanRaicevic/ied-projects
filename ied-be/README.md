#Testing routes with with clerk

Go to any page, after you logged in
open devtools, go to console and run:

```js
await window.Clerk.session.getToken();
```

this will give you the bearer token that will last for 1 hour.
You can add that to postman.
