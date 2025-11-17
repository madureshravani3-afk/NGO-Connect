"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseTypes = exports.Transaction = exports.Chat = exports.Donation = exports.NGO = exports.User = void 0;
var User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
var NGO_1 = require("./NGO");
Object.defineProperty(exports, "NGO", { enumerable: true, get: function () { return NGO_1.NGO; } });
var Donation_1 = require("./Donation");
Object.defineProperty(exports, "Donation", { enumerable: true, get: function () { return Donation_1.Donation; } });
var Chat_1 = require("./Chat");
Object.defineProperty(exports, "Chat", { enumerable: true, get: function () { return Chat_1.Chat; } });
var Transaction_1 = require("./Transaction");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return Transaction_1.Transaction; } });
var mongoose_1 = require("mongoose");
Object.defineProperty(exports, "MongooseTypes", { enumerable: true, get: function () { return mongoose_1.Types; } });
//# sourceMappingURL=index.js.map