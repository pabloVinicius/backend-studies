"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CreateCourseService = /** @class */ (function () {
    function CreateCourseService() {
    }
    CreateCourseService.prototype.execute = function (_a) {
        var name = _a.name, duration = _a.duration, _b = _a.educator, educator = _b === void 0 ? 'default' : _b;
        console.log({ name: name, duration: duration, educator: educator });
    };
    return CreateCourseService;
}());
exports.default = new CreateCourseService();
