#!/run/current-system/sw/bin/zsh
echo "changing dir..."
cd Fun/Projects/e-be-tc

echo "pulling from repo..."
git add .
git stash
git pull
git stash pop

echo "injecting .env..."
mv env .env

echo "init/installing deps using pnpm..."
nix develop --command bash -c "pnpm install"

echo "restarting systemd unit..."
sudo systemctl restart eigen-tc

echo "systemd unit status..."
sudo systemctl status eigen-tc

echo "done!!!"
