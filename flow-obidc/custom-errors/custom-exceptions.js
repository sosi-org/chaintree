// custom-errors
class TemplatorConstraintError extends Error {
  constructor(...args) {
      super(...args)
      Error.captureStackTrace(this, TemplateConstraintError)
  }
}
class FlowValueConstraintError extends Error {
  constructor(...args) {
      super(...args)
      Error.captureStackTrace(this, FlowValueConstraintError)
  }
}
class ReversibilityTestError extends Error {
  constructor(...args) {
      super(...args)
      Error.captureStackTrace(this, ReversibilityTestError)
  }
}


// lower level:

var HttpStatus = require('http-status-codes');
class StatusNon200 extends Error {
  constructor(status_code) {
      // 'Status other than 200: '
      const description = HttpStatus.getStatusText(status_code);
      super(`Status none-200: ${status_code} (${description})`);
      this.status_code = status_code;
      Error.captureStackTrace(this, StatusNon200);
  }
}

module.exports = {
    TemplatorConstraintError,
    FlowValueConstraintError,
    ReversibilityTestError,
    StatusNon200,
};
