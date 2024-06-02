READ ME stuff

1. how to start a server
   `deno task dev`

2. how to set up launch json
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "request": "launch",
         "name": "deno BE",
         "type": "node",
         "program": "${workspaceFolder}/ied-be/server.ts",
         "cwd": "${workspaceFolder}/ied-be",
         "env": {},
         "runtimeExecutable": "C:\\Users\\bogdan\\.deno\\bin\\deno.EXE",
         "runtimeArgs": ["run", "--inspect-wait", "--allow-all"],
         "attachSimplePort": 9229
       }
     ]
   }
   ```
