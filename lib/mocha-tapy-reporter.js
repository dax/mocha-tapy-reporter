var Base = require('mocha').reporters.Base,
    util = require('util');

exports = module.exports = TAPY;

function onStart(runner) {
  var total = runner.grepTotal(runner.suite),
      now = new Date(),
      result = util.format('---\ntype: suite\nrev: 4\nstart: %d-%d-%d %d:%d:%d\ncount: %d',
                           now.getFullYear(), now.getMonth(), now.getDay(),
                           now.getHours(), now.getMinutes(), now.getSeconds(),
                           total);
  console.log(result);
  return result;
}

function onEnd(runner) {
  var stats = this.stats,
      result = util.format('---\ntype: final\ncounts:\n  fail: %d\n  error: %d\n  omit: %d\n  todo: %d\n  total: %d\n  pass: %d\ntime: %d\n...',
                           stats.failures, stats.failures, stats.tests - stats.failures - stats.passes, 0, stats.tests, stats.passes, stats.duration / 1000);
  console.log(result);
  return result;
}

function onSuite(runner, suite, level) {
  var result = util.format('---\ntype: case\nlabel: %s\nlevel: %d', suite.title, level);
  console.log(result);
  return result;
}

function onPending(runner, suite, test) {
  var result = 'status: pending';
  console.log(result);
  return result;
}

function onPass(runner, test) {
  var result = util.format('status: pass\ntime: %d', test.duration / 1000);
  console.log(result);
  return result;
}

function onFail(runner, test, err) {
  var result, backtrace, errorClass, stack;

  stack = err.stack.split('\n');
  backtrace = stack.slice(1).map(function(line) { return line.replace(/^[^\(\/]*\(?([^)]*)\)?/g, function(all, file) { return file; }); }).join('\n    - ');
  result = util.format('status: fail\ntime: %d\nexception:\n  class: %s\n  message: "%s"\n  backtrace:\n    - %s', test.duration, err.name, err.message, backtrace);
  console.log(result);
  return result;
}

function onTest(runner, test) {
  var result = util.format('---\ntype: test\nlabel: %s', test.title);
  console.log(result);
  return result;
}

function TAPY(runner) {
 Base.call(this, runner);

  var stats = this.stats,
      level = 0;

  runner.on('start', onStart.bind(this, runner));

  runner.on('end', onEnd.bind(this, runner));

  runner.on('suite', function(suite) {
    onSuite(runner, suite, level);
    level++;
  });

  runner.on('suite end', function(suite){
    level--;
  });

  runner.on('pending', onPending.bind(this, runner));

  runner.on('pass', onPass.bind(this, runner));

  runner.on('fail', onFail.bind(this, runner));

  runner.on('test', onTest.bind(this, runner));
}
