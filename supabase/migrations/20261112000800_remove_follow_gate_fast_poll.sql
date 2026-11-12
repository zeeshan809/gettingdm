-- The 10-second follow-gate poll used up Meta's app request limit (error #4):
-- reading DM threads costs Graph calls, and the app's hourly allowance is small
-- until App Review. Taps are picked up by the minute worker instead.
select cron.unschedule('gettingdm-follow-gate');
