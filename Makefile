.PHONY: package

SHELL = /bin/bash

package:
	rm -f extension.zip
	zip extension.zip * -x Makefile
