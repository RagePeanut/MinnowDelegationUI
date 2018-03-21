import { SteemService } from './../steem.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    account: Object = {
        profile: {}
    };
    bandwidth: Object = {};
    reputation = 25;
    votingPower = 100;
    username: string;
    validAccount: boolean;
    introductionPost: Object = {};

    constructor(private steem: SteemService,
                private route: ActivatedRoute) {
        this.username = route.snapshot.params.username.replace(/@/, '');
        this.validAccount = steem.validateUsername(this.username);
    }

    ngOnInit() {
        this.steem
            .getAccounts([this.username])
            .then(
                (account: Object) => {
                    this.account = account;
                    this.votingPower = this.steem.getVotingPower(account, true);
                    console.log(account);
                    this.steem
                        .getDynamicGlobalProperties()
                        .then((global: Object) => this.bandwidth = this.steem.getBandwidth(account, global))
                        .catch((error: any) => console.log(error));
                }
            )
            .catch((error: any) => console.log(error));
        this.steem
            .getIntroductionPost(this.username)
            .subscribe((post: any) => {
                if(post._items.length > 0) this.introductionPost['post'] = post._items[post._items.length - 1];
                this.introductionPost['analyzed'] = true;
                console.log(post._items);
            });
    }

}
