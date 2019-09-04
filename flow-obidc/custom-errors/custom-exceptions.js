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



module.exports = {
    TemplatorConstraintError,
    FlowValueConstraintError,
    ReversibilityTestError,
};
