#!/bin/sh
# Installs the current Sideload Readiness release after checking its SHA-256.
set -eu
repo='B-Divyesh/sf-sideload-readiness'
base="https://github.com/$repo/releases/download"
os=$(uname -s)
arch=$(uname -m)
case "$os" in
  Linux) platform=linux ;;
  Darwin) platform=macos ;;
  *) echo "Unsupported system: $os. Use the release page." >&2; exit 1 ;;
esac
case "$arch" in
  x86_64|amd64) arch=x86_64 ;;
  arm64|aarch64) arch=aarch64 ;;
  *) echo "Unsupported CPU: $arch. Use the release page." >&2; exit 1 ;;
esac
version=$(curl -fsSL "https://api.github.com/repos/$repo/releases/latest" | sed -n 's/.*"tag_name":"v\([^"]*\)".*/\1/p' | head -n1)
[ -n "$version" ] || { echo "Could not find a published release. Try again later." >&2; exit 1; }
asset="sideload-readiness-${platform}-${arch}.tar.gz"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -fsSL "$base/v$version/$asset" -o "$tmp/$asset"
curl -fsSL "$base/v$version/SHA256SUMS" -o "$tmp/SHA256SUMS"
expected=$(awk -v file="$asset" '$2==file {print $1}' "$tmp/SHA256SUMS")
[ -n "$expected" ] || { echo "No checksum was published for $asset." >&2; exit 1; }
if command -v sha256sum >/dev/null 2>&1; then actual=$(sha256sum "$tmp/$asset" | awk '{print $1}'); else actual=$(shasum -a 256 "$tmp/$asset" | awk '{print $1}'); fi
[ "$actual" = "$expected" ] || { echo "Checksum did not match. Nothing was installed." >&2; exit 1; }
tar -xzf "$tmp/$asset" -C "$tmp"
install_dir="${HOME}/.local/bin"
mkdir -p "$install_dir"
install -m 755 "$tmp/sideload-readiness" "$install_dir/sideload-readiness"
echo "Installed sideload-readiness to $install_dir/sideload-readiness (SHA-256 verified)."
case ":$PATH:" in *":$install_dir:"*) ;; *) echo "Add $install_dir to PATH, then run: sideload-readiness demo" ;; esac
