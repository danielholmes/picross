// We need the shared path value!
import pkgInfo from './package.json';

export default {
  webpack(config, env, helpers, options) {
    // Rest of my config omitted
    // ...
    config.output = config.output || {};
    if (process.env.NODE_ENV === 'production') {
      config.output.publicPath = pkgInfo.publicPath;
    }
  }
}
