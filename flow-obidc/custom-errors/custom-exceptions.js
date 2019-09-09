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
class StatusNon200 extends Error {
  constructor(...args) {
      super(...args)
      Error.captureStackTrace(this, StatusNon200);
  }
}

module.exports = {
    TemplatorConstraintError,
    FlowValueConstraintError,
    ReversibilityTestError,
};
