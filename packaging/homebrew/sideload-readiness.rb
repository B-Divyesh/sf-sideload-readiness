class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.0"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.0/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "d0878a02078dee136d8eb20e17917290945cadcf0578b9ea9e8a8e86454e3a21"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.0/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "1dd5054bc66fae60ac9354fc0a74167d94ed1bd5a1522326359396e556b37867"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
