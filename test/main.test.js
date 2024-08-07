// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);

const assert = chai.assert;
const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');

const MocksModule = require('./data/data.mock')
const theModule = require('../services/githook/manager');
let theManager;

describe('hook manager', () => {
    describe("handles change",()=>{
        let x1;
        beforeEach(()=>{
            theManager = new theModule.Manager();
            x1 = sinon.spy(theManager,"_decode");  
            x2 = sinon.spy(theManager,"_emitStats");  
            s1 = sinon.stub(theManager, "_emitEvent");   
            s2 = sinon.stub(theManager.persistentStore,"addEvent");  
        })
        afterEach(()=>{
            x1.restore();
            x2.restore();
            s1.restore();
            s2.restore();
        })
        it("decodes input event and saves to database",async ()=>{
            await theManager.change({},{},MocksModule.MOCKS.hookEvents.one);
            expect(x1.callCount).eq(1);
            const call = x1.getCall(0);
            expect(call.args[0]).eq(MocksModule.MOCKS.hookEvents.one);
            expect(s2.callCount).eq(1);            
        })
        it("emits changes to the GUI",async ()=>{
            await theManager.change({},{},MocksModule.MOCKS.hookEvents.one);
            expect(s1.callCount).eq(1);
            expect(x2.callCount).eq(1);            
        })
    })
    describe("event decoding",()=>{        
        beforeEach(()=>{
            theManager = new theModule.Manager();             
        })
        afterEach(()=>{
        })
        it("generates id",async ()=>{
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.one);
            expect(result.id.length).gt(6)            
        })        
        it("populates creation timestamp",async ()=>{
            const result = await  theManager._decode(MocksModule.MOCKS.hookEvents.one);
            expect(result.ct).gt(Date.now()-100);            
        })   
        it("populates gitlog property",async ()=>{
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.one);
            let buff = Buffer.from(MocksModule.MOCKS.hookEvents.one.gitlog, 'base64');  
            let message = buff.toString('utf-8');

            expect(result.gitlog).is.not.empty;
            expect(result.gitlog.startsWith("commit")).is.true;            
            expect(result.gitlog).eq(message)
        }) 
        it("populates diff property",async ()=>{
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.one);
            expect(result.diff).is.not.empty
            expect(result.diff.startsWith("commit")).is.true;

            const result2 = await theManager._decode(MocksModule.MOCKS.hookEvents.two_no_diff);
            expect(result2.diff).is.empty;            
        })    
        it("populates decoded property",async ()=>{
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.one);
            expect(result.decoded).is.not.empty

            expect(result.decoded.author.name).eq("Maciej Grula");
            expect(result.decoded.changes.length).gt(0);
            expect(result.decoded.changeSummary.raw).is.not.empty;
            expect(result.decoded.changeSummary.deletions).gt(0);
            expect(result.decoded.changeSummary.files).gt(0);
            expect(result.decoded.changeSummary.inserts).gt(0);
            expect(result.decoded.commit).eq('commit 5fc617ef5ede5d7ff6ffef0ba3205afe3e2a337e');
            expect(result.decoded.date).eq('Date:   Sat Jun 8 18:44:46 2024 +0200');
            expect(result.decoded.message).eq('PWR-01 cleaning');
            expect(result.decoded.ticket).eq('PWR-01');
            expect(result.decoded.ticketPrefix).eq('PWR');

            const result2 = await theManager._decode(MocksModule.MOCKS.hookEvents.three_no_ticket);
            expect(result2.decoded.ticket).is.empty;
            expect(result2.decoded.ticketPrefix).is.empty;

            const result3 = await theManager._decode(MocksModule.MOCKS.hookEvents.five_ticket_bracket_format);
            expect(result3.decoded.ticket).eq('PWR-11')
            expect(result3.decoded.ticketPrefix).eq('PWR');
        })

        it("populates remote - remote is configured",async ()=>{
            // here remote is available
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.six_remote_user_password);
            const result2 = await theManager._decode(MocksModule.MOCKS.hookEvents.seven_remote_apikey);

            // make sure that api key/credentials are removed from remote and remote is retrieved
            expect(result.remote).includes("https://@github.com/alkeicam/devjam.git");
            expect(result2.remote).includes("https://@github.com/alkeicam/devjam.git");                        
        })
        it("populates remote - remote is not configured - local dev",async ()=>{
            // here remote is available
            const result = await theManager._decode(MocksModule.MOCKS.hookEvents.one);
            
            // make sure that api key/credentials are removed from remote and remote is retrieved
            expect(result.remote).eq(MocksModule.MOCKS.hookEvents.one.remote);            
        })
        it("populates remote - invalid request - no remote at all",()=>{   
            
            
            return theManager._decode(MocksModule.MOCKS.hookEvents.eight_invalid_no_remote).should.be.rejectedWith('Remote parameter missing');                      
            

            // expect(async()=>{await theManager._decode(MocksModule.MOCKS.hookEvents.eight_invalid_no_remote)}).to.throw("Remote parameter missing")                                
        })

    })
})