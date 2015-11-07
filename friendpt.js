/*
 * ギフト操作など
 */

(function (window, undefined) {
    'use strict';
    var TIME_OUT = 5000;

    $.ajaxSetup({
        timeout: TIME_OUT
    });

    //@エール画面とかで止まっちゃう。。。後で考える
    /*
    myl._ajax = myl.ajax;
    myl.ajax = function (type, url, postData, headers, errMax) {
        var d = $.Deferred();


        myl._ajax(type, url, postData, headers, errMax).done(function (source) {
            //source見てcanvasだけのページ(ログボとか)ならマイページを2～3回踏んでから再試行する(未実装)

            var p1, p2, c;
            if (typeof source === 'string') {
                p1 = source.indexOf('<body>');
                p2 = source.indexOf('</body');
                c = p2 - p1;
            } else {
                c = p1 = p2 = 0;
            }
            if (p1 && p2 && c > 10 && c < 300) {
                myl._ajax('GET', 'http://vcard.ameba.jp/mypage').done(function () {
                    myl.ajax(type, url, postData, headers, errMax).done(function (source) {
                        d.resolve(source);
                    });
                });
            } else {
                d.resolve(source);
            }
        });

        return d.promise();
    };
    */

    function GFGiftBookmarklet() {
        var self = this,
            _sell = null,
            _yell = null,
            _gift = null,

            URL_CARD_READY  = 'http://vcard.ameba.jp/upgrade/gift',
            URL_CARD_SEARCH = 'http://vcard.ameba.jp/upgrade/ajax/upgrade-card-search?__r=(t)',
            URL_SEARCH_GIRL    = 'http://vcard.ameba.jp/giftbox/gift-search?__r=(t)',
            URL_RECV_GIRL      = 'http://vcard.ameba.jp/giftbox/giftbox-system-select-recive',
            URL_RECV_ALL_GIRLS = 'http://vcard.ameba.jp/giftbox/giftbox-system-all-recive',
            URL_SELL_LIST      = 'http://vcard.ameba.jp/card/sell-card-list',
            URL_SELL_CONFIRM   = 'http://vcard.ameba.jp/card/sell-card-confirm',
            URL_SELL_DO        = 'http://vcard.ameba.jp/card/sell-card-result',
            URL_RECV_GAL       = 'http://vcard.ameba.jp/giftbox/giftbox-system-select-recive',
            URL_RECV_ALL_GAL   = 'http://vcard.ameba.jp/giftbox/giftbox-system-all-recive',
            URL_GAL            = 'http://vcard.ameba.jp/giftbox?selectedGift=3&page=(p)',
            URL_GIFT           = 'http://vcard.ameba.jp/giftbox?selectedGift=(m)&page=(p)',
            URL_YELL_LIST      = 'http://vcard.ameba.jp/upgrade',
            URL_YELL_CONFIRM   = 'http://vcard.ameba.jp/upgrade/upgrade-confirm',
            URL_YELL_DO        = 'http://vcard.ameba.jp/upgrade/upgrade-animation',
            URL_CUPID          = 'http://vcard.ameba.jp/cupid',
            URL_FRIEND_CUPID   = 'http://vcard.ameba.jp/cupid/cupid-exec?cupidId=1&token=(x)',
            URL_FRIEND_CUPIDS  = 'http://vcard.ameba.jp/cupid/cupid-exec?cupidId=1&cupidCount=(n)&token=(x)',
            URL_FRIEND_PT      = 'http://vcard.ameba.jp/giftbox?selectedGift=4&page=(p)',
            URL_MYPAGE        = 'http://vcard.ameba.jp/mypage';

        /* ギフトのガール情報をエールページのギフトからエールのデータから得る */
        self.readyGiftGirlData = function (sphere, rarity) {
            var d = $.Deferred();
            myl.ajax('GET', URL_CARD_READY).done(function (source) {
                var s, ptn, res, cardId;

                ptn = /var\suserCardId\s=\s"(\d+_\d+_\d+\.\d+)";/;
                res = ptn.exec(source);
                cardId = res[1];

                s = ['ALL', 'COOL', 'SWEET', 'POP'];
                self.postData = {
                    cond: 'gift',
                    sphere: s[sphere], //0:all, 1:cool, 2:sweet, 3:pop
                    sortType: 'updDatetime',// 最近もらった順
                    sort: 'updDatetime-desc',
                    userCardId: cardId,
                    skill: 0,
                    status: 0,
                    giftRarity: rarity, //0:レア度, 1:ノーマル, 2:ハイノーマル, 3:ハイノーマル以下, 4:レア, 5:レア以下, 6:ハイレア, 7:ハイレア以下, 8:SR, 9:SSR
                    giftOther: 4,   //0:その他, 1:声援あり, 2:声援なし, 3:特別指導ガール, 4:特別指導ガール以外, 5:LvMAXのみ
                };
                d.resolve();
            }).fail(function () {;
                d.reject('ERROR:' + url);
            });
            return d.promise();
        };
        self.getGiftGirlData = function (page) {
            var d, url, postData;
            d = $.Deferred();
            url = URL_CARD_SEARCH.replace('(t)', myl.ut());

            self.postData.page = page;
            myl.ajax('POST', url, self.postData).done(function (response) {
                console.log(response);
                d.resolve(response.data.searchList, response.data.searchCount);
            }).fail(function () {;
                d.reject('ERROR:' + url);
            });
            return d.promise();
        };



        /* ギフトのガールフィルターを設定し、最大ページを取得する */
        self.setGiftFilter = function (sphere, sort, rarity, other) {
            var d, url;
            d = $.Deferred();
            url = URL_SEARCH_GIRL.replace('(t)', myl.ut());

            if (sphere === undefined) {
                sphere = 0;
                sort = 0;
                rarity = 0;
                other = 0;
            }

            self.postData = {
                sphere: sphere, //0:all, 1:cool, 2:sweet, 3:pop
                sort: sort,     //0:最近もらった順, 1:昔にもらった順, 2:レア度が高い順, 3:レア度が低い順
                rarity: rarity, //0:レア度, 1:ノーマル, 2:ハイノーマル, 3:ハイノーマル以下, 4:レア, 5:レア以下, 6:ハイレア, 7:ハイレア以下, 8:SR, 9:SSR
                other: other,   //0:その他, 1:声援あり, 2:声援なし, 3:特別指導ガール, 4:特別指導ガール以外, 5:LvMAXのみ
                page: 1
            };
            myl.ajax('GET', URL_GIFT.replace('(m)', '1').replace('(p)', '1')).done(function () {
                myl.ajax('POST', url, self.postData).done(function (source) {
                    d.resolve(source.data.maxPage, source.data.searchCount);
                }).fail(function () {
                    d.reject('ERROR:' + url);
                });
            });
            return d.promise();
        };
        /* ギフトのガール情報を取得する(事前にsetGiftFilter必須) */
        self.getGirl = function (page) {
            var d, url;
            d = $.Deferred();
            url = URL_SEARCH_GIRL.replace('(t)', myl.ut());
            self.postData.page = page;
            myl.ajax('POST', url, self.postData).done(function (source) {
                d.resolve(source.data.results, source.token);
            }).fail(function () {
                d.reject('ERROR:' + url);
            });
            return d.promise();
        };
        /* ギフトのガールを受け取る */
        self.recvGirl = function (page, giftId, token) {
            var d, post;
            d = $.Deferred();
            post = self.postData;
            post.giftId = giftId;
            post.token = token;
            post.selectedGift = 1;
            post.submit = '受け取る';
            myl.ajax('POST', URL_RECV_GIRL, post).done(function (source) {
                var ptn, res;
                ptn = /var token = '(.+?)'/;
                res = ptn.exec(source);
                token = res[1];
                d.resolve(token);
            }).fail(function (e) {
                d.reject(e);
            });
            return d.promise();
        };
        self.recvGirls = function (page, giftIds, token, log) {
            var d, loop, len;
            d = $.Deferred();
            len = giftIds.length;
            loop = function (i, token) {
                self.recvGirl(page, giftIds[i], token).done(function (token) {
                    if (log) {
                        log('recv: ' + giftIds[i]);
                    }
                    if (++i < len) {
                        loop(i, token);
                    } else {
                        d.resolve();
                    }
                });
            };
            loop(0, token);
            return d.promise();
        };
        self.recvAllGirls = function (page, giftIds, token) {
            var post = self.postData;
            post.giftId = giftIds;
            post.token = token;
            post.selectedGift = 1;
            return myl.ajax('POST', URL_RECV_ALL_GIRLS, post);
        };


        //ガル・フレンドPt
        _gift = {
            url: null,
            ptn: null
        };
        self.setGiftMode = function (mode) {
            if (mode === 'gal') {
                _gift.url = URL_GIFT.replace('(m)', '3');
                _gift.ptn = />(\d+)ガル<\/dt>/g;
            } else {
                _gift.url = URL_GIFT.replace('(m)', '4');
                _gift.ptn = />(\d+)フレンドpt<\/dt>/g;
            }
        };
        self.getGiftMaxPage = function () {
            var d, url;
            d = $.Deferred();
            url = _gift.url.replace('(p)', '1');
            myl.ajax('GET', url).done(function (source) {
                var ptn, res, maxPage;
                ptn = /<span id="js_maxPage">(\d+)</;
                res = ptn.exec(source);
                maxPage = parseInt(res[1], 10);
                d.resolve(maxPage);
            }).fail(function (e) {
                d.reject(e);
            });
            return d.promise();
        };
        self.getGift = function (page) {
            var d, url;
            d = $.Deferred();
            url = _gift.url.replace('(p)', String(page));
            myl.ajax('GET', url).done(function (source) {
                var res, result;
                result = [];
                while (res = _gift.ptn.exec(source)) {
                    result.push(res[1]);
                }
                result = myl.mapInt(result);
                d.resolve(result);
            }).fail(function (e) {
                d.reject(e);
            });
            return d.promise();
        };

        /* ガル */
        self.getGal = function (page) {
            var d = $.Deferred();
            myl.ajax('GET', URL_GAL.replace('(p)', page)).done(function (source) {
                var ptn_giftId, ptn_gal, ptn_token,
                    res, giftId, gal, token, giftIds, gals;
                ptn_giftId = /name="giftId" value="(.+?)"/g;
                ptn_gal = />(\d+)ガル<\/dt>/g;
                ptn_token = /var token = '([a-zA-Z0-9]+)'/;
                giftIds = [];
                gals = [];
                while (res = ptn_giftId.exec(source)) {
                    giftId = res[1];
                    gal = parseInt(ptn_gal.exec(source)[1], 10);
                    giftIds.push(giftId);
                    gals.push(gal);
                }
                token = ptn_token.exec(source)[1];
                d.resolve(gals, giftIds, token);
            }).fail(function (e) {
                d.reject(e);
            });
            return d.promise();
        };

        self.recvGals = function (page, giftIds, token, log) {
            var d, len, loop, ptn;
            d = $.Deferred();
            len = giftIds.length;
            ptn = /var token = '([a-zA-Z0-9]+)'/;
            loop = function (i, token) {
                var post = {
                    'giftId': giftIds[i],
                    'token': token,
                    'selectedGift': 3,
                    'page': String(page),
                    'submit': '受け取る'
                };
                myl.ajax('POST', URL_RECV_GAL, post).done(function (source) {
                    var token = ptn.exec(source)[1];
                    if (log) { log('recvGal: ' + giftIds[i]); }
                    if (++i < len) {
                        loop(i, token);
                    } else {
                        d.resolve();
                    }
                }).fail(function (e) {
                    d.reject(e);
                });
            };
            loop(0, token);
            return d.promise();
        };
        self.recvAllGal = function (page, giftIds, token) {
            var post = {
                'sphere': 0,
                'sort': 0,
                'other': 0,
                'token': token,
                'page': page,
                'selectedGift': 3,
                'rarity': 0,
                'giftId': giftIds
            };
            return myl.ajax('POST', URL_RECV_ALL_GAL, post);
        };

        //卒業させる
        _sell = {
            post: null,
            ptn: /rel="(.+?)" gradMoney="\d+"/g,
            ptn_token: /var token = '([a-zA-Z0-9]+)'/,
            doing: function () {
                return myl.ajax('POST', URL_SELL_DO, _sell.post);
            },
            confirm: function () {
                var d = $.Deferred();
                myl.ajax('POST', URL_SELL_CONFIRM, _sell.post).done(function (source) {
                    _sell.post.token = _sell.ptn_token.exec(source)[1];
                    d.resolve();
                }).fail(function () {
                    d.reject('ERROR: ' + URL_SELL_CONFIRM);
                });
                return d.promise();
            },
            get: function () {
                var d = $.Deferred();
                myl.ajax('GET', URL_SELL_LIST).done(function (source) {
                    var ids, res;
                    ids = [];
                    while (res = _sell.ptn.exec(source)) {
                        ids.push(res[1]);
                    }
                    if (ids.length === 0) {
                        d.reject('ERROR: sell girl not found');
                    } else {
                        _sell.post = {'sellUserCardIds': ids.join(',')};
                        d.resolve();
                    }
                }).fail(function () {
                    d.reject('ERROR: ' + URL_SELL_LIST);
                });
                return d.promise();
            }
        };
        self.sell = function () {
            _sell.post = null;
            return _sell.get().then(_sell.confirm).then(_sell.doing);
        };

        _yell = {
            data: null,
            doing: function (lv, vlv) {
                var d = $.Deferred();
                myl.ajax('GET', URL_YELL_DO, _yell.data).done(function (source) {
                    var ptn, lvup, vlvup, lvmax, vlvmax,
                    afterVoiceLv, afterLv, afterPer;

                    ptn = /var CARD_LEVELUP_NUMBER = (\d+);/;
                    lvup = parseInt(ptn.exec(source)[1], 10);
                    afterLv = lv + lvup;
                    ptn = /var VOICE_LEVELUP_NUMBER = (\d+);/;
                    vlvup = parseInt(ptn.exec(source)[1], 10);
                    afterVoiceLv = vlv + vlvup;
                    ptn = /var EXP_AFTER_PERCENT = (\d+);/;
                    afterPer = parseInt(ptn.exec(source)[1], 10) / 100;
                    ptn = /var LEVEL_MAX_FLAG = (true|false);/;
                    lvmax = (ptn.exec(source)[1] === 'true');
                    ptn = /var VOICE_MAX_FLAG = (true|false);/;
                    vlvmax = (ptn.exec(source)[1] === 'true');
                    console.log(afterVoiceLv, afterLv, afterPer, vlvmax, lvmax, typeof vlvmax, typeof lvmax);
                    d.resolve(afterVoiceLv, afterLv, afterPer, vlvmax, lvmax);
                    //ptn = /var voiceAfterLevelNumber = (\d+);/;
                    //afterVoiceLv = parseInt(ptn.exec(source)[1], 10);
                    //ptn = /var cardAfterLevelNumber = (\d+);/;
                    //afterLv = parseInt(ptn.exec(source)[1], 10);
                    //ptn = /var expAfterPercent = (\d+);/;
                    //afterPer = parseInt(ptn.exec(source)[1], 10) / 100;
                    //d.resolve(afterVoiceLv, afterLv, afterPer);
                }).fail(function (e) {
                    d.reject(e);
                });
                return d.promise();
            },
            confirm: function () {
                var d = $.Deferred();
                myl.ajax('GET', URL_YELL_CONFIRM, _yell.data).done(function (source) {
                    var ptn, lv, vlv;
                    ptn = /var token = '([a-zA-Z0-9]+)'/;
                    _yell.data.token = ptn.exec(source)[1];
                    _yell.data.player ='true';
                    ptn = /<em>(\d+)<\/em>\s?\/\s?\d+<\/dd>/;
                    lv = parseInt(ptn.exec(source)[1], 10);
                    ptn = /\[Lv\.(\d+)\]/;
                    vlv = parseInt(ptn.exec(source)[1], 10);
                    d.resolve(lv, vlv);
                }).fail(function (e) {
                    d.reject(e);
                });
                return d.promise();
            },
            get: function () {
                var d = $.Deferred();
                myl.ajax('GET', URL_YELL_LIST).done(function (source) {
                    var ptn, res, ids;
                    ptn = /rel="(\d+_\d+_\d+\.\d+[A-Z]?-?(?:\d+)?)"/g;
                    ids = [];
                    while (res = ptn.exec(source)) {
                        ids.push(res[1]);
                    }
                    _yell.data.materialUserCardId = ids.join(',');
                    d.resolve();
                }).fail(function (e) {
                    d.reject(e);
                });
                return d.promise();
            }
        };
        self.yell = function (baseId) {
            _yell.data = {};
            _yell.data.baseUserCardId = baseId;
            return _yell.get().then(_yell.confirm).then(_yell.doing);
        };

        self.checkGal = function () {
            var d = $.Deferred();
            myl.ajax('GET', URL_MYPAGE).done(function (source) {
                var ptn, money;
                ptn = /(?:moeny|money): "(\d+)",/;
                money = parseInt(ptn.exec(source)[1], 10);
                d.resolve(money);
            });
            return d.promise();
        };

        /* フレンドキュピ */
        self.cupid = function (n) {
            var d, baseUrl;
            d = $.Deferred();
            if (n === 1) {
                baseUrl = URL_FRIEND_CUPID;
            } else {
                baseUrl = URL_FRIEND_CUPIDS.replace('(n)', n);
            }
            myl.ajax('GET', URL_CUPID).done(function (source) {
                var ptn, token, url;
                ptn = /var token = '(.+?)'/;
                token = ptn.exec(source)[1];
                url = baseUrl.replace('(x)', token);
                myl.ajax('GET', url).done(function () {
                    d.resolve();
                }).fail(function () {
                    d.reject();
                });
            });
            return d.promise();
        };

        /* 所持フレンドPtを確認する */
        self.getFriendPt = function () {
            var d;
            d = $.Deferred();
            myl.ajax('GET', URL_MYPAGE).done(function (source) {
                var pt, ptn;
                ptn = /friendshipPoint: "(\d+)",/;
                pt = ptn.exec(source)[1];
                d.resolve(+pt);
            });
            return d.promise();
        };

        /* フレンドPt　受け取る */
        self.recvFriendPt = function (page) {
            var d, url;
            d = $.Deferred();
            url = URL_FRIEND_PT.replace('(p)', page);
            myl.ajax('GET', url).done(function (source) {
                var token, ptn1, ptn2, ptn3, ptn_max, ids, giftId, pts, pt, maxPage, res;

                ptn_max = /<span id="js_maxPage">(\d+)</;
                maxPage = parseInt(ptn_max.exec(source)[1], 10);

                ptn1 = /<input type="hidden" name="token" value="(.+?)"/;
                token = ptn1.exec(source)[1];

                ptn2 = /<input type="hidden" value="(.+?)" name="giftId"/g;
                ptn3 = /<dt class="fcOrange">(\d+?)フレンドpt/g;
                ids = [];
                pts = [];
                while (res = ptn2.exec(source)) {
                    giftId = res[1];
                    if ($.inArray(giftId, ids) !== -1) {
                        break;
                    }
                    ids.push(giftId);
                    pt = ptn3.exec(source)[1];
                    pts.push(+pt);
                }
                if (ids.length === 0) {
                    d.reject();
                } else {
                    self.recvFriendPt2(token, page, ids).done(function () {
                        var recvPt = myl.sum(pts);
                        d.resolve(recvPt, maxPage);
                    }).fail(function () {
                        d.reject();
                    });
                }
            });
            return d.promise();
        };

        self.recvFriendPt2 = function (token, page, ids) {
            var post = {
                'sphere': 0,
                'sort': 0,
                'other': 0,
                'token': token,
                'page': page,
                'selectedGift': 4,
                'rarity': 0,
                'giftId': ids
            };

            return myl.ajax('POST', URL_RECV_ALL_GAL, post);
        }

    }

    /*
 * フレンドPtガル化逐ブックマークレット
 */

/*
 * フレンドPtガル化逐ブックマークレット
 */

(function (window, undefined) {
    'use strict';
    var nowPt, page, flag, log;
    //flag: 1=ガル化, 0=受け取る

    function main() {
        if (flag === 0) {
            //フレンドPt受け取り処理
            recvFriendPt(page).done(function (recvPt, maxPage) {
                nowPt += recvPt;
                log('recv friendPt (after : ' + nowPt + ' pt, ' + maxPage + ' page)');
                if (page === maxPage) {
                    //フレンドPt受け取り終わり
                    alert('フレンドPtガル化処理終わり！');
                    return
                } else if (nowPt > 200000000) {
                    //MAX10万Ptまで所持できる
                    //所持フレンドPtが5万超→ガル化処理へ移行
                    flag = 1;
                    log('start cupid & sell');
                }
                return main();
            });
        } else {
            //ガル化処理
            gfgb.cupid(10).done(function () {
                nowPt -= 2000;
                log('cupid (after : ' + nowPt + ' pt)');
                gfgb.sell().done(function () {
                    log('sell');
                    if (nowPt < 2000) {
                        //フレンドPt受け取り処理へ移行
                        flag = 0;
                        log('start recv friendPt');
                    }
                    main();
                }).fail(function () {
                    alert('エラーーーーーー');
                });
            })
        }
    }


    /* 設定など
    ------------------------------------------------------------------------ */
    function init() {
        if (document.getElementById('materialCardList').textContent.indexOf('卒業できるガールがいないみたいだよ') === -1) {
            alert('前準備が完了していません。');
            return;
        }

        myl.popup_agree('確認', '各項目をチェックし、OKを押して下さい。', [
               '自己責任での利用に同意する',
               '所持枠は10以上空けている',
               '現在所持しているガールは全て保護している',
               '卒業画面のフィルターは「レア以下」に設定していますか？'
        ]).done(function () {
            page = myl.intInput('最後のページから何ページまでガル化しますか？(1:all)', '1');

            log = myl.output('フレンドPtガル化');
            //endFlag = false;
            gfgb.getFriendPt().done(function (pt) {
                nowPt = pt;
                log('現在：' + nowPt + 'Pt所持');
                if (nowPt > 200000000) {
                    log('start cupid & sell');
                    flag = 1;//ガル化処理から始める
                } else {
                    log('start recv friendPt');
                    flag = 0;//フレンドPt受け取り処理から始める
                }
                main();
            });

        });
    }
    init();
})(window);

    window.gfgb = new GFGiftBookmarklet();
})(window);