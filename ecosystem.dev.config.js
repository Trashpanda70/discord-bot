module.exports = {
  apps: [
    {
      name: 'aigis',
      script: './index.js',
      watch: true,
      watch_options: {
        usePolling: true
      },
      env: {
        DEV: 1,
        NODE_ENV: 'development',
        NODE_EXTRA_CA_CERTS: "/home/mattw/projects/discord-bot-aigis/main.pem",
        TZ: "America/New_York"
      },
      ignore_watch: [
        './node_modules',
        '.gitignore',
        '**/temp',
        '.git',
        './images',
        './downloads',
        './logs',
        'data'
      ],
      log_type: 'raw',
    }
  ]
}