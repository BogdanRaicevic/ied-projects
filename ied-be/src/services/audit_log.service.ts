import { AuditLog } from './../models/audit_log.model';

export const getAuditLog = async () => {
    try {
        return await AuditLog.find({}).sort({ timestamp: -1 }).exec();
    } catch (error) {
        console.log("Error finding audit log", error);
        throw new Error("Error finding audit log");
    }
};
