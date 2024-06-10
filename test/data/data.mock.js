const MOCKS = {
    hookEvents:{
        one: {
            gitlog: 'Y29tbWl0IDVmYzYxN2VmNWVkZTVkN2ZmNmZmZWYwYmEzMjA1YWZlM2UyYTMzN2UKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgU2F0IEp1biA4IDE4OjQ0OjQ2IDIwMjQgKzAyMDAKCiAgICBQV1ItMDEgY2xlYW5pbmcKCiBpbmRleC5qcyB8IDUgKy0tLS0KIDEgZmlsZSBjaGFuZ2VkLCAxIGluc2VydGlvbigrKSwgNCBkZWxldGlvbnMoLSkK',
            oper: 'commit',
            remote: '/Users/grulka/Documents/Projekty/gitspace/private/grm-microservices/process',
            diff: 'Y29tbWl0IDVmYzYxN2VmNWVkZTVkN2ZmNmZmZWYwYmEzMjA1YWZlM2UyYTMzN2UKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgU2F0IEp1biA4IDE4OjQ0OjQ2IDIwMjQgKzAyMDAKCiAgICBQV1ItMDEgY2xlYW5pbmcKCmRpZmYgLS1naXQgYS9pbmRleC5qcyBiL2luZGV4LmpzCmluZGV4IGQ3YzQxOTAuLmQyMzJhNTMgMTAwNjQ0Ci0tLSBhL2luZGV4LmpzCisrKyBiL2luZGV4LmpzCkBAIC0xMDEsMTEgKzEwMSw4IEBAIGZ1bmN0aW9uIGF0dGFjaE5ld1Bvc3RPcGVyYXRpb24oYXBwSGFuZGxlciwgdmVyc2lvbiwgcGF0aCwgY29udGV4dCwgb3BlcmF0aW9uSGFuCiBhdHRhY2hOZXdHZXRPcGVyYXRpb24oYXBwLCB2ZXJzaW9uLCBwYXRoLCAiL3RyYW5zaXRpb24vYXZhaWxhYmxlLzp0eXBlSWQvOmVudGl0eUlkIiwgbWFuYWdlci5hdmFpbGFibGVUcmFuc2l0aW9ucy5iaW5kKG1hbmFnZXIpKTsKIGF0dGFjaE5ld1Bvc3RPcGVyYXRpb24oYXBwLCB2ZXJzaW9uLCBwYXRoLCAiL3RyYW5zaXRpb24vZXhlY3V0ZS86dHlwZUlkLzplbnRpdHlJZC86dHJhbnNpdGlvbkNvZGUiLCBtYW5hZ2VyLnRyYW5zaXRpb25FeGVjdXRlLmJpbmQobWFuYWdlcikpOwogYXR0YWNoTmV3UG9zdE9wZXJhdGlvbihhcHAsIHZlcnNpb24sIHBhdGgsICIvaW5zdGFuY2UvOnR5cGVJZC86ZW50aXR5SWQiLCBtYW5hZ2VyLnBvc3RQcm9jZXNzSW5zdGFuY2UuYmluZChtYW5hZ2VyKSk7Ci0KIGF0dGFjaE5ld0dldE9wZXJhdGlvbihhcHAsIHZlcnNpb24sIHBhdGgsICIvaW5zdGFuY2UvOnR5cGVJZC86ZW50aXR5SWQiLCBtYW5hZ2VyLmdldFByb2Nlc3NJbnN0YW5jZS5iaW5kKG1hbmFnZXIpKTsKLQogYXR0YWNoTmV3R2V0T3BlcmF0aW9uKGFwcCwgdmVyc2lvbiwgcGF0aCwgIi9kZWZpbml0aW9uLzp0eXBlSWQiLCBtYW5hZ2VyLmdldFByb2Nlc3NEZWZpbml0aW9uLmJpbmQobWFuYWdlcikpOwogYXR0YWNoTmV3UG9zdE9wZXJhdGlvbihhcHAsIHZlcnNpb24sIHBhdGgsICIvZGVmaW5pdGlvbi86dHlwZUlkIiwgbWFuYWdlci5wb3N0UHJvY2Vzc0RlZmluaXRpb24uYmluZChtYW5hZ2VyKSk7CiAKLWF0dGFjaE5ld0dldE9wZXJhdGlvbihhcHAsIHZlcnNpb24sIHBhdGgsICIvaW5zdGFuY2UvOnR5cGVJZC86ZW50aXR5SWQvaGlzdG9yeSIsIG1hbmFnZXIuZ2V0UHJvY2Vzc0luc3RhbmNlSGlzdG9yeS5iaW5kKG1hbmFnZXIpKTsKLQorYXR0YWNoTmV3R2V0T3BlcmF0aW9uKGFwcCwgdmVyc2lvbiwgcGF0aCwgIi9pbnN0YW5jZS86dHlwZUlkLzplbnRpdHlJZC9oaXN0b3J5IiwgbWFuYWdlci5nZXRQcm9jZXNzSW5zdGFuY2VIaXN0b3J5LmJpbmQobWFuYWdlcikpOwpcIE5vIG5ld2xpbmUgYXQgZW5kIG9mIGZpbGUK',
            account: 'a_execon',
            user: 'maciej.grula@execon.pl',
            project: '4r3t7x7fj6'
        },
        two_no_diff: {
            gitlog: 'Y29tbWl0IDVmYzYxN2VmNWVkZTVkN2ZmNmZmZWYwYmEzMjA1YWZlM2UyYTMzN2UKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgU2F0IEp1biA4IDE4OjQ0OjQ2IDIwMjQgKzAyMDAKCiAgICBQV1ItMDEgY2xlYW5pbmcKCiBpbmRleC5qcyB8IDUgKy0tLS0KIDEgZmlsZSBjaGFuZ2VkLCAxIGluc2VydGlvbigrKSwgNCBkZWxldGlvbnMoLSkK',
            oper: 'commit',
            remote: '/Users/grulka/Documents/Projekty/gitspace/private/grm-microservices/process',            
            account: 'a_execon',
            user: 'maciej.grula@execon.pl',
            project: '4r3t7x7fj6'
        }        
    }
     
}

module.exports = {MOCKS};

