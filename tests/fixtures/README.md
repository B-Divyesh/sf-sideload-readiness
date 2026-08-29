# Signer regression fixtures

`aosp-v2-signed.apk.b64` is the base64 form of
`v2-only-with-rsa-pkcs1-sha256-1024.apk` from Android's official `apksig`
test suite at commit `a76268432eebbc270104b06febae114302471539`. The upstream
project is Apache-2.0 licensed. Its signer certificate SHA-256 is
`bc5e64eab1c4b5137c0fbc5ed05850b3a148d1c41775cffa4d96eea90bdd0eb8`.

`stock-package-signatures.txt` records the `PackageSignatures.toString()`
shape emitted by stock AOSP. It deliberately contains only Java's short
signature hash, not a certificate digest. The CLI must get the certificate
from the installed APK instead of treating this output as signer evidence.
