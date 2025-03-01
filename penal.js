const { GuildMember } = require("elvan.js");
const Penal = require("../Models/Database/Penal");
const Settings = require("../Configuration/Settings.json");

class PenalManager {

    static Timeouts = new Map();

    /**
     * @param {String} user 
     * @param {String} admin 
     * @param {String} type 
     * @param {Boolean} temporary 
     * @param {Number} startTime 
     * @param {Number} finishTime 
     */
    static async addPenal(user, admin, type, reason, temporary = false, startTime = Date.now(), finishTime = undefined) {
        let count = await Penal.countDocuments().exec();
        count = count == 0 ? 1 : count + 1;
        let penal = await new Penal({
            Id: count,
            Activity: true,
            User: user,
            Admin: admin,
            Type: type,
            Temporary: temporary,
            Time: startTime,
            Reason: reason,
            FinishTime: finishTime ? startTime + finishTime : finishTime
        }).save();

        if (temporary && finishTime && (finishTime < (1000 * 60 * 30))) {
            this.checkPenal(count, finishTime);
        }
        return penal;
    }

    static async checkPenal(id, time) {
        let timeout = setTimeout(async () => {
            this.Timeouts.delete(id);

            let penal = await Penal.findOne({ Id: id }).exec();
            if (!penal.Activity) return;

            let guild = global.Client.guilds.cache.get(Settings.Server.Id);
            if (!guild) return;

            let member = await guild.getMember(penal.User);
            if (!member) {
                penal.Activity = false;
            }
            else {
                return this.disableToPenal(penal, member);
            }
            penal.save();
        }, time);

        this.Timeouts.set(id, timeout);
    }
    /**
     * 
     * @param {String} id 
     */
    static async removePenal(id) {
        return await Penal.deleteOne({ Id: id }).exec();
    }

    /**
     * @param {GuildMember} member 
     * @param {Array<String>} params
     */
    static async setRoles(member, params = []) {
        if (!member.manageable) return false;
        let roles = member.roles.cache.filter(role => role.managed).map(role => role.id).concat(params);
        member.roles.set(roles).catch();
        return true;
    }

    /**
     * 
     * @param {String} id 
     */
    static async getPenal(id) {
        return await Penal.findOne({ Id: id }).exec();
    }
    /**
     * 
     * @param {Object} query 
     */
    static async getPenalToQuery(query) {
        return await Penal.findOne(query).exec();
    }
    /**
     * 
     * @param {String} user 
     * @param {Number} limit 
     */
    static async getPenals(query, limit = undefined) {
        if (!limit) return await Penal.find(query).exec();
        return await Penal.find(query).limit(limit).exec();
    }
}

module.exports = PenalManager;
module.exports.Types = {
    TEMP_MUTE: "Mute",
    TEMP_VOICE_MUTE: "V.Mute",
    TEMP_JAIL: "Jail",
    REKLAM: "Reklam",
    KICK: "Kick",
    WARN: "Warn",
    BAN: "Ban"
}