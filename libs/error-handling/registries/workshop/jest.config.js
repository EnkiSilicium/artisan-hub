"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const { exclude: _, ...swcJestConfig } = JSON.parse((0, fs_1.readFileSync)(`${__dirname}/.swcrc`, 'utf-8'));
if (swcJestConfig.swcrc === undefined) {
    swcJestConfig.swcrc = false;
}
exports.default = {
    displayName: 'workshop',
    preset: '../../../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    testEnvironment: 'node',
    coverageDirectory: '../../../../coverage/error-handling/registries/workshop',
};
//# sourceMappingURL=jest.config.js.map