<?php

    session_start();
    require(__DIR__."/../../src/core/SessionManager/index.php");

    $key = "secret".rand(0, 10000);
    $value = rand(0, 10000);
    $newTTL = 60*10;

    describe('Session manager', function() {

        it("Should not have session stored", function() {
            global $key;
            expect(SessionManager::read($key))->toBe(false);
        });

        it("Should write the session", function() {
            global $key, $value;
            expect(SessionManager::write($key, $value))->toBe($value);
        });

        it("Should clear the session", function() {
            global $key, $value;
            expect(SessionManager::clear($key))->toBe(true);
        });

        it("Should not have session stored", function() {
            global $key;
            expect(SessionManager::read($key))->toBe(false);
        });

        it("Should write the session", function() {
            global $key, $value;
            expect(SessionManager::write($key, $value))->toBe($value);
        });

        it("Should get ttl", function() {
            expect(SessionManager::getTTL() > 0)->toBe(true);
        });

        it("Should get timeLeftBeforeExpire", function() {
            expect(SessionManager::timeLeftBeforeExpire() > 0)->toBe(true);
        });

        it("Should set ttl", function() {
            global $newTTL;
            expect(SessionManager::setTTL($newTTL))->toBe($newTTL);
        });

        it("Should get the new ttl", function() {
            global $newTTL;
            expect(SessionManager::getTTL())->toBe($newTTL);
        });

        it("Should destroy all the sessions", function() {
            SessionManager::destroy();
            global $key;
            expect(SessionManager::read($key))->toBe(false);
        });

    });

?>