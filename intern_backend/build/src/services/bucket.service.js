"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketService = void 0;
const bucket_model_1 = __importDefault(require("../models/bucket.model"));
const mongoose_1 = __importDefault(require("mongoose"));
class BucketService {
    async getBucketsByAccountId(accountId) {
        try {
            const buckets = await bucket_model_1.default.find({
                accountId: new mongoose_1.default.Types.ObjectId(accountId),
            });
            return buckets;
        }
        catch (error) {
            throw new Error("Error fetching buckets: " + error);
        }
    }
}
exports.BucketService = BucketService;
