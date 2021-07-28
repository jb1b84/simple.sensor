# v0 aka super crude mvp

## Back end
- [x] User CRU
- [x] Store readings in db
- [~] Secret management / env file
- [x] Github deployment
- [x] Exception handling
- [ ] Handoff to ES
- [x] Endpoint for retrieving readings

## Front end
- [x] Display recent readings for user

## Device
- [x] Single thermocouple
- [x] Script posts readings every N seconds
- [ ] Github deployment
- [ ] Use command line to add session label/description, init new session, ssh to start

# v1
- [ ] Cleaner deploy to RasPi
- [ ] React front end
- [ ] Batch posting of readings
- [ ] Material Design & Styled Components
- [ ] Sharing code between serverless functions & refactor junk out
- [ ] Refactor ES handoff out to pub/sub
- [ ] Tag based deployment for device vs backend
- [ ] Device runs automatically, move session settings to front end

# vSomedayMaybe
- [ ] tests :(
- [ ] CI/CD
- [ ] Alerting
- [ ] Multiple sensors