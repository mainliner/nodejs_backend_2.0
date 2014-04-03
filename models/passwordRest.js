var mongodb = require('./db');

function resetServer(resetInfo) = {
    this.email = resetInfo.email;
    this.privateKey = resetInfo.privateKey;
    this.outTime = resetInfo.outTime;
}
module.exports = resetServer;

resetServer.prototype.save = function save(callback){
    
};
