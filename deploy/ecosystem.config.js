module.exports = {
  apps: [
    {
      name: "auth-service",
      cwd: "/opt/apps/monorepo-course/services/auth-service",
      script: "dist/index.js",
      interpreter: "node",
      env_file: "/opt/apps/monorepo-course/deploy/.env.auth",
    },
    {
      name: "orders-service",
      cwd: "/opt/apps/monorepo-course/services/order-service",
      script: "dist/index.js",
      interpreter: "node",
      env_file: "/opt/apps/monorepo-course/deploy/.env.orders",
    },
    {
      name: "payments-service",
      cwd: "/opt/apps/monorepo-course/services/payments-service",
      script: "dist/index.js",
      interpreter: "node",
      env_file: "/opt/apps/monorepo-course/deploy/.env.payments",
    },
  ],
};
