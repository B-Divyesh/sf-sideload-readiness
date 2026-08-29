class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.4"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.4/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "b5ab461d53ab829c23fd56da364ed5369461aaf6f0178f5edf3848c492288330"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.4/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "e3a7c02fd347494669d24c46494cb69bbec1c16871eac267acb717c89ce339fb"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
