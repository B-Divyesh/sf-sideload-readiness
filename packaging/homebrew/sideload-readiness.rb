class SideloadReadiness < Formula
  desc "Read-only Android sideload readiness checks"
  homepage "https://sideload-readiness.sociobot.in"
  version "0.1.3"
  license "MIT"

  on_arm do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.3/sideload-readiness-macos-aarch64.tar.gz"
    sha256 "15df990cae82f96df4a5d89e8fdc692acf400d2e31bbf153b92ee25fdde7085f"
  end

  on_intel do
    url "https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.3/sideload-readiness-macos-x86_64.tar.gz"
    sha256 "90b43cfd234f0dfe65fe2b438d4e96fe32bccd226ad39759bd9c887a8eb15b35"
  end

  def install
    bin.install "sideload-readiness"
  end

  test do
    assert_match "Read-only Android", shell_output("#{bin}/sideload-readiness --help")
  end
end
