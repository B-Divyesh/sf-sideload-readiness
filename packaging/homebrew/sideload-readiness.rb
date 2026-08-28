class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.0/sideload-readiness-macos-aarch64.tar.gz"
  sha256 "d0878a02078dee136d8eb20e17917290945cadcf0578b9ea9e8a8e86454e3a21"
  version "0.1.0"
  license "MIT"

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
