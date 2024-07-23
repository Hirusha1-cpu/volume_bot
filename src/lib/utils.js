"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffleArray = exports.getRandomFloat = exports.waitSeconds = void 0;
function waitSeconds(seconds) {
    return __awaiter(this, void 0, void 0, function* () {
        const milisecondsInSecond = 1000;
        yield new Promise((resolve) => setTimeout(resolve, seconds * milisecondsInSecond));
    });
}
exports.waitSeconds = waitSeconds;
function getRandomFloat(min, max, fixedTo = 6) {
    return Number((Math.random() * (max - min) + min).toFixed(fixedTo));
}
exports.getRandomFloat = getRandomFloat;
function shuffleArray(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}
exports.shuffleArray = shuffleArray;
