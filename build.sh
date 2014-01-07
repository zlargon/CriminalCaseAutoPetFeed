#!/bin/sh

DIR=`pwd`
PROJECT_NAME=CriminalCaseAutoPetFeed

rm $PROJECT_NAME*.zip

# build enyo
./enyo/tools/deploy.js

# fix the access image path error
cd deploy/$PROJECT_NAME
mkdir -p source/assets
mv lib source
mv assets/pets source/assets

# zip
cd ..
zip -r $PROJECT_NAME.zip $PROJECT_NAME
mv $PROJECT_NAME.zip $DIR/$PROJECT_NAME.`date '+%m%d'`_`date '+%H%M'`.zip
