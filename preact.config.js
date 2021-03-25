module.exports = function (config, env) {
  config.resolve.modules.push(env.src);
};
