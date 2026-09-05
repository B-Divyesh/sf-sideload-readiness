class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.5"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.5/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "f373667f0ce85f65c4c3faf47e5399333fa1c9df470ef79941548a70337dd315"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.5/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "398af1781cb8d99debdb16cb507f4f58f05cf429445ba7aa890e83e2e08b7fa3"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
