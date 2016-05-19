rm 8tracks-package.zip
zip -r 8tracks-package.zip images src css lib *.html *.png *.mkd manifest.json oauth
echo "A" | unzip 8tracks-package.zip -d 8tracks-package