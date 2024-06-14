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
        },
        three_no_ticket: {
            gitlog: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKIHNlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyB8IDYgKystLS0tCiAxIGZpbGUgY2hhbmdlZCwgMiBpbnNlcnRpb25zKCspLCA0IGRlbGV0aW9ucygtKQo=',
            oper: 'commit',
            remote: 'https://ghp_26pVh@github.com/alkeicam/devjam.git',
            diff: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKZGlmZiAtLWdpdCBhL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyBiL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcwppbmRleCBiNmZkZDQ5Li40ZTBjOWI2IDEwMDY0NAotLS0gYS9zZXJ2aWNlcy9naXRob29rL21hbmFnZXIuanMKKysrIGIvc2VydmljZXMvZ2l0aG9vay9tYW5hZ2VyLmpzCkBAIC0zMzksNyArMzM5LDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgICAgICAvLyBmb3IgbG9jYWwgZ2l0IHJlcG9zaXRvcnkgd2hpY2ggZmFpbHMgbmV3IFVSTCBkbyBub3RoaW5nICAgICAgICAgICAgCiAgICAgICAgIH0KIAotICAgICAgICAKKwogICAgICAgICByZXR1cm4gZXZlbnQ7CiAgICAgfQogCkBAIC0zNjEsOSArMzYxLDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgIAogICAgICAgICB0aGlzLl9jYWxjdWxhdGVFbnRyb3B5U2NvcGUocmVzdWx0KTsKICAgICAgICAgcmVzdWx0LnMgPSB0aGlzLl9zY29yZShyZXN1bHQpOwotICAgICAgICAKLQotICAgICAgICAKKyAgICAKICAgICAgICAgcmV0dXJuIHJlc3VsdDsgICAgICAgIAogICAgIH0KIAo=',
            account: 'a_execon',
            user: 'alkeicam@yahoo.com',
            project: 'wn04l6pv9y'
        },
        four_no_remote: {
            gitlog: 'Y29tbWl0IDMwMjNlODA3OTUyZThjZjQyYjVlYjYyYzdjMjkzODZhNmMzMTVhNjUKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo1MTo0MCAyMDI0ICswMjAwCgogICAgc29tZSBjaGFuZ2VzIFtQV1ItMTFdCgogbW9kZWwvZG9tYWluLnRzIHwgMSArCiAxIGZpbGUgY2hhbmdlZCwgMSBpbnNlcnRpb24oKykK',
            oper: 'commit',
            remote: '/Users/grulka/Documents/Projekty/gitspace/private/exe-dev-app-ms_v3',
            diff: 'Y29tbWl0IDMwMjNlODA3OTUyZThjZjQyYjVlYjYyYzdjMjkzODZhNmMzMTVhNjUKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo1MTo0MCAyMDI0ICswMjAwCgogICAgc29tZSBjaGFuZ2VzIFtQV1ItMTFdCgpkaWZmIC0tZ2l0IGEvbW9kZWwvZG9tYWluLnRzIGIvbW9kZWwvZG9tYWluLnRzCmluZGV4IGNjMTY5ZDIuLjgxNzUwY2MgMTAwNjQ0Ci0tLSBhL21vZGVsL2RvbWFpbi50cworKysgYi9tb2RlbC9kb21haW4udHMKQEAgLTY3LDYgKzY3LDcgQEAgZXhwb3J0IGludGVyZmFjZSBJbnZpdGF0aW9uewogICAgIHVzZWQ6IGJvb2xlYW4KIH0KIAorCiBleHBvcnQgaW50ZXJmYWNlIEV2ZW50ewogICAgIG9wZXI6ICJjb21taXQifCJwdXNoIiwKICAgICByZW1vdGU6IHN0cmluZywK',
            account: 'a_execon',
            user: 'maciej.grula@execon.pl',
            project: 'a_execon_devjam_ms'
        },
        five_ticket_bracket_format: {
            gitlog: 'Y29tbWl0IDMwMjNlODA3OTUyZThjZjQyYjVlYjYyYzdjMjkzODZhNmMzMTVhNjUKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo1MTo0MCAyMDI0ICswMjAwCgogICAgc29tZSBjaGFuZ2VzIFtQV1ItMTFdCgogbW9kZWwvZG9tYWluLnRzIHwgMSArCiAxIGZpbGUgY2hhbmdlZCwgMSBpbnNlcnRpb24oKykK',
            oper: 'commit',
            remote: '/Users/grulka/Documents/Projekty/gitspace/private/exe-dev-app-ms_v3',
            diff: 'Y29tbWl0IDMwMjNlODA3OTUyZThjZjQyYjVlYjYyYzdjMjkzODZhNmMzMTVhNjUKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo1MTo0MCAyMDI0ICswMjAwCgogICAgc29tZSBjaGFuZ2VzIFtQV1ItMTFdCgpkaWZmIC0tZ2l0IGEvbW9kZWwvZG9tYWluLnRzIGIvbW9kZWwvZG9tYWluLnRzCmluZGV4IGNjMTY5ZDIuLjgxNzUwY2MgMTAwNjQ0Ci0tLSBhL21vZGVsL2RvbWFpbi50cworKysgYi9tb2RlbC9kb21haW4udHMKQEAgLTY3LDYgKzY3LDcgQEAgZXhwb3J0IGludGVyZmFjZSBJbnZpdGF0aW9uewogICAgIHVzZWQ6IGJvb2xlYW4KIH0KIAorCiBleHBvcnQgaW50ZXJmYWNlIEV2ZW50ewogICAgIG9wZXI6ICJjb21taXQifCJwdXNoIiwKICAgICByZW1vdGU6IHN0cmluZywK',
            account: 'a_execon',
            user: 'maciej.grula@execon.pl',
            project: 'a_execon_devjam_ms'
        },
        six_remote_user_password: {
            gitlog: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKIHNlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyB8IDYgKystLS0tCiAxIGZpbGUgY2hhbmdlZCwgMiBpbnNlcnRpb25zKCspLCA0IGRlbGV0aW9ucygtKQo=',
            oper: 'commit',
            remote: 'https://user:pass@github.com/alkeicam/devjam.git',
            diff: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKZGlmZiAtLWdpdCBhL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyBiL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcwppbmRleCBiNmZkZDQ5Li40ZTBjOWI2IDEwMDY0NAotLS0gYS9zZXJ2aWNlcy9naXRob29rL21hbmFnZXIuanMKKysrIGIvc2VydmljZXMvZ2l0aG9vay9tYW5hZ2VyLmpzCkBAIC0zMzksNyArMzM5LDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgICAgICAvLyBmb3IgbG9jYWwgZ2l0IHJlcG9zaXRvcnkgd2hpY2ggZmFpbHMgbmV3IFVSTCBkbyBub3RoaW5nICAgICAgICAgICAgCiAgICAgICAgIH0KIAotICAgICAgICAKKwogICAgICAgICByZXR1cm4gZXZlbnQ7CiAgICAgfQogCkBAIC0zNjEsOSArMzYxLDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgIAogICAgICAgICB0aGlzLl9jYWxjdWxhdGVFbnRyb3B5U2NvcGUocmVzdWx0KTsKICAgICAgICAgcmVzdWx0LnMgPSB0aGlzLl9zY29yZShyZXN1bHQpOwotICAgICAgICAKLQotICAgICAgICAKKyAgICAKICAgICAgICAgcmV0dXJuIHJlc3VsdDsgICAgICAgIAogICAgIH0KIAo=',
            account: 'a_execon',
            user: 'alkeicam@yahoo.com',
            project: 'wn04l6pv9y'
        },
        seven_remote_apikey: {
            gitlog: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKIHNlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyB8IDYgKystLS0tCiAxIGZpbGUgY2hhbmdlZCwgMiBpbnNlcnRpb25zKCspLCA0IGRlbGV0aW9ucygtKQo=',
            oper: 'commit',
            remote: 'https://ghp_26pVh@github.com/alkeicam/devjam.git',
            diff: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKZGlmZiAtLWdpdCBhL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyBiL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcwppbmRleCBiNmZkZDQ5Li40ZTBjOWI2IDEwMDY0NAotLS0gYS9zZXJ2aWNlcy9naXRob29rL21hbmFnZXIuanMKKysrIGIvc2VydmljZXMvZ2l0aG9vay9tYW5hZ2VyLmpzCkBAIC0zMzksNyArMzM5LDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgICAgICAvLyBmb3IgbG9jYWwgZ2l0IHJlcG9zaXRvcnkgd2hpY2ggZmFpbHMgbmV3IFVSTCBkbyBub3RoaW5nICAgICAgICAgICAgCiAgICAgICAgIH0KIAotICAgICAgICAKKwogICAgICAgICByZXR1cm4gZXZlbnQ7CiAgICAgfQogCkBAIC0zNjEsOSArMzYxLDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgIAogICAgICAgICB0aGlzLl9jYWxjdWxhdGVFbnRyb3B5U2NvcGUocmVzdWx0KTsKICAgICAgICAgcmVzdWx0LnMgPSB0aGlzLl9zY29yZShyZXN1bHQpOwotICAgICAgICAKLQotICAgICAgICAKKyAgICAKICAgICAgICAgcmV0dXJuIHJlc3VsdDsgICAgICAgIAogICAgIH0KIAo=',
            account: 'a_execon',
            user: 'alkeicam@yahoo.com',
            project: 'wn04l6pv9y'
        },
        eight_invalid_no_remote: {
            gitlog: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKIHNlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyB8IDYgKystLS0tCiAxIGZpbGUgY2hhbmdlZCwgMiBpbnNlcnRpb25zKCspLCA0IGRlbGV0aW9ucygtKQo=',
            oper: 'commit',            
            diff: 'Y29tbWl0IGM4ZTQ5MTIxOGQ5MThjY2RlZWI4NTJjMWQxOTc4ZmQxZjQ2MDE5MmMKQXV0aG9yOiBNYWNpZWogR3J1bGEgPG1hY2llai5ncnVsYUBleGVjb24ucGw+CkRhdGU6ICAgTW9uIEp1biAxMCAxNjo0NzowMiAyMDI0ICswMjAwCgogICAgbm8gdGkgY2tldCBpZAoKZGlmZiAtLWdpdCBhL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcyBiL3NlcnZpY2VzL2dpdGhvb2svbWFuYWdlci5qcwppbmRleCBiNmZkZDQ5Li40ZTBjOWI2IDEwMDY0NAotLS0gYS9zZXJ2aWNlcy9naXRob29rL21hbmFnZXIuanMKKysrIGIvc2VydmljZXMvZ2l0aG9vay9tYW5hZ2VyLmpzCkBAIC0zMzksNyArMzM5LDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgICAgICAvLyBmb3IgbG9jYWwgZ2l0IHJlcG9zaXRvcnkgd2hpY2ggZmFpbHMgbmV3IFVSTCBkbyBub3RoaW5nICAgICAgICAgICAgCiAgICAgICAgIH0KIAotICAgICAgICAKKwogICAgICAgICByZXR1cm4gZXZlbnQ7CiAgICAgfQogCkBAIC0zNjEsOSArMzYxLDcgQEAgY2xhc3MgTWFuYWdlciB7CiAgICAgICAgIAogICAgICAgICB0aGlzLl9jYWxjdWxhdGVFbnRyb3B5U2NvcGUocmVzdWx0KTsKICAgICAgICAgcmVzdWx0LnMgPSB0aGlzLl9zY29yZShyZXN1bHQpOwotICAgICAgICAKLQotICAgICAgICAKKyAgICAKICAgICAgICAgcmV0dXJuIHJlc3VsdDsgICAgICAgIAogICAgIH0KIAo=',
            account: 'a_execon',
            user: 'alkeicam@yahoo.com',
            project: 'wn04l6pv9y'
        },
    }
     
}

module.exports = {MOCKS};

