module.exports = {
  apps: [
    {
      name: "BE",
      cwd: "./ied-be",
      script: "pnpm",
      args: "run start",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      restart_delay: 5000,
    },
    {
      name: "FE",
      cwd: "./ied-fe",
      script: "pnpm",
      args: "run preview",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      restart_delay: 5000,
    },
  ],
};
