module.exports = class CommandError extends Error {
  constructor (props) {
    super(props);
    this.name = 'CommandError';
    this.message = `${props.message}\n    at ${props.path}`;
  }
};
