import * as steem from 'steem';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class SteemService {

dynamicGlobalProperties: Object = {};

    constructor(private http: HttpClient) { }

    getAccounts(usernames: string[]) {
        return new Promise(function(resolve, reject) {
            steem.api.getAccounts(usernames, function(err, res) {
                if(err) reject(err);
                else {
                    res = res.map(account => {
                        account.profile = JSON.parse(account.json_metadata).profile;
                        account.reputation = steem.formatter.reputation(account.reputation);
                        return account;
                    });
                    resolve(res.length === 1 ? res[0] : res);
                }
            });
        });
    }

    getBandwidth(account: Object, dynamicGlobalProperties: Object) {
        const week = 60 * 60 * 24 * 7;
        const vests = parseFloat(account['vesting_shares']);
        const receivedVests = parseFloat(account['received_vesting_shares']);
        const delegatedVests = parseFloat(account['delegated_vesting_shares']);
        const totalVests = parseFloat(dynamicGlobalProperties['total_vesting_shares']);
        const maxVirtualBandwidth = parseInt(dynamicGlobalProperties['max_virtual_bandwidth'], 10);
        const averageBandwidth = parseInt(account['average_bandwidth'], 10);
        // Delay between now and the last bandwidth update (in seconds)
        const bandwidthDelay = (new Date().getTime() - new Date(account['last_bandwidth_update'] + 'Z').getTime()) / 1000;
        // Calculating the bandwidth allocated to the account
        const bandwidthAllocated = Math.round((maxVirtualBandwidth * (vests + receivedVests - delegatedVests)) / (totalVests * 1000000));
        // Updating the bandwidth used based on delay
        const bandwidthUsed = bandwidthDelay < week ? Math.round((((week - bandwidthDelay) * averageBandwidth) / week) / 1000000) : 0;
        return {allocated: bandwidthAllocated, used: bandwidthUsed};
    }

    getDynamicGlobalProperties() {
        return new Promise(function(resolve, reject) {
            steem.api.getDynamicGlobalProperties(function(err, res) {
                err ? reject(err) : resolve(res);
            });
        });
    }

    getIntroductionPost(username: string) {
        const query = {author: username, tags: 'introduceyourself'};
        const params = new HttpParams().set('where', JSON.stringify(query));
        return this.http.get('https://query.steemdata.com/Posts', {params: params});
    }

    getVotingPower(account: Object, toPercentage: boolean) {
        const fullFillingTime = 60 * 60 * 24 * 5;
        const delay = (new Date().getTime() - new Date(account['last_vote_time'] + 'Z').getTime()) / 1000;
        const votingPower = account['voting_power'] + (10000 * delay / fullFillingTime);
        return toPercentage ? parseFloat(Math.min(votingPower / 100, 100).toFixed(2)) : Math.min(votingPower, 10000);
    }

    validateUsername(username: string) {
        return !steem.utils.validateAccountName(username);
    }

}
