python3 -m venv ./.venv
source ./.venv/bin/activate
# find . -name 'requirements*.txt' -exec python3 -m pip install -r {} \;
python3 -m pip install -r requirements.lock --no-deps \
	&& echo && echo "Done. run 'source ./.venv/bin/activate' to enter python virtual environment"
