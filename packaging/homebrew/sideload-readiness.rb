class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.2"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.2/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "416c47ad5bd1eadd11eaa669007e970da2b06e9218d3fc7b2930aac1c70ee699"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.2/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "a2fc822d6bf5e21f139672716e36645a8133203b75ea45a6831bfbbae0bc01fc"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
