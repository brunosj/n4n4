/**
 * PM2 process definition for the Astro Node (standalone) server.
 * Port: set PORT when running deploy.sh, or change the fallback below.
 */
module.exports = {
  apps: [
    {
      name: 'mef-website',
      cwd: __dirname,
      script: 'dist/server/entry.mjs',
      interpreter: process.env.NODE_BIN || 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        HOST: process.env.HOST || '0.0.0.0',
        PORT: process.env.PORT || '4322',
        KEYSTATIC_BASIC_AUTH_USER:
          process.env.KEYSTATIC_BASIC_AUTH_USER || 'editor',
        KEYSTATIC_BASIC_AUTH_PASSWORD:
          process.env.KEYSTATIC_BASIC_AUTH_PASSWORD,
      },
    },
  ],
};
