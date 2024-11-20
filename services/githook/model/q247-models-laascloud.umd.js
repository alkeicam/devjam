(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["q247-models-laascloud"] = {}));
})(this, (function (exports) { 'use strict';

    class ShanonEntropyScoreModelV1 {
        constructor() {
            this.name = "ShanonEntropyScoreModel";
            this.version = "1.0";
        }
        score(event) {
            const scoreScalar = this._score(event);
            return Promise.resolve({
                id: `${Math.random().toString(36).substring(2, 12)}`,
                model: {
                    name: this.name,
                    version: this.version
                },
                event: event,
                score: scoreScalar
            });
        }
        _score(item) {
            let score = 0; // initialize score
            const entropy = this._calculateEntropyScope(item);
            // we promote push with extra score
            if (item.oper == "push") {
                score += 13;
                return score;
            }
            let insertDelScore = 0;
            // and point for each insertion, deletion
            insertDelScore += item.decoded.changeSummary.inserts;
            insertDelScore += item.decoded.changeSummary.deletions;
            score = entropy.e * insertDelScore / 100;
            score = parseFloat(score.toFixed(2));
            // console.log(score);
            return score;
        }
        _calculateEntropyScope(gitEvent) {
            /*
            * @typedef {Object} GitEventEntropyScore
            * @property {number} ec - commit line entropy
            * @property {number} em - commit message entropy
            * @property {number} et - ticket entropy
            * @property {number} er - raw message entropy
            * @property {number} ed - diff entropy
            * @property {number} e - final entropy
            */
            const weights = {
                ec: 1,
                em: 1,
                et: 1,
                er: 1,
                ed: 1
            };
            const entropy = {
                ec: this._entropy(Array.from(gitEvent.decoded.commit || "")) * weights["ec"],
                em: this._entropy(Array.from(gitEvent.decoded.message || "")) * weights["em"],
                et: this._entropy(Array.from(gitEvent.decoded.ticket || "")) * weights["et"],
                er: this._entropy(Array.from(gitEvent.gitlog || "")) * weights["er"],
                ed: this._entropy(Array.from(gitEvent.diff || "")) * weights["ed"],
                e: 0,
                w: {
                    ec: this._entropy(gitEvent.decoded.commit ? gitEvent.decoded.commit.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []),
                    em: this._entropy(gitEvent.decoded.message ? gitEvent.decoded.message.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []),
                    et: this._entropy(gitEvent.decoded.ticket ? gitEvent.decoded.ticket.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []),
                    er: this._entropy(gitEvent.gitlog ? gitEvent.gitlog.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []),
                    ed: this._entropy(gitEvent.diff ? gitEvent.diff.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []),
                }
            };
            entropy.e = entropy.ec + entropy.em + entropy.et + entropy.er + entropy.ed;
            return entropy;
        }
        _entropy(arr) {
            const len = arr.length;
            // Build a frequency map from the string.
            const frequencies = arr
                .reduce((freq, c) => {
                freq[c] = (freq[c] || 0) + 1;
                return freq;
            }, {});
            // Sum the frequency of each character.
            const sum = Object.values(frequencies)
                .reduce((sum, f) => {
                if (isNaN(f))
                    return sum; // in some strange cases when running in tests sometimes there is a NaN (like "should" or "toString")
                return sum - f / len * Math.log2(f / len);
            }, 0);
            return parseFloat(sum.toFixed(3));
        }
    }
    class ShanonEntropyScoreModelV2 {
        constructor() {
            this.name = "ShanonEntropyScoreModel";
            this.version = "2.0";
        }
        score(event) {
            const scoreScalar = this._score(event);
            return Promise.resolve({
                id: `${Math.random().toString(36).substring(2, 12)}`,
                model: {
                    name: this.name,
                    version: this.version
                },
                event: event,
                score: scoreScalar
            });
        }
        _score(item) {
            let score = 0; // initialize score
            const entropy = this._calculateEntropyScope(item);
            let sizeScore = 0;
            // and point for each insertion, deletion
            sizeScore += item.decoded.changeSummary.inserts;
            sizeScore += item.decoded.changeSummary.deletions;
            // score = entropy.e*insertDelScore/100
            const L = 2;
            // const k = 0.00027183;
            const k = 0.00237;
            const sizeCoefficient = L * (1 - Math.exp(-k * sizeScore));
            // score = entropy.e*sizeCoefficient+sizeScore/Math.max(sizeCoefficient*10,10)
            score = entropy.e * sizeCoefficient + sizeScore * sizeCoefficient / (entropy.e * sizeCoefficient);
            // we promote push with extra score
            if (item.oper == "push") {
                score *= 1.033;
            }
            score = parseFloat(score.toFixed(2));
            // console.log(score);
            return score;
        }
        _calculateEntropyScope(gitEvent) {
            /*
            * @typedef {Object} GitEventEntropyScore
            * @property {number} ec - commit line entropy
            * @property {number} em - commit message entropy
            * @property {number} et - ticket entropy
            * @property {number} er - raw message entropy
            * @property {number} ed - diff entropy
            * @property {number} e - final entropy
            */
            const weights = {
                ec: 1,
                em: 1.1,
                et: 1,
                er: 1,
                ed: 1
            };
            const weights2 = {
                ec: 1,
                em: 1.1,
                et: 0,
                er: 2.1,
                ed: 2.45
            };
            const entropy = {
                ec: this._entropy(Array.from(gitEvent.decoded.commit || "")) * weights["ec"],
                em: this._entropy(Array.from(gitEvent.decoded.message || "")) * weights["em"],
                et: this._entropy(Array.from(gitEvent.decoded.ticket || "")) * weights["et"],
                er: this._entropy(Array.from(gitEvent.gitlog || "")) * weights["er"],
                ed: this._entropy(Array.from(gitEvent.diff || "")) * weights["ed"],
                e: 0,
                w: {
                    ec: this._entropy(gitEvent.decoded.commit ? gitEvent.decoded.commit.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []) * weights2["ec"],
                    em: this._entropy(gitEvent.decoded.message ? gitEvent.decoded.message.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []) * weights2["em"],
                    et: this._entropy(gitEvent.decoded.ticket ? gitEvent.decoded.ticket.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []) * weights2["et"],
                    er: this._entropy(gitEvent.gitlog ? gitEvent.gitlog.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []) * weights2["er"],
                    ed: this._entropy(gitEvent.diff ? gitEvent.diff.split(/\W+/gi).map(item => item.toLowerCase()).map(item => item.trim()) : []) * weights2["ed"],
                }
            };
            entropy.e = entropy.ec + entropy.em + entropy.et + entropy.er + entropy.ed + entropy.w.ec + entropy.w.em + entropy.w.et + entropy.w.er + entropy.w.ed;
            return entropy;
        }
        _entropy(arr) {
            const len = arr.length;
            // Build a frequency map from the string.
            const frequencies = arr
                .reduce((freq, c) => {
                freq[c] = (freq[c] || 0) + 1;
                return freq;
            }, {});
            // Sum the frequency of each character.
            const sum = Object.values(frequencies)
                .reduce((sum, f) => {
                if (isNaN(f))
                    return sum; // in some strange cases when running in tests sometimes there is a NaN (like "should" or "toString")
                return sum - f / len * Math.log2(f / len);
            }, 0);
            return parseFloat(sum.toFixed(3));
        }
    }

    const moment = require('moment');
    const readline = require('readline');
    /**
     * GitLog parser. It assumes that repository history is retrieved with following
     * command:
     *
     * git log --no-merges -p --stat --date=format:'%Y-%m-%d %H:%M:%S' > file.txt
     *
     *
     * It should produce file containing commit information such as
     * commit eec2df64a62d0c022bb4a72e5b080b6987c2fa2e (HEAD -> main, origin/main, origin/HEAD)
     * Author: al keicam <some@email>
     * Date:   Fri Jul 5 12:50:16 2024 +0200
     *
     * release candidate
     * ---
     * src/js/version.js | 2 +-
     *  1 file changed, 1 insertion(+), 1 deletion(-)
     *
     * diff --git a/src/js/version.js b/src/js/version.js
     * index 1400ab8..2b0b171 100644
     * --- a/src/js/version.js
     * +++ b/src/js/version.js
     * @@ -1 +1 @@
     * -const X_APP_VERSION = '1.0.47'
     * +const X_APP_VERSION = '1.0.47'
     *
     */
    class Q247HistoryParser {
        constructor() {
            this.VERSION = "HP1.0";
            this.MAX_COMMIT_LINES_SIZE = 5000;
        }
        static getInstance(account, project, remote) {
            const r = new Q247HistoryParser();
            r._remote = remote;
            r._account = account;
            r._project = project;
            return r;
        }
        async eventsFromStream(fileStream, eventHandler) {
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            const lines = [];
            const commitPattern = /^commit [0-9a-f]{40}$/gm;
            for await (const line of rl) {
                if (line.match(commitPattern)) {
                    if (lines.length == 0) {
                        lines.push(line); // Add each line to the array
                        continue; // first commit in file so do continue read
                    }
                    // lines contains the commit information so process it    
                    if (lines.length < this.MAX_COMMIT_LINES_SIZE) {
                        // only non xtra large commits are changed into event
                        const event = this._event(lines.join("\n").replace(/\n$/, ""));
                        await eventHandler(event);
                    }
                    // and finally clean the lines array so new commit data can be captured
                    lines.length = 0;
                }
                // if(lineNo % 1000000 == 0) console.log(`lines batch ${lineNo}`)
                // if(lines.length % this.MAX_COMMIT_LINES_SIZE/1000 == 0) console.log(`lines batch ${lines.length}`)
                if (lines.length >= this.MAX_COMMIT_LINES_SIZE)
                    continue;
                lines.push(line); // Add each line to the array
            }
            // finally check if there is anything more in lines array, if yes also add it and process
            if (lines.length < this.MAX_COMMIT_LINES_SIZE) {
                const event = this._event(lines.join("\n").replace(/\n$/, ""));
                await eventHandler(event);
            }
        }
        _event(gitlog) {
            const decoded = this._parseGitLog(gitlog);
            const dateCleaned = decoded.date.replace(/Date:\s+/gi, "");
            let ts = moment(dateCleaned).valueOf();
            // if(!ts.isValid){
            //     // try default gitlog date format
            //     ts = moment(dateCleaned, "ddd MMM D HH:mm:ss YYYY ZZ").valueOf();
            // }
            const event = {
                version: this.VERSION,
                oper: "commit",
                remote: this._remote,
                account: this._account,
                user: decoded.author.email,
                project: this._project,
                id: Math.random().toString(36).substring(2, 12),
                ct: ts,
                tenantId: this._account,
                gitlog: gitlog,
                diff: gitlog,
                decoded: decoded
            };
            return event;
        }
        events(gitLogOutput) {
            const events = [];
            const gitlogs = this._splitGitlog(gitLogOutput);
            for (let i = 0; i < gitlogs.length; i++) {
                const event = this._event(gitlogs[i]);
                events.push(event);
            }
            return events;
        }
        _splitGitlog(gitLogOutput) {
            const commitPattern = /^commit [0-9a-f]{40}$/gm;
            let splits = gitLogOutput.split(commitPattern);
            splits.shift();
            let matches;
            let commits = [];
            while ((matches = commitPattern.exec(gitLogOutput)) !== null) {
                commits.push(matches[0]);
            }
            // const indexes = this.getDelimiterIndexes(gitLogOutput, commitPattern);
            const diffs = splits.map((diff, index) => commits[index] + "\n" + diff.trim());
            // console.log(indexes)
            return diffs;
        }
        /* istanbul ignore next */
        _getDelimiterIndexes(input, regex) {
            const matches = input.matchAll(regex);
            const indexes = [];
            for (const match of matches) {
                const start = match.index;
                const stop = match.index + match[0].length;
                indexes.push({ start, stop });
            }
            return indexes;
        }
        /**
         * See class documentation for supported git log command configuration
         * @param singleCommitGitLog single commit text from git log command
         * @returns
         */
        _parseGitLog(singleCommitGitLog) {
            const message = singleCommitGitLog;
            const lines = message.split(/\r?\n/);
            // console.log(lines);
            const endOfCommitMessage = lines.indexOf("---", 4); // find first occurence of "---" which marks end of the commit message
            const endOfChangesSection = lines.indexOf("", endOfCommitMessage); // find first occurence of "" after commit message starts which marks end of the changes section
            const userMessage = lines.slice(4, endOfCommitMessage).map((item) => item.trim()).join("");
            const { ticket, ticketPrefix } = this._parseTicket(message);
            const data = {
                ticket: ticket,
                ticketPrefix: ticketPrefix,
                commit: lines[0],
                author: {
                    name: lines[1].replace(/Author\:\s+/ig, "").replace(/\<\S+\>.*/ig, "").trim(),
                    email: lines[1].replace(/.+\</ig, "").replace(/\>.?/ig, "").trim()
                },
                date: lines[2],
                message: userMessage,
                // src/js/version.js | 2 +-            
                changes: lines.slice(endOfCommitMessage + 1, endOfChangesSection - 1),
                changeSummary: {
                    // src/js/version.js | 2 +-
                    //  1 file changed, 1 insertion(+), 1 deletion(-)
                    raw: lines[endOfChangesSection - 1],
                    files: parseInt(lines[endOfChangesSection - 1].match(/(\d+ file)/ig) ? lines[endOfChangesSection - 1].match(/(\d+ file)/ig)[0].match(/(\d+)/ig)[0] : "0"),
                    inserts: parseInt(lines[endOfChangesSection - 1].match(/(\d+ insertion)/ig) ? lines[endOfChangesSection - 1].match(/(\d+ insertion)/ig)[0].match(/(\d+)/ig)[0] : "0"),
                    deletions: parseInt(lines[endOfChangesSection - 1].match(/(\d+ deletion)/ig) ? lines[endOfChangesSection - 1].match(/(\d+ deletion)/ig)[0].match(/(\d+)/ig)[0] : "0")
                }
            };
            return data;
        }
        _parseTicket(message) {
            const lines = message.split(/\r?\n/);
            // console.log(lines);
            const endOfCommitMessage = lines.indexOf("", 4);
            const userMessage = lines.slice(4, endOfCommitMessage).join("");
            // either first uppercase word ending with number or in brackets    
            const ticketFromUppercase = userMessage.match(/([A-Z0-9_]+\-\d+)/g) ? userMessage.match(/([A-Z0-9_]+\-\d+)/g)[0] : undefined;
            // either word in square brackets
            const ticketFromSquareBrackets = userMessage.match(/(\[.+\])/ig) ? userMessage.match(/(\[.+\])/ig)[0].replace(/[\[\]]/ig, "") : undefined;
            const ticket = ticketFromUppercase || ticketFromSquareBrackets;
            // assume that in general ticket has a form of a characters followed by a "-" sign followed by a number
            // so lets extract ticket prefix, which can be further mapped onto delivery project
            const ticketPrefix = ticket && ticket.indexOf("-") != -1 ? ticket.split("-")[0] : undefined;
            return {
                ticket: ticket,
                ticketPrefix: ticketPrefix
            };
        }
    }

    exports.Q247HistoryParser = Q247HistoryParser;
    exports.ShanonEntropyScoreModelV1 = ShanonEntropyScoreModelV1;
    exports.ShanonEntropyScoreModelV2 = ShanonEntropyScoreModelV2;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
