export GOPATH=$(abspath .)

PROGRAMS = \
	c2-module \
	c2-doc \
	c2-notify

all : $(PROGRAMS)

$(PROGRAMS) :
	go install ./src/github.com/c2stack/c2g/cmd/$@

.PHONY: test
test : unit-test api-test

unit-test :
	go test ./src/github.com/c2stack/c2g/...

api-test : device-api-test proxy-api-test store-api-test

%-api-test :
	cd test/$*; gulp
