module.exports = {
  apps: [
    {
      name: 'kcca-ims-backend',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      }
    }
  ]
};
