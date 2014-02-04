PROJECT_NAME=CriminalCaseAutoPetFeed

all: install_nodejs build_enyo copy_config release

install_nodejs:
	@if test x`which node` = x; then \
	    sudo apt-get install nodejs; \
	fi

build_enyo:
	node enyo/tools/deploy.js
	@cd deploy/${PROJECT_NAME} && \
	mkdir -p source/assets  && \
	mv lib source && \
	mv assets/pets source/assets

copy_config:
	@sed s/COMMIT_VERSION/`git log -1 --pretty="%H"`/ config.xml > deploy/${PROJECT_NAME}/config.xml

release:
	@cd deploy && \
	zip -r ${PROJECT_NAME}.zip ${PROJECT_NAME} && \
	mv ${PROJECT_NAME}.zip ../${PROJECT_NAME}.`date '+%m%d'`_`date '+%H%M'`.zip

clean:
	rm -rf ${PROJECT_NAME}*.zip
