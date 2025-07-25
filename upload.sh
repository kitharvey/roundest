

BUCKET_NAME="pokemon-images"
LOCAL_FOLDER="./static/pokemon"
echo "Checking folder: $LOCAL_FOLDER"
ls -l "$LOCAL_FOLDER"
for file in "$LOCAL_FOLDER"/*; do
  if [ -f "$file" ]; then
    npx wrangler r2 object put $BUCKET_NAME/pokemon/$(basename "$file") --file "$file" --remote

  else
    echo "Skipping: $file (not a file)"
  fi
done