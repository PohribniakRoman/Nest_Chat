
echo "clean previous build"

rm -rf build/

echo "Installing packages"

npm i
npm run build

echo "Prepearing build..."

rm -rf src/

mv build/* .

echo "Deploing..."

git branch -D build

git checkout -b build

git add -A

git commit -m "deploy"

git push -f origin build

echo "Deployed succesfully"

git checkout main