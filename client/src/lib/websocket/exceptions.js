const ConfigException = (message) => {
  this.message = message;
  this.name = 'ConfigException';
};

export { ConfigException as default };
