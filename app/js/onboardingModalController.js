class OnboardingModalController {
    constructor(emitter){
        this.emitter = emitter;
        this.model = {
            display: false,
            message: "",
            busy: false,
            form: {
                f1: {
                    value: "",
                    errorMsg: "",
                },
                f2: {
                    value: "",
                    errorMsg: "",
                },
                f3: {
                    value: "",
                    errorMsg: "",
                }
            },
            item: {},
            command: "",
            commandWin: "",
            howMany: 0,
            current: 0,
            notify: {
                errors: []
            }
        }
        this.emitter.on("showModal:onboarding",async (item)=>{
            this.model.notify.errors = [];
            this.model.form = {
                f1: {
                    value: item.name,
                    errorMsg: "",
                },
                f2: {
                    value: item.description,
                    errorMsg: "",
                },
                f3: {
                    value: "",
                    errorMsg: "",
                }
            }
            this.model.display = true;
            this.model.item = item
            this.model.command = await this.generateCommand(item);
            this.model.commandWin = await this.generateCommand(item, true);

        })
        
    }

    async generateCommand(item, isWin){
        const postCommitCommand = 
`#!/bin/sh
GIT_LOG=\`git log --stat -1 HEAD | base64 ${isWin?"-w 0":""}\`
GIT_DIFF=\`git show --unified | base64 ${isWin?"-w 0":""}\`
REMOTE=\`git config --get remote.origin.url\`
LOCAL=\`git rev-parse --show-toplevel\`
ACCOUNT="${item.id}"
USER="${item.invitee.email}"
PROJECT="${item.project.id}"

FINAL_REMOTE=""

if [ -n "$REMOTE" ]; then
    FINAL_REMOTE=$REMOTE
else
    FINAL_REMOTE=$LOCAL
fi

POST_BODY="{\\"gitlog\\":\\"$GIT_LOG\\",\\"oper\\":\\"commit\\",\\"remote\\":\\"$FINAL_REMOTE\\",\\"diff\\":\\"$GIT_DIFF\\",\\"account\\":\\"$ACCOUNT\\",\\"user\\":\\"$USER\\",\\"project\\":\\"$PROJECT\\"}"
echo $POST_BODY | curl -S -s -H "Content-Type: application/json" -d @- http://localhost:5001/v1/hooks/commit

exit 0

        `

        const prePushCommand = 
`#!/bin/sh

GIT_LOG=\`git log --stat -1 HEAD | base64 ${isWin?"-w 0":""}\`
REMOTE=\`git config --get remote.origin.url\`
LOCAL=\`git rev-parse --show-toplevel\`
ACCOUNT="${item.id}"
USER="${item.invitee.email}"
PROJECT="${item.project.id}"

FINAL_REMOTE=""

if [ -n "$REMOTE" ]; then
    FINAL_REMOTE=$REMOTE
else
    FINAL_REMOTE=$LOCAL
fi

POST_BODY="{\\"gitlog\\":\\"$GIT_LOG\\",\\"oper\\":\\"push\\",\\"remote\\":\\"$FINAL_REMOTE\\",\\"account\\":\\"$ACCOUNT\\",\\"user\\":\\"$USER\\",\\"project\\":\\"$PROJECT\\"}"

echo $POST_BODY | curl -S -s -H "Content-Type: application/json" -d @- http://localhost:5001/v1/hooks/push

exit 0  

        `

        const command = 
        `
echo '${btoa(postCommitCommand)}' | base64 --decode > .git/hooks/post-commit && chmod +x .git/hooks/post-commit && echo '${btoa(prePushCommand)}' | base64 --decode > .git/hooks/pre-push && chmod +x .git/hooks/pre-push
        `

        return command;
    }

    static async getInstance(emitter){
        const a = new OnboardingModalController(emitter)        
        return a;
    }

    async _handleClose(e, that){
        that.model.notify.errors = [];
        that.model.display = false;
    }

    


}