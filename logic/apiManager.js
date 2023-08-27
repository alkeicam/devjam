const CONSTANTS = require("./constants");
const axios = require('axios');

/**
 * Project data
 * @typedef {Object} Project
 * @property {string} id - project id
 * @property {string} name - project name 
 */

/**
 * Sponsors data
 * @typedef {Object} Account
 * @property {string} id - sponsor account id
 * @property {string} name - sponsor account name
 * @property {Project} project - sponsor account id
 */


/**
 * Successfull join response
 * @typedef {Object} JoinAck
 * @property {Account} account - sponsor account data
 */


class ApiManager{
    constructor(){        
    }
    static getInstance(){
        const r = new ApiManager();
        return r;
    }

    /**
     * Joins user using provided invitation.
     * @param {*} invitationCode 
     * @returns {JoinAck} on successful join operation
     */
    async join(invitationCode){
        let urlCandidate = `${CONSTANTS.JOIN.DEFAULT_URLS[0]}/${invitationCode}`;

        const response = await axios.get(urlCandidate).catch((error)=>{
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.log(error.response.data);
                // console.log(error.response.status);
                // console.log(error.response.headers);
                // this.lastFailedUrl = urlCandidate;
                throw new Error(`Failed ${urlCandidate} due to http status ${error.response.status}`)
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser 
                // and an instance of http.ClientRequest in node.js
                // console.log(error.request);
                // this.lastFailedUrl = urlCandidate;
                throw new Error(`Failed ${urlCandidate} - unable to connect`)                
              } else {
                // Something happened in setting up the request that triggered an Error
                // this.lastFailedUrl = urlCandidate;
                throw error;
              }
        });

        return response;
    }
}
module.exports = ApiManager.getInstance()