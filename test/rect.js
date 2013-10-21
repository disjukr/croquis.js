function evalCode(code) {
    eval('function test() {return (' + code + ')}');
    casper.evaluate(test);
    console.log(code);
}
function assertCode(code) {
    eval('function test() {return (' + code + ')}');
    casper.test.assert(casper.evaluate(test), code);
}
casper.start('test/croquis.html');
casper.run(function () {
    casper.test.begin('rect x', 15, function (test) {
        evalCode('rect = new Croquis.Rect(0, 0, 10, 10)');
        assertCode('rect.x === 0');
        assertCode('rect.right === 10');
        assertCode('rect.width === 10');
        evalCode('rect.left = -10');
        assertCode('rect.x === -10');
        assertCode('rect.right === 10');
        assertCode('rect.width === 20');
        evalCode('rect.right = 0');
        assertCode('rect.x === -10');
        assertCode('rect.left === -10');
        assertCode('rect.width === 10');
        evalCode('rect.x = 0');
        assertCode('rect.left === 0');
        assertCode('rect.right === 10');
        assertCode('rect.width === 10');
        evalCode('rect.width = 20');
        assertCode('rect.x === 0');
        assertCode('rect.left === 0');
        assertCode('rect.right === 20');
        test.done();
    });
    casper.test.begin('rect y', 15, function (test) {
        evalCode('rect = new Croquis.Rect(0, 0, 10, 10)');
        assertCode('rect.y === 0');
        assertCode('rect.bottom === 10');
        assertCode('rect.height === 10');
        evalCode('rect.top = -10');
        assertCode('rect.y === -10');
        assertCode('rect.bottom === 10');
        assertCode('rect.height === 20');
        evalCode('rect.bottom = 0');
        assertCode('rect.y === -10');
        assertCode('rect.top === -10');
        assertCode('rect.height === 10');
        evalCode('rect.y = 0');
        assertCode('rect.top === 0');
        assertCode('rect.bottom === 10');
        assertCode('rect.height === 10');
        evalCode('rect.height = 20');
        assertCode('rect.y === 0');
        assertCode('rect.top === 0');
        assertCode('rect.bottom === 20');
        test.done();
    });
    casper.test.begin('isEmpty', 3, function (test) {
        evalCode('rect = new Croquis.Rect(0, 0, 10, 10)');
        assertCode('!rect.isEmpty()');
        evalCode('rect.width = 0');
        assertCode('rect.isEmpty()');
        evalCode('rect = new Croquis.Rect(0, 0, 10, 10)');
        evalCode('rect.height = 0');
        assertCode('rect.isEmpty()');
        test.done();
    });
});