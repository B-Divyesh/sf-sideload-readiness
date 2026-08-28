class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.1"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.1/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "e999964dbe1f06631c341091ad215bdffb907e98d634d9095783babdf32f2fe8"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.1/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "c9b8e7bcaca39c3e8b0c4877d5872526e18ba98855be24c574ff4fb089730bf2"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
